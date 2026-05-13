import { Routes, Route } from "react-router-dom";

import { useEffect } from "react";

import { useDispatch } from "react-redux";

import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import ProtectedRoute from "./components/ProtectedRoute";

import { restoreUser } from "./features/auth/authSlice";

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
                    restoreUser({
                        email: response.data
                    })
                );

            } catch (error) {

                console.log("No active session");
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