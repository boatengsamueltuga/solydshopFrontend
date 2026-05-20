import { useState } from "react";

import api from "../api/api";

import Loader from "../components/Loader";
import toast from "react-hot-toast";

const RegisterPage = () => {

    // Registration loading state
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
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

        setLoading(true);

        try {

            const response = await api.post(
                "/auth/register",
                formData
            );

            console.log(response.data);

            toast.success("Registration successful");

            setFormData({
                name: "",
                email: "",
                password: ""
            });

        } catch (error) {

            console.log(error);

                 toast.error(
                 error.response?.data?.message ||
                 error.response?.data ||
                 "Registration failed"
);

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="flex justify-center items-center min-h-screen bg-gray-100">

            <div className="w-[400px] bg-gray-900 text-white p-8 rounded-lg shadow-lg">

                <h1 className="text-4xl font-bold mb-6 text-center">
                    Register
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >

                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={loading}
                        className="p-3 rounded bg-gray-800 outline-none disabled:opacity-50"
                    />

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
                        className={`p-3 rounded font-bold transition flex justify-center items-center gap-3 ${
                            loading
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                        }`}
                    >

                        {loading && <Loader />}

                        {loading
                            ? "Registering..."
                            : "Register"}

                    </button>

                </form>

            </div>

        </div>
    );
};

export default RegisterPage;