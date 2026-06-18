import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import toast from "react-hot-toast";
import AuthLayout from "../components/layouts/AuthLayout";

const INPUT = {
    width: "100%", background: "var(--surface-mid)",
    border: "1px solid var(--border)", borderRadius: "var(--r-sm)",
    padding: "10px var(--space-3)", fontSize: "var(--text-sm)",
    color: "var(--text)", fontFamily: "var(--font-body)",
    outline: "none", boxSizing: "border-box",
    transition: "border-color var(--duration-fast)",
};

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
        <AuthLayout>
            {/* Heading */}
            <div style={{ marginBottom: "var(--space-8)" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-2xl)", color: "var(--text)", letterSpacing: "-0.01em", margin: "0 0 var(--space-2)" }}>
                    Reset password
                </h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-3)" }}>
                    Enter your email and we&apos;ll send you a reset link.
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

                <div>
                    <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "var(--space-2)" }}>
                        Email Address
                    </label>
                    <input
                        type="email" name="email" placeholder="user@company.com"
                        value={email} onChange={e => setEmail(e.target.value)}
                        disabled={loading} required
                        style={{ ...INPUT, opacity: loading ? 0.5 : 1 }}
                        onFocus={e => e.target.style.borderColor = "var(--accent)"}
                        onBlur={e => e.target.style.borderColor = "var(--border)"}
                    />
                </div>

                <button type="submit" disabled={loading}
                    style={{
                        width: "100%", background: loading ? "var(--border)" : "var(--accent)",
                        color: "var(--bg)", border: "none", borderRadius: "var(--r-md)",
                        padding: "var(--space-3)", fontSize: "var(--text-sm)", fontWeight: 700,
                        fontFamily: "var(--font-body)", letterSpacing: "0.04em", textTransform: "uppercase",
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "opacity var(--duration-fast)",
                    }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                    {loading ? "Sending…" : "Send Reset Link →"}
                </button>
            </form>

            <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-3)", marginTop: "var(--space-6)" }}>
                Remember your password?{" "}
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

export default ForgotPasswordPage;
