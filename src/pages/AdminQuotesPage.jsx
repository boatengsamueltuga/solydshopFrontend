import { useCallback, useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import AdminLayout from "../components/layouts/AdminLayout";
import QuoteRespondModal from "../components/quotes/QuoteRespondModal";

const STATUS = {
    PENDING:   { label: "Pending",   color: "#d97706", bg: "rgba(217,119,6,0.10)",  border: "rgba(217,119,6,0.25)"  },
    RESPONDED: { label: "Responded", color: "#059669", bg: "rgba(5,150,105,0.10)",  border: "rgba(5,150,105,0.25)"  },
    DECLINED:  { label: "Declined",  color: "#dc2626", bg: "rgba(220,38,38,0.10)",  border: "rgba(220,38,38,0.25)"  },
};

const URGENCY = {
    Standard:  null,
    Urgent:    { color: "#d97706", bg: "rgba(217,119,6,0.10)",  border: "rgba(217,119,6,0.3)" },
    Emergency: { color: "#dc2626", bg: "rgba(220,38,38,0.10)",  border: "rgba(220,38,38,0.3)" },
};

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

const StatusBadge = ({ status }) => {
    const s = STATUS[status] || { label: status, color: "#71717a", bg: "transparent", border: "var(--border)" };
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 99, flexShrink: 0,
            background: s.bg, border: `1px solid ${s.border}`,
            fontSize: 11, fontWeight: 700, color: s.color,
            fontFamily: "var(--font-body)", letterSpacing: "0.04em",
        }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            {s.label}
        </span>
    );
};

const UrgencyBadge = ({ urgency }) => {
    const u = URGENCY[urgency];
    if (!u) return null;
    return (
        <span style={{
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
            background: u.bg, color: u.color, border: `1px solid ${u.border}`,
            letterSpacing: "0.06em", textTransform: "uppercase",
            fontFamily: "var(--font-body)", flexShrink: 0,
        }}>
            {urgency}
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

    const counts = {
        ALL:       quotes.length,
        PENDING:   quotes.filter(q => q.status === "PENDING").length,
        RESPONDED: quotes.filter(q => q.status === "RESPONDED").length,
        DECLINED:  quotes.filter(q => q.status === "DECLINED").length,
        PLATFORM:  quotes.filter(q => !q.sellerId).length,
    };

    const displayed = filter === "ALL"      ? quotes
        : filter === "PLATFORM"             ? quotes.filter(q => !q.sellerId)
        :                                     quotes.filter(q => q.status === filter);

    const FILTERS = [
        { key: "ALL",       label: "All" },
        { key: "PENDING",   label: "Pending" },
        { key: "RESPONDED", label: "Responded" },
        { key: "DECLINED",  label: "Declined" },
        { key: "PLATFORM",  label: "Platform" },
    ];

    return (
        <AdminLayout title="Quotes">
            <div style={{ maxWidth: 900, margin: "0 auto" }}>

                {/* ── Page header ── */}
                <div style={{ marginBottom: "var(--space-5)" }}>
                    <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.5rem", color: "var(--text)", margin: "0 0 var(--space-1)" }}>
                        Quote Requests
                    </h1>
                    <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0, fontFamily: "var(--font-body)" }}>
                        All buyer quote requests across the platform
                    </p>
                </div>

                {/* ── Stats strip ── */}
                <div style={{
                    display: "flex", gap: "var(--space-6)",
                    padding: "var(--space-4) var(--space-5)",
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: "var(--r-lg)", marginBottom: "var(--space-4)",
                    flexWrap: "wrap",
                }}>
                    {[
                        { label: "Total",     value: counts.ALL,       hi: false },
                        { label: "Pending",   value: counts.PENDING,   hi: counts.PENDING > 0 },
                        { label: "Responded", value: counts.RESPONDED, hi: false },
                        { label: "Declined",  value: counts.DECLINED,  hi: false },
                        { label: "Platform",  value: counts.PLATFORM,  hi: false, note: "Admin-created" },
                    ].map(s => (
                        <div key={s.label}>
                            <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.5rem", color: s.hi ? "var(--accent)" : "var(--text)", lineHeight: 1, margin: "0 0 3px" }}>
                                {loading ? "—" : s.value}
                            </p>
                            <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-4)", margin: 0, fontFamily: "var(--font-body)" }}>
                                {s.label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── Filter tabs ── */}
                <div style={{ display: "flex", gap: 6, marginBottom: "var(--space-4)", flexWrap: "wrap" }}>
                    {FILTERS.map(f => {
                        const isActive = filter === f.key;
                        return (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: 6,
                                    padding: "5px 14px", borderRadius: "var(--r-sm)",
                                    border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                                    background: isActive ? "var(--accent)" : "transparent",
                                    color:      isActive ? "var(--text)" : "var(--text-3)",
                                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                                    fontFamily: "var(--font-body)",
                                    transition: "background 0.15s, color 0.15s, border-color 0.15s",
                                }}
                            >
                                {f.label}
                                {counts[f.key] > 0 && (
                                    <span style={{
                                        fontSize: 10, fontWeight: 700, minWidth: 18, height: 18,
                                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                                        borderRadius: 99,
                                        background: isActive ? "oklch(0 0 0 / 0.18)" : "var(--surface-high)",
                                        color: isActive ? "var(--text)" : "var(--text-3)",
                                        padding: "0 4px",
                                    }}>
                                        {counts[f.key]}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── Quote list ── */}
                {loading ? (
                    <p style={{ color: "var(--text-4)", fontFamily: "var(--font-mono)", fontSize: 13 }}>Loading…</p>
                ) : displayed.length === 0 ? (
                    <div style={{
                        background: "var(--surface)", border: "1px solid var(--border)",
                        borderRadius: "var(--r-lg)", padding: "var(--space-8)",
                        textAlign: "center",
                    }}>
                        <p style={{ fontSize: 28, margin: "0 0 var(--space-3)" }}>📋</p>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "var(--text-base)", color: "var(--text-2)", margin: "0 0 var(--space-1)" }}>
                            No quotes match this filter
                        </p>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-4)", margin: 0 }}>
                            Try a different filter to view quote requests.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                        {displayed.map(q => {
                            const st = STATUS[q.status] || STATUS.PENDING;
                            const isPlatform = !q.sellerId;
                            return (
                                <div
                                    key={q.quoteId}
                                    style={{
                                        background: "var(--surface)",
                                        border: "1px solid var(--border)",
                                        borderLeft: `3px solid ${st.color}`,
                                        borderRadius: "var(--r-lg)",
                                        padding: "var(--space-4)",
                                        display: "flex",
                                        gap: "var(--space-4)",
                                    }}
                                >
                                    {/* Thumbnail */}
                                    <div style={{
                                        width: 44, height: 44, borderRadius: "var(--r-sm)",
                                        overflow: "hidden", border: "1px solid var(--border)",
                                        background: "var(--bg)", flexShrink: 0,
                                    }}>
                                        {q.productImageUrl
                                            ? <img src={q.productImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            : <span style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-4)", fontSize: 18 }}>📦</span>
                                        }
                                    </div>

                                    {/* Body */}
                                    <div style={{ flex: 1, minWidth: 0 }}>

                                        {/* Row 1 — product + badges */}
                                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-3)", marginBottom: "var(--space-2)", flexWrap: "wrap" }}>
                                            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text)", minWidth: 0 }}>
                                                {q.productName}
                                                {q.productPartNumber && (
                                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-4)", fontWeight: 400, marginLeft: 8 }}>
                                                        {q.productPartNumber}
                                                    </span>
                                                )}
                                            </span>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                                                {isPlatform && (
                                                    <span style={{
                                                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                                                        background: "rgba(96,165,250,0.12)", color: "#60a5fa",
                                                        border: "1px solid rgba(96,165,250,0.3)",
                                                        letterSpacing: "0.06em", textTransform: "uppercase",
                                                        fontFamily: "var(--font-body)", flexShrink: 0,
                                                    }}>
                                                        Platform
                                                    </span>
                                                )}
                                                <UrgencyBadge urgency={q.urgency} />
                                                <StatusBadge status={q.status} />
                                            </div>
                                        </div>

                                        {/* Buyer */}
                                        <div style={{ marginBottom: "var(--space-3)" }}>
                                            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text-2)", margin: "0 0 2px" }}>
                                                {q.buyerName}
                                            </p>
                                            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-3)", margin: 0 }}>
                                                {q.buyerEmail || q.contactEmail}
                                                {q.phone && <span style={{ marginLeft: 6 }}>· {q.phone}</span>}
                                            </p>
                                        </div>

                                        {/* Meta row — labeled data columns */}
                                        <div style={{ display: "flex", gap: "var(--space-5)", paddingTop: "var(--space-2)", borderTop: "1px solid var(--border)", marginBottom: q.notes ? "var(--space-3)" : 0, flexWrap: "wrap" }}>
                                            <div>
                                                <p style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-4)", margin: "0 0 2px" }}>Qty</p>
                                                <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--text-2)", margin: 0 }}>{q.qtyNeeded}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-4)", margin: "0 0 2px" }}>Submitted</p>
                                                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-2)", margin: 0 }}>{fmtDate(q.createdAt)}</p>
                                            </div>
                                            {q.sellerId && (
                                                <div>
                                                    <p style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-4)", margin: "0 0 2px" }}>Seller</p>
                                                    <p style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "var(--text-2)", margin: 0 }}>{q.sellerName}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Notes */}
                                        {q.notes && (
                                            <div style={{ margin: "var(--space-2) 0", padding: "var(--space-2) var(--space-3)", background: "var(--bg)", borderRadius: "var(--r-sm)", borderLeft: "2px solid var(--border)" }}>
                                                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-3)", fontStyle: "italic", margin: 0 }}>
                                                    "{q.notes}"
                                                </p>
                                            </div>
                                        )}

                                        {/* Responded state */}
                                        {q.status === "RESPONDED" && q.quotedPrice != null && (
                                            <div style={{ marginTop: "var(--space-3)", padding: "var(--space-3)", background: "rgba(5,150,105,0.06)", borderRadius: "var(--r-md)", border: "1px solid rgba(5,150,105,0.2)" }}>
                                                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#059669", margin: "0 0 var(--space-1)", fontFamily: "var(--font-body)" }}>Offer sent</p>
                                                <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.1rem", color: "#059669", margin: "0 0 4px" }}>
                                                    ${Number(q.quotedPrice).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 12, color: "var(--text-3)", marginLeft: 4 }}>/ unit</span>
                                                </p>
                                                {q.sellerNote && (
                                                    <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-3)", margin: 0 }}>
                                                        {q.sellerNote}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Declined state */}
                                        {q.status === "DECLINED" && (
                                            <div style={{ marginTop: "var(--space-3)", padding: "var(--space-3)", background: "rgba(220,38,38,0.05)", borderRadius: "var(--r-sm)", border: "1px solid rgba(220,38,38,0.15)" }}>
                                                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#dc2626", margin: "0 0 var(--space-1)", fontFamily: "var(--font-body)" }}>Declined</p>
                                                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-3)", margin: 0 }}>
                                                    {q.sellerNote || "No reason provided."}
                                                </p>
                                            </div>
                                        )}

                                        {/* CTA — admin can respond to any pending quote */}
                                        {q.status === "PENDING" && (
                                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-3)" }}>
                                                <button
                                                    onClick={() => setActive(q)}
                                                    style={{
                                                        padding: "var(--space-2) var(--space-5)",
                                                        borderRadius: "var(--r-md)",
                                                        background: "var(--accent)", border: "none",
                                                        color: "var(--text)", fontWeight: 700, fontSize: 13,
                                                        cursor: "pointer", whiteSpace: "nowrap",
                                                        fontFamily: "var(--font-body)",
                                                        transition: "opacity 0.15s",
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                                                >
                                                    Send offer →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
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
