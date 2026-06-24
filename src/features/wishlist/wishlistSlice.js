import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items: [],
    loading: false,
    error: null,
};

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState,
    reducers: {
        setWishlistLoading: (state) => {
            state.loading = true;
            state.error = null;
        },
        setWishlistItems: (state, action) => {
            state.loading = false;
            state.items = action.payload;
        },
        setWishlistError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        clearWishlist: (state) => {
            state.items = [];
            state.loading = false;
            state.error = null;
        },
        optimisticAddItem: (state, action) => {
            const exists = state.items.some((i) => i.productId === action.payload.productId);
            if (!exists) state.items.push(action.payload);
        },
        optimisticRemoveItem: (state, action) => {
            state.items = state.items.filter((i) => i.productId !== action.payload);
        },
    },
});

export const {
    setWishlistLoading,
    setWishlistItems,
    setWishlistError,
    clearWishlist,
    optimisticAddItem,
    optimisticRemoveItem,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
