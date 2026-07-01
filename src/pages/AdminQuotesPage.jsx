import { useCallback, useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import AdminLayout from "../components/layouts/AdminLayout";
import QuoteRespondModal from "../components/quotes/QuoteRespondModal";

const STATUS_STYLE = {
    PENDING:   { label: "Pending",   color: "#d97706", bg: "rgba(217,119,6,0.1)" },
    RESPONDED: { label: "Responded", color: "#059669", bg: "rgba(5,150,105,0.1)" },
    DECLINED:  { label: "Declined",  color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
};

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

const StatusDot = ({ status }) => {
    const s = STATUS_STYLE[status] || { label: status, color: "#71717a", bg: "transparent" };
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "2px 10px", borderRadius: 99,
            background: s.bg, fontSize: 11, fontWeight: 700, color: s.color,
        }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            {s.label}
        </span>
    );
};

/* ── Main page ── */
const AdminQuotesPage = () => {
    const [quotes,  setQuotes]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [active,  setActive]  = useState(null);
    const [filter,  setFilter]  = useState("ALL");

    const fetchQuotes = useCallback(async () => {
        try {
            const res = await api.get("/admin/quotes");
            setQuotes(res.data);
        } catch {
            toast.error("Failed to load quotes.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

    const displayed = filter === "ALL" ? quotes
        : filter === "PLATFORM" ? quotes.filter(q => !q.sellerId)
        : quotes.filter(q => q.status === filter);

    const pendingCount  = quotes.filter(q => q.status === "PENDING").length;
    const platformCount = quotes.filter(q => !q.sellerId).length;

    return (
        <AdminLayout title="Quotes">
            <div style={{ maxWidth: 900, margin: "0 auto" }}>

                {/* Header */}
                <div style={{ marginBottom: "var(--space-5)" }}>
                    <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.5rem", color: "var(--text)", margin: "0 0 var(--space-1)" }}>
                        Quote Requests
                    </h1>
                    <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0, fontFamily: "var(--font-body)" }}>
                        All buyer quote requests across the platform
                    </p>
                </div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
                    {[
                        { label: "Total",             value: quotes.length },
                        { label: "Awaiting Response", value: pendingCount,  accent: pendingCount > 0 },
                        { label: "Platform Products", value: platformCount, note: "Admin-created" },
                    ].map(s => (
                        <div key={s.label} style={{ background: "var(--surface)", border: `1px solid ${s.accent ? "var(--accent)" : "var(--border)"}`, borderRadius: "var(--r-md)", padding: "var(--space-4)" }}>
                            <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", margin: "0 0 var(--space-1)", fontFamily: "var(--font-body)" }}>{s.label}</p>
                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.75rem", color: s.accent ? "var(--accent)" : "var(--text)", lineHeight: 1, margin: 0 }}>{loading ? "—" : s.value}</p>
                            {s.note && <p style={{ fontSize: 11, color: "var(--text-4)", margin: "4px 0 0", fontFamily: "var(--font-mono)" }}>{s.note}</p>}
                        </div>
                    ))}
                </div>

                {/* Filter tabs */}
                <div style={{ display: "flex", gap: 6, marginBottom: "var(--space-4)", flexWrap: "wrap" }}>
                    {[
                        { key: "ALL",      label: "All" },
                        { key: "PENDING",  label: "Pending" },
                        { key: "RESPONDED",label: "Responded" },
                        { key: "DECLINED", label: "Declined" },
                        { key: "PLATFORM", label: "Platform Products" },
                    ].map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)}
                            style={{
                                padding: "5px 14px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)",
                                fontSize: 12, fontWeight: 600, cursor: "pointer",
                                background: filter === f.key ? "var(--accent)" : "transparent",
                                color:      filter === f.key ? "#fff" : "var(--text-3)",
                            }}>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Quote list */}
                {loading ? (
                    <p style={{ color: "var(--text-4)", fontFamily: "var(--font-mono)", fontSize: 13 }}>Loading…</p>
                ) : displayed.length === 0 ? (
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "var(--space-8)", textAlign: "center" }}>
                        <p style={{ color: "var(--text-3)", margin: 0 }}>No quotes match this filter.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                        {displayed.map(q => (
                            <div key={q.quoteId} style={{
                                background: "var(--surface)", border: "1px solid var(--border)",
                                borderRadius: "var(--r-lg)", padding: "var(--space-4)",
                                display: "grid", gridTemplateColumns: "44px 1fr auto",
                                gap: "var(--space-4)", alignItems: "start",
                            }}>
                                {/* Thumbnail */}
                                <div style={{ width: 44, height: 44, borderRadius: "var(--r-sm)", overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg)", flexShrink: 0 }}>
                                    {q.productImageUrl
                                        ? <img src={q.productImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        : <span style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-4)", fontSize: 18 }}>📦</span>
                                    }
                                </div>

                                {/* Details */}
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                                        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", fontFamily: "var(--font-display)" }}>{q.productName}</span>
                                        <StatusDot status={q.status} />
                                        {!q.sellerId && (
                                            <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 8px", borderRadius: 99, background: "rgba(96,165,250,0.12)", color: "#60a5fa" }}>
                                                Platform
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: 12, color: "var(--text-3)", margin: "0 0 3px", fontFamily: "var(--font-body)" }}>
                                        Buyer: <strong>{q.buyerName}</strong> ({q.buyerEmail}) &bull; Qty: <strong>{q.qtyNeeded}</strong> &bull; Urgency: <strong>{q.urgency}</strong>
                                    </p>
                                    <p style={{ fontSize: 12, color: "var(--text-3)", margin: "0 0 3px" }}>
                                        Contact: {q.contactEmail}{q.phone ? ` / ${q.phone}` : ""}
                                    </p>
                                    {q.sellerId && (
                                        <p style={{ fontSize: 12, color: "var(--text-3)", margin: "0 0 3px" }}>
                                            Seller: <strong>{q.sellerName}</strong>
                                        </p>
                                    )}
                                    {q.notes && (
                                        <p style={{ fontSize: 12, color: "var(--text-3)", margin: "3px 0 0", fontStyle: "italic" }}>"{q.notes}"</p>
                                    )}
                                    {q.status === "RESPONDED" && q.quotedPrice != null && (
                                        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", margin: "5px 0 0" }}>
                                            Quoted: ${Number(q.quotedPrice).toFixed(2)} — {q.sellerNote || ""}
                                        </p>
                                    )}
                                    <p style={{ fontSize: 11, color: "var(--text-4)", margin: "4px 0 0", fontFamily: "var(--font-mono)" }}>
                                        {fmtDate(q.createdAt)}
                                    </p>
                                </div>

                                {/* Respond button — admin can respond to any pending quote */}
                                {q.status === "PENDING" && (
                                    <button onClick={() => setActive(q)}
                                        style={{
                                            padding: "7px 16px", borderRadius: "var(--r-sm)",
                                            background: "var(--accent)", border: "none",
                                            color: "#fff", fontWeight: 600, fontSize: 13,
                                            cursor: "pointer", whiteSpace: "nowrap",
                                        }}>
                                        Respond
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {active && (
                <QuoteRespondModal
                    quote={active}
                    endpoint={`/admin/quotes/${active.quoteId}/respond`}
                    isAdmin={!active.sellerId}
                    onClose={() => setActive(null)}
                    onSaved={fetchQuotes}
                />
            )}
        </AdminLayout>
    );
};

export default AdminQuotesPage;
