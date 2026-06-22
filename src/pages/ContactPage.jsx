import { Link } from "react-router-dom";

const C = {
    bg:      "var(--bg)",
    surface: "var(--surface)",
    border:  "var(--border)",
    text:    "var(--text)",
    text2:   "var(--text-2)",
    text3:   "var(--text-3)",
    accent:  "var(--accent)",
    accentLo:"var(--accent-lo)",
};

export default function ContactPage() {
    return (
        <div style={{ minHeight: "100vh", background: C.bg, paddingTop: "var(--topbar-height)" }}>

            <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "48px 0 40px" }}>
                <div className="w-full max-w-[820px] mx-auto px-4 sm:px-6 lg:px-10">
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.text3, marginBottom: "10px" }}>Sales</p>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 2.5vw, 2rem)", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", margin: 0 }}>
                        Contact Sales
                    </h1>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: C.text2, marginTop: "10px", lineHeight: 1.6, maxWidth: "54ch" }}>
                        Speak with our procurement specialists for bulk orders, OEM sourcing, and net-terms arrangements.
                    </p>
                </div>
            </div>

            <div className="w-full max-w-[820px] mx-auto px-4 sm:px-6 lg:px-10 py-14">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{ marginBottom: "48px" }}>

                    {/* Phone */}
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "28px 28px" }}>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.text3, marginBottom: "14px" }}>
                            Call Us
                        </p>
                        <a
                            href="tel:5734666199"
                            style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, color: C.accent, textDecoration: "none", display: "block", marginBottom: "8px" }}
                        >
                            +1 573 466 6199
                        </a>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: C.text3, lineHeight: 1.55, marginBottom: "6px" }}>Mon – Fri, 08:00 – 18:00 CST</p>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: C.text3, lineHeight: 1.55, textAlign: "justify" }}>
                            Direct line for procurement and bulk order enquiries. Average wait under 2 minutes.
                        </p>
                    </div>

                    {/* What we handle */}
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "28px 28px" }}>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.text3, marginBottom: "14px" }}>
                            What Sales Can Help With
                        </p>
                        <ul style={{ margin: 0, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            {[
                                "Bulk and volume orders",
                                "OEM sourcing for unlisted parts",
                                "Net-terms and PO billing setup",
                                "Custom lead time negotiations",
                                "Supplier qualification requests",
                                "Fleet maintenance contracts",
                            ].map((item) => (
                                <li key={item} style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: C.text2, lineHeight: 1.5 }}>{item}</li>
                            ))}
                        </ul>
                    </div>

                </div>

                {/* Hours & info */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "22px 26px", marginBottom: "48px" }}>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.text3, marginBottom: "14px" }}>
                        Response Times
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Phone",         value: "Immediate",    note: "Business hours" },
                            { label: "Quote Request", value: "≤ 4 hours",   note: "Business days"  },
                            { label: "Custom Order",  value: "≤ 1 day",     note: "Business days"  },
                        ].map(({ label, value, note }) => (
                            <div key={label}>
                                <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: C.text3, marginBottom: "2px" }}>{label}</p>
                                <p style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, color: C.text }}>{value}</p>
                                <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: C.text3 }}>{note}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", borderTop: `1px solid ${C.border}`, paddingTop: "28px" }}>
                    <Link to="/" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", color: C.text3, textDecoration: "none" }}>
                        ← Back to Catalog
                    </Link>
                    <Link to="/support" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", color: C.text3, textDecoration: "none" }}>
                        Technical Support →
                    </Link>
                </div>

            </div>
        </div>
    );
}
