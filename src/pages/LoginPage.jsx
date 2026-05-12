import { useState } from "react";

import { useDispatch } from "react-redux";

import {
    loginStart,
    loginSuccess,
    loginFailure
} from "../features/auth/authSlice";

import api from "../api/api";

const LoginPage = () => {

    const dispatch = useDispatch();

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

            const response = await api.post(
                "/auth/login",
                formData
            );

            dispatch(
                loginSuccess({
                    email: formData.email
                })
            );

            console.log(response.data);
            alert("Login successful");

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

            alert(
                error.response?.data?.message ||
                error.response?.data ||
                error.message ||
                "Login failed"
            );
        }
    };

    return (

        <div className="flex justify-center items-center min-h-screen">

            <div className="w-[400px] bg-gray-900 text-white p-8 rounded-lg">

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
                        className="p-3 rounded bg-gray-800 outline-none"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="p-3 rounded bg-gray-800 outline-none"
                    />

                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold"
                    >
                        Login
                    </button>

                </form>

            </div>

        </div>
    );
};

export default LoginPage;