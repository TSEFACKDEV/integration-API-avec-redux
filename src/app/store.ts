
// la creation de notre store (magasin) ou on rage tous les donnes dont on souhaite gerer l'etat
import { configureStore } from "@reduxjs/toolkit";
import productsReducer from '../features/products/productsSlice'
export const store = configureStore({
    reducer:{
        products: productsReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;