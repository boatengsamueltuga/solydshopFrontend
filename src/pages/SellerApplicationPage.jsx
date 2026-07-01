import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api/api";
import toast from "react-hot-toast";
import BackButton from "../components/BackButton";

const BUSINESS_TYPES = [
    { value: "SOLE_TRADER",  label: "Sole trader / freelancer" },
    { value: "PARTNERSHIP",  label: "Partnership" },
    { value: "LLC",          label: "LLC" },
    { value: "CORPORATION",  label: "Corporation" },
    { value: "OTHER",        label: "Other" },
];

const getXsrfToken = () =>
    document.cookie.split("; ").find(r => r.startsWith("XSRF-TOKEN="))?.split("=")[1];

const fmtDate = d =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

/* ── Shared field wrapper ────────────────────────────────── */
const Field = ({ label, hint, children }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)" }}>
            {label}
        </span>
        {children}
        {hint && <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-4)", margin: 0 }}>{hint}</p>}
    </div>
);

/* ── Dashed section divider ──────────────────────────────── */
const Section = ({ label }) => (
    <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "var(--space-5)", marginTop: "var(--space-2)" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", margin: "0 0 var(--space-4)" }}>
            {label}
        </p>
    </div>
);

const inputBase = {
    width: "100%",
    background: "var(--surface-high)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-sm)",
    color: "var(--text)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--text-sm)",
    padding: "var(--space-3) var(--space-4)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
};

const onFocus = e => { e.target.style.borderColor = "var(--accent)"; };
const onBlur  = e => { e.target.style.borderColor = "var(--border)"; };

/* ── Status screens ──────────────────────────────────────── */
const PendingScreen = ({ app }) => {
    const navigate = useNavigate();
    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)" }}>
            <div style={{ maxWidth: 600, margin: "0 auto", padding: "var(--space-8) var(--space-6)" }}>
                <BackButton style={{ marginBottom: "var(--space-6)" }} />
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderTop: "3px solid var(--warning)", borderRadius: "var(--r-md)", padding: "var(--space-6)" }}>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--warning)", margin: "0 0 var(--space-3)" }}>
                        Under Review
                    </p>
                    <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.5rem", color: "var(--text)", margin: "0 0 var(--space-3)", letterSpacing: "-0.01em" }}>
                        Application received
                    </h1>
                    <p style={{ color: "var(--text-3)", fontSize: 14, margin: "0 0 var(--space-5)", lineHeight: 1.6 }}>
                        We've received your application for <strong style={{ color: "var(--text-2)" }}>{app.businessName}</strong>. Our team will review it and let you know once a decision has been made.
                    </p>
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-4)" }}>
                            Application #{app.id} · Submitted {fmtDate(app.createdAt)}
                        </span>
                        <button
                            onClick={() => navigate("/account")}
                            style={{ background: "none", border: "none", color: "var(--accent)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }}
                        >
                            Back to account →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── Main component ──────────────────────────────────────── */
export default function SellerApplicationPage() {
    const navigate = useNavigate();
    const { user } = useSelector(s => s.auth);

    const [existing,   setExisting]   = useState(undefined); // undefined = checking
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        businessName:       "",
        businessType:       "",
        productCategory:    "",
        productDescription: "",
        motivation:         "",
        agreedToTerms:      false,
    });

    useEffect(() => {
        api.get("/seller-applications/my", { silent: true })
            .then(r => setExisting(r.data))
            .catch(() => setExisting(null));
    }, []);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.agreedToTerms) { toast.error("Please agree to the seller terms to continue."); return; }
        setSubmitting(true);
        try {
            await api.post("/seller-applications", {
                businessName:       form.businessName,
                businessType:       form.businessType,
                productCategory:    form.productCategory,
                productDescription: form.productDescription,
                motivation:         form.motivation,
            }, { headers: { "X-XSRF-TOKEN": getXsrfToken() } });
            toast.success("Application submitted — we'll review it shortly.");
            navigate("/account");
        } catch (err) {
            toast.error(err?.response?.data?.message ?? "Failed to submit application.");
        } finally {
            setSubmitting(false);
        }
    };

    if (existing === undefined) return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-4)" }}>Loading…</p>
        </div>
    );

    if (existing?.status === "PENDING") return <PendingScreen app={existing} />;

    const isResubmit = existing?.status === "REJECTED";

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)", paddingBottom: "var(--space-12)" }}>

            {/* Page header band */}
            <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                <div style={{ maxWidth: 640, margin: "0 auto", padding: "var(--space-5) var(--space-6)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-4)" }}>
                    <div>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-4)", margin: "0 0 4px" }}>
                            SolydShop · Seller Onboarding
                        </p>
                        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(1.25rem, 4vw, 1.75rem)", color: "var(--text)", margin: 0, letterSpacing: "-0.01em" }}>
                            {isResubmit ? "Resubmit Application" : "Seller Application"}
                        </h1>
                    </div>
                    {isResubmit && (
                        <span style={{ padding: "3px 10px", borderRadius: "var(--r-sm)", background: "var(--error-subtle)", color: "var(--error)", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.04em", flexShrink: 0, alignSelf: "center" }}>
                            PREVIOUSLY REJECTED
                        </span>
                    )}
                </div>
            </div>

            <div style={{ maxWidth: 640, margin: "0 auto", padding: "var(--space-6) var(--space-6) 0" }}>

                <BackButton style={{ marginBottom: "var(--space-5)" }} />

                {/* Rejection notice */}
                {isResubmit && (
                    <div style={{ background: "var(--error-subtle)", border: "1px solid var(--error)", borderRadius: "var(--r-md)", padding: "var(--space-4) var(--space-5)", marginBottom: "var(--space-5)" }}>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--error)", margin: "0 0 4px" }}>
                            Previous application not approved
                        </p>
                        <p style={{ color: "var(--text-2)", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                            {existing.rejectionReason ?? "Your previous application was not approved. Please review and update your details before resubmitting."}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>

                        {/* ── Section 1: Your Business ── */}
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", margin: 0 }}>
                            Your business
                        </p>

                        <Field label="Business / trading name" hint="The name buyers will see on your product listings.">
                            <input
                                required
                                value={form.businessName}
                                onChange={e => set("businessName", e.target.value)}
                                placeholder="e.g. Acme Industrial Supplies"
                                style={inputBase}
                                onFocus={onFocus}
                                onBlur={onBlur}
                            />
                        </Field>

                        <Field label="Business type">
                            <select
                                required
                                value={form.businessType}
                                onChange={e => set("businessType", e.target.value)}
                                style={{ ...inputBase, cursor: "pointer" }}
                                onFocus={onFocus}
                                onBlur={onBlur}
                            >
                                <option value="">Select a type…</option>
                                {BUSINESS_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </Field>

                        {/* ── Section 2: What You Sell ── */}
                        <Section label="What you sell" />

                        <Field label="Primary product category" hint="e.g. Hydraulic parts, Engine components, Electrical systems">
                            <input
                                required
                                value={form.productCategory}
                                onChange={e => set("productCategory", e.target.value)}
                                placeholder="Hydraulic parts"
                                style={inputBase}
                                onFocus={onFocus}
                                onBlur={onBlur}
                            />
                        </Field>

                        <Field label="Describe your products" hint="What do you sell, and who typically buys from you?">
                            <textarea
                                required
                                minLength={30}
                                value={form.productDescription}
                                onChange={e => set("productDescription", e.target.value)}
                                placeholder="We supply hydraulic pumps and seal kits for heavy construction equipment — Caterpillar, Komatsu, and Hitachi machinery…"
                                rows={4}
                                style={{ ...inputBase, resize: "vertical" }}
                                onFocus={onFocus}
                                onBlur={onBlur}
                            />
                        </Field>

                        {/* ── Section 3: Commitment ── */}
                        <Section label="Your commitment" />

                        <Field label="Why do you want to sell on SolydShop?" hint="Tell us about your experience in this industry and what makes your business a good fit.">
                            <textarea
                                required
                                minLength={20}
                                value={form.motivation}
                                onChange={e => set("motivation", e.target.value)}
                                placeholder="We've been supplying the construction sector for over 10 years and want to reach more buyers who need reliable OEM-quality parts…"
                                rows={4}
                                style={{ ...inputBase, resize: "vertical" }}
                                onFocus={onFocus}
                                onBlur={onBlur}
                            />
                        </Field>

                        {/* ── Agreement + Submit ── */}
                        <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

                            <label style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)", cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    checked={form.agreedToTerms}
                                    onChange={e => set("agreedToTerms", e.target.checked)}
                                    style={{ marginTop: 3, accentColor: "var(--accent)", width: 15, height: 15, flexShrink: 0 }}
                                />
                                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
                                    I confirm all information above is accurate and I agree to SolydShop's{" "}
                                    <Link to="/terms" style={{ color: "var(--accent)", textDecoration: "none" }}>Seller Terms of Service</Link>.
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    width: "100%",
                                    padding: "var(--space-4)",
                                    background: submitting ? "var(--surface-high)" : "var(--accent)",
                                    color: submitting ? "var(--text-3)" : "var(--text)",
                                    border: "none",
                                    borderRadius: "var(--r-md)",
                                    fontFamily: "var(--font-body)",
                                    fontWeight: 700,
                                    fontSize: "var(--text-sm)",
                                    letterSpacing: "0.04em",
                                    textTransform: "uppercase",
                                    cursor: submitting ? "not-allowed" : "pointer",
                                    transition: "opacity 0.15s",
                                }}
                                onMouseEnter={e => { if (!submitting) e.currentTarget.style.opacity = "0.88"; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                            >
                                {submitting ? "Submitting…" : isResubmit ? "Resubmit Application" : "Submit Application"}
                            </button>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}
