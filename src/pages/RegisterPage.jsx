import { useState } from "react";

import api from "../api/api";

import Loader from "../components/Loader";
import toast from "react-hot-toast";

import { FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";

const passwordRules = [
    { id: "length",    label: "At least 8 characters",       test: (p) => p.length >= 8 },
    { id: "uppercase", label: "At least 1 uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { id: "lowercase", label: "At least 1 lowercase letter", test: (p) => /[a-z]/.test(p) },
    { id: "number",    label: "At least 1 number",           test: (p) => /[0-9]/.test(p) },
    { id: "special",   label: "At least 1 special character (@$!%*?&#)", test: (p) => /[@$!%*?&#]/.test(p) },
];

const RegisterPage = () => {

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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

    const allRulesPassed = passwordRules.every((rule) => rule.test(formData.password));

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!allRulesPassed) {
            toast.error("Password does not meet the requirements.");
            return;
        }

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

        <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">

            <div className="w-full max-w-md bg-gray-900 text-white p-6 sm:p-8 rounded-lg shadow-lg">

                <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
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

                    {/* Password rules checklist */}
                    {formData.password.length > 0 && (
                        <ul className="text-sm flex flex-col gap-1 bg-gray-800 p-3 rounded">
                            {passwordRules.map((rule) => {
                                const passed = rule.test(formData.password);
                                return (
                                    <li key={rule.id} className={`flex items-center gap-2 ${passed ? "text-green-400" : "text-red-400"}`}>
                                        {passed ? <FaCheck size={12} /> : <FaTimes size={12} />}
                                        {rule.label}
                                    </li>
                                );
                            })}
                        </ul>
                    )}

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
