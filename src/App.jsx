import { Routes, Route } from "react-router-dom";

import { useEffect } from "react";

import { useDispatch } from "react-redux";

import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Added CartPage import
import CartPage from "./pages/CartPage";

// Added OrdersPage import
import OrdersPage from "./pages/OrdersPage";

// Added SellerDashboardPage import
import SellerDashboardPage from "./pages/SellerDashboardPage";

// Added AdminDashboardPage import
import AdminDashboardPage from "./pages/AdminDashboardPage";
// Added AdminProductsPage import
import AdminProductsPage from "./pages/AdminProductsPage";

import ProtectedRoute from "./components/ProtectedRoute";

import {
    restoreUser,
    setInitialized
} from "./features/auth/authSlice";

import api from "./api/api";

function App() {

    const dispatch = useDispatch();

    useEffect(() => {

        const restoreSession = async () => {

            try {

                const response = await api.get(
                    "/auth/me"
                );

                dispatch(
                    restoreUser(response.data)
                );

            } catch (error) {

                console.log("No active session");

            } finally {

                dispatch(
                    setInitialized()
                );
            }
        };

        restoreSession();

    }, [dispatch]);

    return (

        <div>

            <Navbar />

            <Routes>

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <HomePage />
                        </ProtectedRoute>
                    }
                />

                {/* Added Cart Route */}
                <Route
                    path="/cart"
                    element={
                        <ProtectedRoute>
                            <CartPage />
                        </ProtectedRoute>
                    }
                />

                {/* Added Orders Route */}
                <Route
                    path="/orders"
                    element={
                        <ProtectedRoute>
                            <OrdersPage />
                        </ProtectedRoute>
                    }
                />

                {/* Added Seller Dashboard Route */}
                <Route
                    path="/seller/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["ROLE_SELLER"]}>
                            <SellerDashboardPage />
                        </ProtectedRoute>
                    }
                />

                {/* Added Admin Dashboard Route */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                            <AdminDashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/products"
                    element={
                        <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                            <AdminProductsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/register"
                    element={<RegisterPage />}
                />

            </Routes>

        </div>
    );
}

export default App;