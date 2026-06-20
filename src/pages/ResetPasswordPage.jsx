import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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

            toast.error(
                typeof error.response?.data === "string"
                    ? error.response.data
                    : "Invalid or expired reset token."
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
                    Set new password
                </h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-3)" }}>
                    Enter your new password below.
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

                {/* New Password */}
                <div>
                    <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "var(--space-2)" }}>
                        New Password
                    </label>
                    <div style={{ position: "relative" }}>
                        <input
                            type={showPassword ? "text" : "password"} name="newPassword"
                            placeholder="••••••••" value={newPassword}
                            onChange={e => setNewPassword(e.target.value)} disabled={loading} required
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
                <ul style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", background: "var(--surface-mid)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "var(--space-3)", listStyle: "none", margin: 0 }}>
                    {passwordRules.map((rule) => {
                        const passed = rule.test(newPassword);
                        return (
                            <li key={rule.id} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: passed ? "var(--success)" : "var(--text-3)" }}>
                                {passed ? <FaCheck size={11} /> : <FaTimes size={11} />}
                                {rule.label}
                            </li>
                        );
                    })}
                </ul>

                {/* Confirm Password */}
                <div>
                    <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "var(--space-2)" }}>
                        Confirm Password
                    </label>
                    <div style={{ position: "relative" }}>
                        <input
                            type={showConfirmPassword ? "text" : "password"} name="confirmPassword"
                            placeholder="••••••••" value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)} disabled={loading} required
                            style={{ ...INPUT, paddingRight: "40px" }}
                            onFocus={e => e.target.style.borderColor = "var(--accent)"}
                            onBlur={e => e.target.style.borderColor = "var(--border)"}
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-4)", padding: 0 }}
                            onMouseEnter={e => e.currentTarget.style.color = "var(--text-2)"}
                            onMouseLeave={e => e.currentTarget.style.color = "var(--text-4)"}
                        >
                            {showConfirmPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                        </button>
                    </div>
                </div>

                {/* Match indicator */}
                {confirmPassword.length > 0 && (
                    <p style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: passwordsMatch ? "var(--success)" : "var(--error)" }}>
                        {passwordsMatch
                            ? <><FaCheck size={11} /> Passwords match</>
                            : <><FaTimes size={11} /> Passwords do not match</>
                        }
                    </p>
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
                    {loading ? "Resetting…" : "Reset Password →"}
                </button>
            </form>

            <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-3)", marginTop: "var(--space-6)" }}>
                Back to{" "}
                <Link to="/login"
                    style={{ color: "var(--text-2)", fontWeight: 600, textDecoration: "none" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.textDecoration = "underline"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.textDecoration = "none"; }}
                >
                    Sign In
                </Link>
            </p>
        </AuthLayout>
    );
};

export default ResetPasswordPage;
