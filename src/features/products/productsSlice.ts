import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { Product } from "./types";


// l'url de notre api avec quoi nous devons etablir la connection
const API_URL = 'https://dummyjson.com/products';

// fonction pour recuperer tous les produis 
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async() => {
        const response = await axios.get(API_URL)
        return response.data.products
    }
)

// l'etat initiale de notre magasin
interface ProductsState{
    items: Product[];
    status: 'idle'| 'loading' |'succeeded' | 'failed';
    error: string | null

}

const initialState: ProductsState = {
    items: [],
    status: 'idle',
    error: null
}

//ceer notre tiroire pour ranger les produits 

const ProductSlice = createSlice({
    name:"products",
    initialState,
    reducers:{},
    extraReducers:(builder) => {
        builder
            .addCase(fetchProducts.pending, (state)  => {
                state.status = 'loading';
            } )
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            } )
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Something wen wrong'
            } )
    }
})

export default ProductSlice.reducer