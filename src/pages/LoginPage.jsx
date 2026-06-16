import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import api from "../api/api";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { loginStart, loginSuccess, loginFailure } from "../features/auth/authSlice";

const C = {
    bg:        "#0D1B2A",
    card:      "#1B2A3D",
    border:    "#2D4263",
    primary:   "#8ed5ff",
    text:      "#dee3e8",
    textMuted: "#bdc8d1",
    textDim:   "#87929a",
    inputBg:   "#243447",
    btnBg:     "#38bdf8",
    btnText:   "#003a57",
};

const LoginPage = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, loading } = useSelector((s) => s.auth);

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(loginStart());
        try {
            await api.post("/auth/login", formData);
            const userResponse = await api.get("/auth/me");
            dispatch(loginSuccess(userResponse.data));
            toast.success("Login successful");
            setFormData({ email: "", password: "" });
        } catch (error) {
            dispatch(loginFailure(error.response?.data || "Login failed"));
            console.log(error);
        }
    };

    if (isAuthenticated) return <Navigate to="/" />;

    return (
        <div
            className="relative flex items-center justify-center min-h-screen px-4"
            style={{ background: C.bg, fontFamily: "Inter, sans-serif" }}
        >
            {/* Subtle grid overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`,
                    backgroundSize: "32px 32px",
                }}
            />

            {/* Auth card */}
            <div
                className="relative z-10 w-full"
                style={{
                    maxWidth: "420px",
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: "8px",
                    padding: "32px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                }}
            >
                {/* Heading */}
                <div className="text-center mb-6">
                    <h1 style={{ fontSize: "28px", fontWeight: 700, color: C.primary, marginBottom: "6px" }}>
                        Welcome Back
                    </h1>
                    <p style={{ fontSize: "14px", color: C.textMuted }}>
                        Sign in to your SolydShop account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            style={{
                                display: "block",
                                fontSize: "11px",
                                fontWeight: 700,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                                color: C.textMuted,
                                marginBottom: "6px",
                            }}
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="user@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                            style={{
                                width: "100%",
                                background: C.inputBg,
                                border: `1px solid ${C.border}`,
                                borderRadius: "6px",
                                padding: "10px 12px",
                                fontSize: "14px",
                                color: C.text,
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                            onFocus={(e) => (e.target.style.borderColor = C.primary)}
                            onBlur={(e) => (e.target.style.borderColor = C.border)}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex justify-between items-center" style={{ marginBottom: "6px" }}>
                            <label
                                htmlFor="password"
                                style={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    letterSpacing: "0.05em",
                                    textTransform: "uppercase",
                                    color: C.textMuted,
                                }}
                            >
                                Password
                            </label>
                            <Link
                                to="/forgot-password"
                                style={{ fontSize: "13px", color: C.primary, textDecoration: "none" }}
                                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    background: C.inputBg,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: "6px",
                                    padding: "10px 40px 10px 12px",
                                    fontSize: "14px",
                                    color: C.text,
                                    outline: "none",
                                    boxSizing: "border-box",
                                }}
                                onFocus={(e) => (e.target.style.borderColor = C.primary)}
                                onBlur={(e) => (e.target.style.borderColor = C.border)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                style={{ background: "none", border: "none", cursor: "pointer", color: C.textDim }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = C.textMuted)}
                                onMouseLeave={(e) => (e.currentTarget.style.color = C.textDim)}
                            >
                                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            background: loading ? C.border : C.btnBg,
                            color: C.btnText,
                            border: "none",
                            borderRadius: "6px",
                            padding: "12px",
                            fontSize: "13px",
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            cursor: loading ? "not-allowed" : "pointer",
                            marginTop: "4px",
                            fontFamily: "Inter, sans-serif",
                            transition: "opacity 0.15s",
                        }}
                        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                        {loading ? "Signing in..." : "Sign In →"}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-5">
                    <div style={{ flex: 1, height: "1px", background: C.border }} />
                    <span
                        style={{
                            padding: "0 12px",
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            color: C.textDim,
                        }}
                    >
                        or
                    </span>
                    <div style={{ flex: 1, height: "1px", background: C.border }} />
                </div>

                {/* Register link */}
                <p className="text-center" style={{ fontSize: "14px", color: C.textMuted }}>
                    Don&apos;t have an account?{" "}
                    <Link
                        to="/register"
                        style={{ color: C.primary, fontWeight: 600, textDecoration: "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
