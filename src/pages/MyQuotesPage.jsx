import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import toast from "react-hot-toast";
import Navbar  from "../components/Navbar";
import Footer  from "../components/Footer";

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
                                        background: "var(--surface)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "var(--r-lg)",
                                        padding: "var(--space-4)",
                                        display: "grid",
                                        gridTemplateColumns: "52px 1fr",
                                        gap: "var(--space-4)",
                                    }}
                                >
                                    {/* Thumbnail */}
                                    <Link to={`/products/${q.productId}`}>
                                        <div style={{
                                            width: 52, height: 52, borderRadius: "var(--r-sm)",
                                            overflow: "hidden", border: "1px solid var(--border)",
                                            background: "var(--bg)",
                                        }}>
                                            {q.productImageUrl
                                                ? <img src={q.productImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                : <span style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-4)", fontSize: 20 }}>📦</span>
                                            }
                                        </div>
                                    </Link>

                                    {/* Info */}
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                                            <Link
                                                to={`/products/${q.productId}`}
                                                style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", fontFamily: "var(--font-display)", textDecoration: "none" }}
                                            >
                                                {q.productName}
                                            </Link>
                                            <span style={{
                                                padding: "2px 10px", borderRadius: 99,
                                                background: s.bg, color: s.color,
                                                fontSize: 11, fontWeight: 700,
                                            }}>
                                                {s.label}
                                            </span>
                                        </div>

                                        <p style={{ fontSize: 12, color: "var(--text-3)", margin: "0 0 4px", fontFamily: "var(--font-body)" }}>
                                            Qty: <strong>{q.qtyNeeded}</strong> &bull; Urgency: <strong>{q.urgency}</strong> &bull; Submitted {fmtDate(q.createdAt)}
                                        </p>

                                        {q.notes && (
                                            <p style={{ fontSize: 12, color: "var(--text-3)", margin: "0 0 6px", fontStyle: "italic" }}>
                                                Your note: "{q.notes}"
                                            </p>
                                        )}

                                        {/* Seller response */}
                                        {q.status === "RESPONDED" && (
                                            <div style={{
                                                marginTop: 8, padding: "10px 12px",
                                                background: "rgba(5,150,105,0.08)",
                                                borderRadius: "var(--r-sm)",
                                                borderLeft: "3px solid #059669",
                                            }}>
                                                {q.quotedPrice != null && (
                                                    <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 15, color: "#059669" }}>
                                                        Quoted price: ${Number(q.quotedPrice).toFixed(2)} per unit
                                                    </p>
                                                )}
                                                {q.sellerNote && (
                                                    <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>
                                                        {q.sellerName && <strong>{q.sellerName}: </strong>}
                                                        {q.sellerNote}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {q.status === "DECLINED" && q.sellerNote && (
                                            <p style={{ fontSize: 12, color: "var(--text-3)", margin: "6px 0 0", fontStyle: "italic" }}>
                                                Seller note: "{q.sellerNote}"
                                            </p>
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
