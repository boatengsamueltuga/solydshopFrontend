import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: { count: 0 },
    reducers: {
        setCartCount: (state, action) => { state.count = action.payload; },
        incrementCartCount: (state) => { state.count += 1; },
        decrementCartCount: (state) => { state.count = Math.max(0, state.count - 1); },
        resetCartCount: (state) => { state.count = 0; },
    },
});

export const { setCartCount, incrementCartCount, decrementCartCount, resetCartCount } = cartSlice.actions;
export default cartSlice.reducer;
