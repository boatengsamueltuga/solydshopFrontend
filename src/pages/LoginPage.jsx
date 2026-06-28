import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import api from "../api/api";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { loginStart, loginSuccess, loginFailure } from "../features/auth/authSlice";
import { setWishlistItems } from "../features/wishlist/wishlistSlice";
import AuthLayout from "../components/layouts/AuthLayout";

const INPUT = {
    width: "100%", background: "var(--surface-mid)",
    border: "1px solid var(--border)", borderRadius: "var(--r-sm)",
    padding: "10px var(--space-3)", fontSize: "var(--text-sm)",
    color: "var(--text)", fontFamily: "var(--font-body)",
    outline: "none", boxSizing: "border-box",
    transition: "border-color var(--duration-fast)",
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
            api.get("/wishlist")
                .then((r) => dispatch(setWishlistItems(r.data)))
                .catch(() => {});
            toast.success("Login successful");
            setFormData({ email: "", password: "" });
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data || "Invalid email or password.";
            dispatch(loginFailure(msg));
            toast.error(typeof msg === "string" ? msg : "Invalid email or password.");
        }
    };

    if (isAuthenticated) return <Navigate to="/" />;

    return (
        <AuthLayout>
            {/* Heading */}
            <div style={{ marginBottom: "var(--space-8)" }}>
                <h2 style={{
                    fontFamily: "var(--font-display)", fontWeight: 700,
                    fontSize: "var(--text-2xl)", color: "var(--text)",
                    letterSpacing: "-0.01em", margin: "0 0 var(--space-2)",
                }}>
                    Welcome back
                </h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-3)" }}>
                    Sign in to your SolydShop account
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

                {/* Email */}
                <div>
                    <label htmlFor="email" style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "var(--space-2)" }}>
                        Email Address
                    </label>
                    <input
                        id="email" type="email" name="email"
                        placeholder="user@company.com"
                        value={formData.email} onChange={handleChange} disabled={loading} required
                        style={INPUT}
                        onFocus={e => e.target.style.borderColor = "var(--accent)"}
                        onBlur={e => e.target.style.borderColor = "var(--border)"}
                    />
                </div>

                {/* Password */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                        <label htmlFor="password" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>
                            Password
                        </label>
                        <Link to="/forgot-password"
                            style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-2)", textDecoration: "none" }}
                            onMouseEnter={e => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.textDecoration = "underline"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.textDecoration = "none"; }}
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div style={{ position: "relative" }}>
                        <input
                            id="password" type={showPassword ? "text" : "password"} name="password"
                            placeholder="••••••••"
                            value={formData.password} onChange={handleChange} disabled={loading} required
                            style={{ ...INPUT, paddingRight: "40px" }}
                            onFocus={e => e.target.style.borderColor = "var(--accent)"}
                            onBlur={e => e.target.style.borderColor = "var(--border)"}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-4)", padding: 0 }}
                            onMouseEnter={e => e.currentTarget.style.color = "var(--text-2)"}
                            onMouseLeave={e => e.currentTarget.style.color = "var(--text-4)"}
                        >
                            {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                        </button>
                    </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
                    style={{
                        width: "100%", background: loading ? "var(--border)" : "var(--accent)",
                        color: "var(--text)", border: "none", borderRadius: "var(--r-md)",
                        padding: "var(--space-3)", fontSize: "var(--text-sm)", fontWeight: 700,
                        fontFamily: "var(--font-body)", letterSpacing: "0.04em", textTransform: "uppercase",
                        cursor: loading ? "not-allowed" : "pointer", marginTop: "var(--space-1)",
                        transition: "opacity var(--duration-fast)",
                    }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                    {loading ? "Signing in…" : "Sign In →"}
                </button>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", margin: "var(--space-6) 0" }}>
                <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                <span style={{ padding: "0 var(--space-3)", fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-4)" }}>
                    or
                </span>
                <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            </div>

            {/* Register link */}
            <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-3)" }}>
                Don&apos;t have an account?{" "}
                <Link to="/register"
                    style={{ color: "var(--text-2)", fontWeight: 600, textDecoration: "none" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.textDecoration = "underline"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.textDecoration = "none"; }}
                >
                    Register
                </Link>
            </p>
        </AuthLayout>
    );
};

export default LoginPage;
