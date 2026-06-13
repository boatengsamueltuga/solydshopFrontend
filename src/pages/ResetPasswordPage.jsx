import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/api";
import toast from "react-hot-toast";

import { FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";

const passwordRules = [
    { id: "length",    label: "At least 8 characters",       test: (p) => p.length >= 8 },
    { id: "uppercase", label: "At least 1 uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { id: "lowercase", label: "At least 1 lowercase letter", test: (p) => /[a-z]/.test(p) },
    { id: "number",    label: "At least 1 number",           test: (p) => /[0-9]/.test(p) },
    { id: "special",   label: "At least 1 special character (@$!%*?&#)", test: (p) => /[@$!%*?&#]/.test(p) },
];

const ResetPasswordPage = () => {

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const allRulesPassed = passwordRules.every((rule) => rule.test(newPassword));
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!token) {
            toast.error("Invalid or missing reset token.");
            return;
        }

        if (!allRulesPassed) {
            toast.error("Password does not meet the requirements.");
            return;
        }

        if (!passwordsMatch) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {

            await api.post("/auth/reset-password", { token, newPassword });

            toast.success("Password reset successfully. Please login.");
            navigate("/login");

        } catch (error) {

            console.log(error);
            toast.error(
                typeof error.response?.data === "string"
                    ? error.response.data
                    : "Invalid or expired reset token."
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">

            <div className="w-full max-w-md bg-gray-900 text-white p-6 sm:p-8 rounded-lg shadow-lg">

                <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center">
                    Reset Password
                </h1>

                <p className="text-gray-400 text-sm text-center mb-6">
                    Enter your new password below.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >

                    {/* New Password */}
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="newPassword"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={loading}
                            required
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

                    {/* Password rules checklist — always visible */}
                    <ul className="text-sm flex flex-col gap-1 bg-gray-800 p-3 rounded">
                        {passwordRules.map((rule) => {
                            const passed = rule.test(newPassword);
                            return (
                                <li key={rule.id} className={`flex items-center gap-2 ${passed ? "text-green-400" : "text-gray-400"}`}>
                                    {passed ? <FaCheck size={12} /> : <FaTimes size={12} />}
                                    {rule.label}
                                </li>
                            );
                        })}
                    </ul>

                    {/* Confirm Password */}
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                            required
                            className="w-full p-3 pr-11 rounded bg-gray-800 outline-none disabled:opacity-50"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                        >
                            {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>

                    {/* Passwords match indicator */}
                    {confirmPassword.length > 0 && (
                        <p className={`text-sm flex items-center gap-2 ${passwordsMatch ? "text-green-400" : "text-red-400"}`}>
                            {passwordsMatch
                                ? <><FaCheck size={12} /> Passwords match</>
                                : <><FaTimes size={12} /> Passwords do not match</>
                            }
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`p-3 rounded font-bold transition ${
                            loading
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>

                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                    Back to{" "}
                    <Link to="/login" className="text-blue-400 hover:underline">
                        Login
                    </Link>
                </p>

            </div>

        </div>
    );
};

export default ResetPasswordPage;
