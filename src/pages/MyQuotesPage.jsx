import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import toast from "react-hot-toast";
import Navbar      from "../components/Navbar";
import Footer      from "../components/Footer";
import BackButton  from "../components/BackButton";

const STATUS_STYLE = {
    PENDING:   { label: "Awaiting response", color: "#d97706", bg: "rgba(217,119,6,0.1)" },
    RESPONDED: { label: "Response received", color: "#059669", bg: "rgba(5,150,105,0.1)" },
    DECLINED:  { label: "Declined",          color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
};

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

const MyQuotesPage = () => {
    const [quotes,  setQuotes]  = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/quotes/my")
            .then(r => setQuotes(r.data))
            .catch(() => toast.error("Failed to load your quotes."))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
            <Navbar />
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "var(--space-6) var(--space-4)" }}>
                <BackButton style={{ marginBottom: "var(--space-4)" }} />
                <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.75rem", color: "var(--text)", marginBottom: "var(--space-5)" }}>
                    My Quote Requests
                </h1>

                {loading ? (
                    <p style={{ color: "var(--text-4)", fontFamily: "var(--font-mono)", fontSize: 13 }}>Loading…</p>
                ) : quotes.length === 0 ? (
                    <div style={{
                        background: "var(--surface)", border: "1px solid var(--border)",
                        borderRadius: "var(--r-lg)", padding: "var(--space-8)", textAlign: "center",
                    }}>
                        <p style={{ color: "var(--text-3)", margin: "0 0 var(--space-3)" }}>You haven't submitted any quote requests yet.</p>
                        <Link to="/" style={{ color: "var(--accent)", fontWeight: 600, fontSize: 14 }}>Browse products</Link>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                        {quotes.map(q => {
                            const s = STATUS_STYLE[q.status] || { label: q.status, color: "#71717a", bg: "rgba(0,0,0,0.05)" };
                            return (
                                <div
                                    key={q.quoteId}
                                    style={{
                                        background:   "var(--surface)",
                                        border:       "1px solid var(--border)",
                                        borderLeft:   `3px solid ${s.color}`,
                                        borderRadius: "var(--r-lg)",
                                        padding:      "var(--space-4)",
                                        display:      "flex",
                                        gap:          "var(--space-4)",
                                    }}
                                >
                                    {/* Thumbnail */}
                                    <Link to={`/products/${q.productId}`} style={{ flexShrink: 0 }}>
                                        <div style={{
                                            width: 48, height: 48, borderRadius: "var(--r-sm)",
                                            overflow: "hidden", border: "1px solid var(--border)",
                                            background: "var(--bg)",
                                        }}>
                                            {q.productImageUrl
                                                ? <img src={q.productImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                : <span style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-4)", fontSize: 20 }}>📦</span>
                                            }
                                        </div>
                                    </Link>

                                    {/* Body */}
                                    <div style={{ flex: 1, minWidth: 0 }}>

                                        {/* Row 1 — product + status + ID */}
                                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: "var(--space-2)", flexWrap: "wrap" }}>
                                            <Link
                                                to={`/products/${q.productId}`}
                                                style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text)", textDecoration: "none", flex: 1 }}
                                            >
                                                {q.productName}
                                            </Link>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                                                <span style={{
                                                    padding: "3px 10px", borderRadius: 99,
                                                    background: s.bg, color: s.color,
                                                    border: `1px solid ${s.color}33`,
                                                    fontSize: 11, fontWeight: 700, fontFamily: "var(--font-body)",
                                                }}>
                                                    {s.label}
                                                </span>
                                                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-4)" }}>
                                                    #{q.quoteId}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Meta row — labeled columns */}
                                        <div style={{ display: "flex", gap: "var(--space-5)", paddingTop: "var(--space-2)", borderTop: "1px solid var(--border)", marginBottom: q.notes ? "var(--space-3)" : 0, flexWrap: "wrap" }}>
                                            <div>
                                                <p style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-4)", margin: "0 0 2px" }}>Qty</p>
                                                <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--text-2)", margin: 0 }}>{q.qtyNeeded}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-4)", margin: "0 0 2px" }}>Urgency</p>
                                                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-2)", margin: 0 }}>{q.urgency}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-4)", margin: "0 0 2px" }}>Submitted</p>
                                                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-2)", margin: 0 }}>{fmtDate(q.createdAt)}</p>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {q.notes && (
                                            <div style={{ margin: "var(--space-2) 0", padding: "var(--space-2) var(--space-3)", background: "var(--bg)", borderRadius: "var(--r-sm)", borderLeft: "2px solid var(--border)" }}>
                                                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-3)", fontStyle: "italic", margin: 0 }}>
                                                    "{q.notes}"
                                                </p>
                                            </div>
                                        )}

                                        {/* Offer received */}
                                        {q.status === "RESPONDED" && (
                                            <div style={{ marginTop: "var(--space-3)", padding: "var(--space-3)", background: "rgba(5,150,105,0.06)", borderRadius: "var(--r-md)", border: "1px solid rgba(5,150,105,0.2)" }}>
                                                <p style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#059669", margin: "0 0 var(--space-1)" }}>Offer received</p>
                                                {q.quotedPrice != null && (
                                                    <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.1rem", color: "#059669", margin: "0 0 4px" }}>
                                                        ${Number(q.quotedPrice).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 12, color: "var(--text-3)", marginLeft: 4 }}>/ unit</span>
                                                    </p>
                                                )}
                                                {q.sellerNote && (
                                                    <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-2)", margin: 0 }}>
                                                        {q.sellerNote}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Declined */}
                                        {q.status === "DECLINED" && (
                                            <div style={{ marginTop: "var(--space-3)", padding: "var(--space-3)", background: "rgba(220,38,38,0.05)", borderRadius: "var(--r-sm)", border: "1px solid rgba(220,38,38,0.15)" }}>
                                                <p style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#dc2626", margin: "0 0 var(--space-1)" }}>Declined</p>
                                                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-3)", margin: 0 }}>
                                                    {q.sellerNote || "No reason provided."}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default MyQuotesPage;
