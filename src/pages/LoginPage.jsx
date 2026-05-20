import { useState } from "react";

import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import api from "../api/api";

import toast from "react-hot-toast";

import {
    loginStart,
    loginSuccess,
    loginFailure
} from "../features/auth/authSlice";


const LoginPage = () => {

    const dispatch = useDispatch();

    const {
        isAuthenticated,
        loading
    } = useSelector(
        (state) => state.auth
    );

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        dispatch(loginStart());

        try {

            await api.post(
                "/auth/login",
                formData
            );

            const userResponse = await api.get(
                "/auth/me"
            );

            dispatch(
                loginSuccess(userResponse.data)
            );

            toast.success("Login successful");

            setFormData({
                email: "",
                password: ""
            });

        } catch (error) {

            dispatch(
                loginFailure(
                    error.response?.data ||
                    "Login failed"
                )
            );

            console.log(error);
        }
    };

    // Redirect authenticated users
    if (isAuthenticated) {

        return <Navigate to="/" />;
    }

    return (

        <div className="flex justify-center items-center min-h-screen bg-gray-100">

            <div className="w-[400px] bg-gray-900 text-white p-8 rounded-lg shadow-lg">

                <h1 className="text-4xl font-bold mb-6 text-center">
                    Login
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        className="p-3 rounded bg-gray-800 outline-none disabled:opacity-50"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        className="p-3 rounded bg-gray-800 outline-none disabled:opacity-50"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className={`p-3 rounded font-bold transition ${
                            loading
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

            </div>

        </div>
    );
};

export default LoginPage;