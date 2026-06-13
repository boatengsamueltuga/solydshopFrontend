import { useState } from "react";

import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";

import api from "../api/api";

import toast from "react-hot-toast";

import { FaEye, FaEyeSlash } from "react-icons/fa";

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

    const [showPassword, setShowPassword] = useState(false);

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

        <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">

            <div className="w-full max-w-md bg-gray-900 text-white p-6 sm:p-8 rounded-lg shadow-lg">

                <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
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

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full p-3 pr-11 rounded bg-gray-800 outline-none disabled:opacity-50"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                        >
                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>

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

                    <div className="text-right">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-blue-400 hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                </form>

            </div>

        </div>
    );
};

export default LoginPage;
