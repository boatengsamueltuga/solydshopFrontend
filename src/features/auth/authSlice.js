import { createSlice } from "@reduxjs/toolkit";

const initialState = {

    user: null,

    isAuthenticated: false,

    loading: false,

    isInitialized: false,

    error: null
};

const authSlice = createSlice({

    name: "auth",

    initialState,

    reducers: {

        loginStart: (state) => {

            state.loading = true;

            state.error = null;
        },

        loginSuccess: (state, action) => {

            state.loading = false;

            state.isAuthenticated = true;

            state.user = action.payload;
        },

        loginFailure: (state, action) => {

            state.loading = false;

            state.error = action.payload;
        },

        logoutSuccess: (state) => {

            state.user = null;

            state.isAuthenticated = false;

            state.loading = false;

            state.error = null;
        },

        restoreUser: (state, action) => {

            state.isAuthenticated = true;

            state.user = action.payload;
        },

        setInitialized: (state) => {

            state.isInitialized = true;
        },
    }
});

export const {

    loginStart,
    loginSuccess,
    restoreUser,
    loginFailure,
    logoutSuccess,
    setInitialized

} = authSlice.actions;

export default authSlice.reducer;