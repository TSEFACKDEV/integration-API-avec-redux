import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import type { ApiParams, Product } from "./types";

// l'url de notre api avec quoi nous devons etablir la connection
const API_URL = "https://dummyjson.com/products";

// fonction pour recuperer tous les produis & Parametre pour l'API
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params: ApiParams, { rejectWithValue }) => {
    try {
      let url = `${API_URL}?`;
      if (params.search) url += `q=${params.search}&`;
      if (params.category) url += `category=${params.category}&`;
      if (params.skip) url += `skip=${params.skip}&`;
      if (params.limit) url += `limit=${params.limit}&`;
      if (params.select) url += `select=${params.select.join(",")}&`;
      
      const response = await axios.get(url);
      
      // Vérification de la structure de la réponse
      if (!response.data.products || !Array.isArray(response.data.products)) {
        throw new Error("Structure de réponse invalide");
      }
      
      return {
        products: response.data.products,
        total: response.data.total,
      };
    } catch (error: any) {
      console.error("Erreur dans fetchProducts:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// l'etat initiale de notre magasin
interface ProductsState {
  items: Product[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  //ajoutons les parametre a l'etat du produit
  total: number;
  params: ApiParams;
}

const initialState: ProductsState = {
  items: [],
  status: "idle",
  error: null,
  total: 0,
  params: {
    limit: 10,
    skip: 0,
    search: "",
    category: "",
  },
};

//ceer notre tiroire pour ranger les produits

const ProductSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setParams: (state, action: PayloadAction<Partial<ApiParams>>) => {
      state.params = { ...state.params, ...action.payload };
    },
    resetParams: (state) => {
      state.params = initialState.params;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.products;
        state.total = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Something wen wrong";
      });
  },
});
export const { setParams, resetParams } = ProductSlice.actions;
export default ProductSlice.reducer;
