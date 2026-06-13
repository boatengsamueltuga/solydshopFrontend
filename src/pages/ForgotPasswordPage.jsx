import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();
        setLoading(true);

        try {

            await api.post("/auth/forgot-password", { email });

            toast.success("If that email exists, a reset link has been sent.");
            setEmail("");

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">

            <div className="w-full max-w-md bg-gray-900 text-white p-6 sm:p-8 rounded-lg shadow-lg">

                <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center">
                    Forgot Password
                </h1>

                <p className="text-gray-400 text-sm text-center mb-6">
                    Enter your email and we'll send you a reset link.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
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
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>

                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                    Remember your password?{" "}
                    <Link to="/login" className="text-blue-400 hover:underline">
                        Login
                    </Link>
                </p>

            </div>

        </div>
    );
};

export default ForgotPasswordPage;
