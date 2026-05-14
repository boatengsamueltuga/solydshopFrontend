import { useState } from "react";
import api from "../api/api";

const RegisterPage = () => {

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

        try {

            const response = await api.post(
                "/auth/register",
                formData
            );

            console.log(response.data);

            alert("Registration successful");
            
            setFormData({
            name: "",
            email: "",
            password: ""
});

        } catch (error) {

            console.log(error);

            alert(
    error.response?.data?.message ||
    error.response?.data ||
    "Registration failed"
);
        }
    };

    return (

        <div className="flex justify-center items-center min-h-screen">

            <div className="w-[400px] bg-gray-900 text-white p-8 rounded-lg">

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
                        className="p-3 rounded bg-gray-800 outline-none"
                    />

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
                        className="bg-green-600 hover:bg-green-700 p-3 rounded font-bold"
                    >
                        Register
                    </button>

                </form>

            </div>

        </div>
    );
};

export default RegisterPage;