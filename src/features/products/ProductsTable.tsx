import React, { useCallback, useEffect, useMemo, useState, type ReactEventHandler, type ReactHTMLElement } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../app/hook";
import { fetchProducts, resetParams, setParams } from "./productsSlice";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import type { Product } from "./types";
import axios from "axios";
import {
  FaChevronUp,
  FaChevronDown,
  FaSort,
  FaSearch,
  FaFilter,
  FaUndo,
} from "react-icons/fa";

const ProductsTable = () => {
  const dispatch = useDispatch();
  const { items, total, status, params } = useAppSelector(
    (state) => state.products
  );

  // États pour TanStack Table
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilter] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [categories, setCategories] = useState<string[]>([]); // Initialisé avec tableau vide
  const [searchInput, setSearchInput] = useState(""); // Nouvel état pour la valeur temporaire de recherche

  // Fonction pour gérer le délai de recherche
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value); // Mettre à jour la valeur affichée dans l'input
    
    // Annuler le timeout précédent s'il existe
    const timeoutId = setTimeout(() => {
      setGlobalFilter(value); // Mettre à jour le filtre global après 500ms
    }, 5000);
    
    return () => clearTimeout(timeoutId); // Nettoyage du timeout
  }, []);

  // Colonnes de la table
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "thumbnail",
        header: "",
        cell: (info) => (
          <img
            src={info.getValue() as string}
            alt="Thumbnail"
            className="w-10 h-10 rounded"
          />
        ),
        size: 70,
      },
      {
        accessorKey: "title",
        header: "Nom du produit",
        cell: (info) => {
          const product = info.row.original;
          return (
            <div>
              <div className="font-medium">{product.title} </div>
              <div className="text-sm text-gray-500">{product.brand} </div>
            </div>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Prix",
        cell: (info) => `$${info.getValue()}`,
      },
      {
        accessorKey: "rating",
        header: "Note",
        cell: (info) => (
          <div className="flex items-center">
            <span>{info.getValue() as number} </span>
            <div className="rating-stars">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-${
                    i < Math.floor(info.getValue() as number)
                      ? "yellow"
                      : "gray"
                  }-500`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: (info) => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              (info.getValue() as number) > 50
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            } `}
          >
            {info.getValue() as number}
          </span>
        ),
      },
      {
        accessorKey: "category",
        header: "Catégorie",
        cell: (info) => (
          <span className="capitalize"> {info.getValue() as string} </span>
        ),
      },
    ],
    []
  );

  // Initialisation - récupération des catégories
  useEffect(() => {
    axios
      .get("https://dummyjson.com/products/categories")
      .then((response) => {
        // Vérifiez la structure des données reçues
        console.log("Catégories reçues:", response.data);
        // Adaptez en fonction de la structure réelle
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          console.error("Structure de données inattendue pour les catégories");
          setCategories([]);
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des catégories:", error);
        setCategories([]);
      });
  }, []);

  // Configuration de la table
  const table = useReactTable({
    data: items,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilter,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / params.limit),
  });

  // Gestion du changement de paramètres
  useEffect(() => {
    const newParams = {
      ...params,
      search: globalFilter,
      skip: table.getState().pagination.pageIndex * params.limit,
      category:
        (columnFilters.find((f) => f.id === "category")?.value as string) || "",
    };
    dispatch(setParams(newParams));
  }, [globalFilter, columnFilters, table.getState().pagination.pageIndex]);

  // Chargement des données quand les paramètres changent
  useEffect(() => {
    dispatch(fetchProducts(params));
  }, [params]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestion des produits</h1>

      {/* Barre de recherche et filtre */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un produit..."
            className="pl-10 pr-4 py-2 border rounded-md w-full"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaFilter className="text-gray-400" />
          </div>
          <select
            className="pl-10 pr-4 py-2 border rounded-md appearance-none"
            value={columnFilters.find((f) => f.id === "category")?.value || ""}
            onChange={(e) => {
              setColumnFilter([
                ...columnFilters.filter((f) => f.id !== "category"),
                { id: "category", value: e.target.value },
              ]);
            }}
          >
            <option value="">Toutes catégories</option>
            {categories.map((category) => {
              // Gestion des catégories qui pourraient être des strings ou des objets
              const categoryValue =
                typeof category === "string"
                  ? category
                  : category.slug || category.name || "";
              const categoryLabel =
                typeof category === "string"
                  ? category.charAt(0).toUpperCase() + category.slice(1)
                  : category.name || category.slug || "";

              return (
                <option key={categoryValue} value={categoryValue}>
                  {categoryLabel}
                </option>
              );
            })}
          </select>
        </div>

        <button
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center gap-2"
          onClick={() => {
            setGlobalFilter("");
            setSearchInput("");
            setColumnFilter([]);
            dispatch(resetParams());
          }}
        >
          <FaUndo /> Réinitialiser
        </button>
      </div>

      {/* Tableau */}
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ width: header.getSize() }}
                  >
                    <div className="flex items-center">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: <FaChevronUp className="ml-1 h-3 w-3" />,
                        desc: <FaChevronDown className="ml-1 h-3 w-3" />,
                      }[header.column.getIsSorted() as string] ?? (
                        <FaSort className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {status === "loading" ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center">
                  Chargement...
                </td>
              </tr>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center">
                  Aucun produit trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          Page {table.getState().pagination.pageIndex + 1} sur{" "}
          {table.getPageCount()} • {total} produits au total
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </button>

          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </button>
        </div>
        <select
          className="px-2 py-1 border rounded"
          value={params.limit}
          onChange={(e) => {
            dispatch(setParams({ limit: Number(e.target.value), skip: 0 }));
          }}
        >
          {[5, 10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Afficher {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ProductsTable;