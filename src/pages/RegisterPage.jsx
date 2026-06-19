import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/api";
import toast from "react-hot-toast";

import { FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import AuthLayout from "../components/layouts/AuthLayout";

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

            toast.success("Registration successful");

            setFormData({
                name: "",
                email: "",
                password: ""
            });

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                error.response?.data ||
                "Registration failed"
            );

        } finally {

            setLoading(false);
        }
    };

    const INPUT = {
        width: "100%", background: "var(--surface-mid)",
        border: "1px solid var(--border)", borderRadius: "var(--r-sm)",
        padding: "10px var(--space-3)", fontSize: "var(--text-sm)",
        color: "var(--text)", fontFamily: "var(--font-body)",
        outline: "none", boxSizing: "border-box",
        transition: "border-color var(--duration-fast)",
        opacity: loading ? 0.5 : 1,
    };

    return (
        <AuthLayout>
            {/* Heading */}
            <div style={{ marginBottom: "var(--space-8)" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-2xl)", color: "var(--text)", letterSpacing: "-0.01em", margin: "0 0 var(--space-2)" }}>
                    Create account
                </h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-3)" }}>
                    Join SolydShop as a buyer or seller
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

                {/* Name */}
                <div>
                    <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "var(--space-2)" }}>
                        Full Name
                    </label>
                    <input
                        type="text" name="name" placeholder="Your name"
                        value={formData.name} onChange={handleChange} disabled={loading} required
                        style={INPUT}
                        onFocus={e => e.target.style.borderColor = "var(--accent)"}
                        onBlur={e => e.target.style.borderColor = "var(--border)"}
                    />
                </div>

                {/* Email */}
                <div>
                    <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "var(--space-2)" }}>
                        Email Address
                    </label>
                    <input
                        type="email" name="email" placeholder="user@company.com"
                        value={formData.email} onChange={handleChange} disabled={loading} required
                        style={INPUT}
                        onFocus={e => e.target.style.borderColor = "var(--accent)"}
                        onBlur={e => e.target.style.borderColor = "var(--border)"}
                    />
                </div>

                {/* Password */}
                <div>
                    <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "var(--space-2)" }}>
                        Password
                    </label>
                    <div style={{ position: "relative" }}>
                        <input
                            type={showPassword ? "text" : "password"} name="password" placeholder="••••••••"
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

                {/* Password rules checklist */}
                {formData.password.length > 0 && (
                    <ul style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", background: "var(--surface-mid)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "var(--space-3)", listStyle: "none", margin: 0 }}>
                        {passwordRules.map((rule) => {
                            const passed = rule.test(formData.password);
                            return (
                                <li key={rule.id} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: passed ? "var(--success)" : "var(--error)" }}>
                                    {passed ? <FaCheck size={11} /> : <FaTimes size={11} />}
                                    {rule.label}
                                </li>
                            );
                        })}
                    </ul>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading}
                    style={{
                        width: "100%", background: loading ? "var(--border)" : "var(--accent)",
                        color: "var(--text)", border: "none", borderRadius: "var(--r-md)",
                        padding: "var(--space-3)", fontSize: "var(--text-sm)", fontWeight: 700,
                        fontFamily: "var(--font-body)", letterSpacing: "0.04em", textTransform: "uppercase",
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "opacity var(--duration-fast)",
                    }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                    {loading ? "Creating account…" : "Create Account →"}
                </button>
            </form>

            {/* Login link */}
            <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-3)", marginTop: "var(--space-6)" }}>
                Already have an account?{" "}
                <Link to="/login"
                    style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                >
                    Sign In
                </Link>
            </p>
        </AuthLayout>
    );
};

export default RegisterPage;
