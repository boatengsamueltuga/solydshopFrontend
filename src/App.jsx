import { Routes, Route } from "react-router-dom";

import { useEffect } from "react";

import { useDispatch } from "react-redux";

import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Added CartPage import
import CartPage from "./pages/CartPage";

// Added CheckoutPage import
import CheckoutPage from "./pages/CheckoutPage";

// Added OrdersPage import
import OrdersPage from "./pages/OrdersPage";

// Added SellerDashboardPage import
import SellerDashboardPage from "./pages/SellerDashboardPage";

// Added AdminDashboardPage import
import AdminDashboardPage from "./pages/AdminDashboardPage";
// Added AdminProductsPage import
import AdminProductsPage from "./pages/AdminProductsPage";
// Added AdminCategoriesPage import
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
// Added AdminOrdesPage import
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import ProductDetailPage from "./pages/ProductDetailPage";

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

                {/* Added Checkout Route */}
                <Route
                    path="/checkout"
                    element={
                        <ProtectedRoute>
                            <CheckoutPage />
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
                {/* Added Admin Products Route */}
                <Route
                    path="/admin/products"
                    element={
                        <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                            <AdminProductsPage />
                        </ProtectedRoute>
                    }
                />
                {/* Added Admin Categories Route */}
                <Route
                    path="/admin/categories"
                    element={
                        <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                            <AdminCategoriesPage />
                        </ProtectedRoute>
                    }
                />
                {/* Added Admin Orders Route */}
                  <Route
                        path="/admin/orders"
                        element={
                            <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                                <AdminOrdersPage />
                            </ProtectedRoute>
                    }
                 />
                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                            <AdminUsersPage />
                        </ProtectedRoute>
                    }
                />
                {/* Product Detail Route */}
                <Route
                    path="/products/:id"
                    element={
                        <ProtectedRoute>
                            <ProductDetailPage />
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

                <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                />

                <Route
                    path="/reset-password"
                    element={<ResetPasswordPage />}
                />

            </Routes>

        </div>
    );
}

export default App;