import { useCallback, useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import SellerLayout from "../components/layouts/SellerLayout";
import QuoteRespondModal from "../components/quotes/QuoteRespondModal";

const STATUS_STYLE = {
    PENDING:   { label: "Pending",   color: "#d97706" },
    RESPONDED: { label: "Responded", color: "#059669" },
    DECLINED:  { label: "Declined",  color: "#dc2626" },
};

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

const StatusDot = ({ status }) => {
    const s = STATUS_STYLE[status] || { label: status, color: "#71717a" };
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <span style={{ color: s.color, fontSize: 12, fontWeight: 600 }}>{s.label}</span>
        </span>
    );
};

/* ── Main page ── */
const SellerQuotesPage = () => {
    const [quotes,   setQuotes]   = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [active,   setActive]   = useState(null); // quote being responded to
    const [filter,   setFilter]   = useState("ALL");

    const fetchQuotes = useCallback(async () => {
        try {
            const res = await api.get("/seller/quotes");
            setQuotes(res.data);
        } catch {
            toast.error("Failed to load quotes.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

    const displayed = filter === "ALL" ? quotes : quotes.filter(q => q.status === filter);

    return (
        <SellerLayout title="Quote Requests">
            <div style={{ maxWidth: 860, margin: "0 auto" }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-5)", flexWrap: "wrap", gap: "var(--space-3)" }}>
                    <div>
                        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.5rem", color: "var(--text)", margin: 0 }}>
                            Quote Requests
                        </h1>
                        <p style={{ fontSize: 13, color: "var(--text-3)", margin: "4px 0 0", fontFamily: "var(--font-body)" }}>
                            Buyers requesting custom pricing for your products
                        </p>
                    </div>

                    {/* Filter tabs */}
                    <div style={{ display: "flex", gap: 6 }}>
                        {["ALL", "PENDING", "RESPONDED", "DECLINED"].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    padding: "5px 14px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)",
                                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                                    background: filter === f ? "var(--accent)" : "transparent",
                                    color:      filter === f ? "#fff" : "var(--text-3)",
                                }}
                            >
                                {f === "ALL" ? "All" : STATUS_STYLE[f]?.label ?? f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quote cards */}
                {loading ? (
                    <p style={{ color: "var(--text-4)", fontFamily: "var(--font-mono)", fontSize: 13 }}>Loading…</p>
                ) : displayed.length === 0 ? (
                    <div style={{
                        background: "var(--surface)", border: "1px solid var(--border)",
                        borderRadius: "var(--r-lg)", padding: "var(--space-8)",
                        textAlign: "center",
                    }}>
                        <p style={{ color: "var(--text-3)", fontFamily: "var(--font-body)", margin: 0 }}>
                            {filter === "ALL" ? "No quote requests yet." : `No ${STATUS_STYLE[filter]?.label.toLowerCase()} quotes.`}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                        {displayed.map(q => (
                            <div
                                key={q.quoteId}
                                style={{
                                    background: "var(--surface)", border: "1px solid var(--border)",
                                    borderRadius: "var(--r-lg)", padding: "var(--space-4)",
                                    display: "grid",
                                    gridTemplateColumns: "48px 1fr auto",
                                    gap: "var(--space-4)",
                                    alignItems: "start",
                                }}
                            >
                                {/* Product thumbnail */}
                                <div style={{
                                    width: 48, height: 48, borderRadius: "var(--r-sm)",
                                    overflow: "hidden", border: "1px solid var(--border)",
                                    background: "var(--bg)", flexShrink: 0,
                                }}>
                                    {q.productImageUrl
                                        ? <img src={q.productImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        : <span style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-4)", fontSize: 18 }}>📦</span>
                                    }
                                </div>

                                {/* Details */}
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                                        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", fontFamily: "var(--font-display)" }}>
                                            {q.productName}
                                        </span>
                                        <StatusDot status={q.status} />
                                    </div>
                                    <p style={{ fontSize: 12, color: "var(--text-3)", margin: "0 0 6px", fontFamily: "var(--font-body)" }}>
                                        From <strong>{q.buyerName}</strong> ({q.buyerEmail}) &bull; Qty: <strong>{q.qtyNeeded}</strong> &bull; Urgency: <strong>{q.urgency}</strong> &bull; {fmtDate(q.createdAt)}
                                    </p>
                                    {q.contactEmail && (
                                        <p style={{ fontSize: 12, color: "var(--text-3)", margin: "0 0 4px" }}>
                                            Contact: {q.contactEmail}{q.phone ? ` / ${q.phone}` : ""}
                                        </p>
                                    )}
                                    {q.notes && (
                                        <p style={{ fontSize: 12, color: "var(--text-3)", margin: "0 0 4px", fontStyle: "italic" }}>
                                            "{q.notes}"
                                        </p>
                                    )}
                                    {q.status !== "PENDING" && q.sellerNote && (
                                        <p style={{ fontSize: 12, color: "var(--text-2)", margin: "4px 0 0", background: "var(--bg)", padding: "4px 8px", borderRadius: "var(--r-sm)", display: "inline-block" }}>
                                            Your note: {q.sellerNote}
                                        </p>
                                    )}
                                    {q.status === "RESPONDED" && q.quotedPrice != null && (
                                        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", margin: "6px 0 0" }}>
                                            Quoted: ${Number(q.quotedPrice).toFixed(2)}
                                        </p>
                                    )}
                                </div>

                                {/* Action */}
                                {q.status === "PENDING" && (
                                    <button
                                        onClick={() => setActive(q)}
                                        style={{
                                            padding: "7px 16px", borderRadius: "var(--r-sm)",
                                            background: "var(--accent)", border: "none",
                                            color: "#fff", fontWeight: 600, fontSize: 13,
                                            cursor: "pointer", whiteSpace: "nowrap",
                                        }}
                                    >
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
                    endpoint={`/seller/quotes/${active.quoteId}/respond`}
                    onClose={() => setActive(null)}
                    onSaved={fetchQuotes}
                />
            )}
        </SellerLayout>
    );
};

export default SellerQuotesPage;
