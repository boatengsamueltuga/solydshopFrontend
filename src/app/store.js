import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import productReducer from "../features/product/productSlice";
import wishlistReducer from "../features/wishlist/wishlistSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        wishlist: wishlistReducer,
    },
});
