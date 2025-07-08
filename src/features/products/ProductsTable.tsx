import React, { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../app/hook";
import { fetchProducts } from "./productsSlice";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {ColumnDef} from "@tanstack/react-table"
import type { Product } from "./types";

const ProductsTable = () => {
  const dispatch = useDispatch();
  const products = useAppSelector((state) => state.products.items);
  const status = useAppSelector((state) => state.products.status);

  //on vas chercher le produit quant le composant est monte
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);
  // on explique a la table a quoi ressemble nos colones
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        header: "Produits",
        accessorKey: "title",
        cell: (info) => {
          const product = info.row.original;
          return (
            <div className="flex items-center">
              <img
                src={product.thumbnail}
                alt={product.title}
                className="w-16 h-16 rounded mr-3"
              />
              <div>
                <div className="font-medium">{product.title} </div>
                <div className="text-sm text-gray-500">{product.brand} </div>
              </div>
            </div>
          );
        },
      },
      {
        header: "Prix",
        accessorKey: "price",
        // cell: (info) => `$ ${info.getValue}`,
      },
      {
        header: "Reduction",
        accessorKey: "discountPercentage",
        // cell: (info) => `${info.getValue} %`,
      },
      {
        header: "Stock",
        accessorKey: "stock",
      },
      {
        header: "Note",
        accessorKey: "rating",
      },
      {
        header: "Categorie",
        accessorKey: "category",
      },
    ],
    []
  );
  // on creer notre table
  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (status === "loading") {
    return <div className="text-center py-10">Chargement des produits</div>;
  }
  if (status === "failed") {
    return (
      <div className="text-center py-10">
        {" "}
        Erreur lor du Chargement des produits
      </div>
    );
  }
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Nos Produits</h2>
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full devide-y devide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border" >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="border" >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}{" "}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white devide-y devide-gray-200">
            {
                table.getRowModel().rows.map((row) =>(
                    <tr key={row.id} className="hover:bg-gray-50 border">
                        {
                            row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="border">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))
                        }
                    </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsTable;
