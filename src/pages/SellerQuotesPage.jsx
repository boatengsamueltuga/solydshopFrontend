import { useCallback, useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import SellerLayout from "../components/layouts/SellerLayout";

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

/* ── Respond Modal ── */
const RespondModal = ({ quote, onClose, onSaved }) => {
    const [form, setForm]     = useState({ quotedPrice: "", sellerNote: "", action: "RESPOND" });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.action === "RESPOND" && !form.quotedPrice) {
            toast.error("Please enter a quoted price.");
            return;
        }
        setSaving(true);
        try {
            await api.put(`/seller/quotes/${quote.quoteId}/respond`, {
                action:      form.action,
                quotedPrice: form.action === "RESPOND" ? Number(form.quotedPrice) : null,
                sellerNote:  form.sellerNote,
            });
            toast.success(form.action === "RESPOND" ? "Response sent to buyer." : "Quote declined.");
            onSaved();
            onClose();
        } catch {
            toast.error("Failed to send response.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 1000,
                background: "rgba(0,0,0,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "var(--space-4)",
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-lg)",
                    padding: "var(--space-6)",
                    width: "100%", maxWidth: 480,
                }}
                onClick={e => e.stopPropagation()}
            >
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "var(--text)", margin: "0 0 var(--space-4)" }}>
                    Respond to Quote
                </h3>

                {/* Quote summary */}
                <div style={{ background: "var(--bg)", borderRadius: "var(--r-md)", padding: "var(--space-3)", marginBottom: "var(--space-4)", fontSize: 13 }}>
                    <p style={{ margin: "0 0 4px", color: "var(--text)", fontWeight: 600 }}>{quote.productName}</p>
                    <p style={{ margin: 0, color: "var(--text-3)" }}>
                        Buyer: <strong>{quote.buyerName}</strong> &bull; Qty: <strong>{quote.qtyNeeded}</strong> &bull; Urgency: <strong>{quote.urgency}</strong>
                    </p>
                    {quote.notes && <p style={{ margin: "6px 0 0", color: "var(--text-3)", fontStyle: "italic" }}>"{quote.notes}"</p>}
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "flex", flexDirection: "column", gap: 4 }}>
                        Action
                        <select
                            value={form.action}
                            onChange={e => setForm(f => ({ ...f, action: e.target.value }))}
                            style={{ padding: "8px 10px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13 }}
                        >
                            <option value="RESPOND">Send a quoted price</option>
                            <option value="DECLINE">Decline this quote</option>
                        </select>
                    </label>

                    {form.action === "RESPOND" && (
                        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "flex", flexDirection: "column", gap: 4 }}>
                            Quoted Price (USD)
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                placeholder="e.g. 249.99"
                                value={form.quotedPrice}
                                onChange={e => setForm(f => ({ ...f, quotedPrice: e.target.value }))}
                                style={{ padding: "8px 10px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13 }}
                            />
                        </label>
                    )}

                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "flex", flexDirection: "column", gap: 4 }}>
                        Note to buyer (optional)
                        <textarea
                            rows={3}
                            placeholder="Any additional information for the buyer…"
                            value={form.sellerNote}
                            onChange={e => setForm(f => ({ ...f, sellerNote: e.target.value }))}
                            style={{ padding: "8px 10px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13, resize: "vertical" }}
                        />
                    </label>

                    <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end", marginTop: "var(--space-1)" }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: "8px 18px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "transparent", color: "var(--text-2)", fontSize: 13, cursor: "pointer" }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                padding: "8px 18px", borderRadius: "var(--r-sm)", border: "none",
                                background: form.action === "DECLINE" ? "#dc2626" : "var(--accent)",
                                color: "#fff", fontSize: 13, fontWeight: 600,
                                cursor: saving ? "not-allowed" : "pointer",
                                opacity: saving ? 0.7 : 1,
                            }}
                        >
                            {saving ? "Sending…" : form.action === "DECLINE" ? "Decline Quote" : "Send Response"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
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
                <RespondModal
                    quote={active}
                    onClose={() => setActive(null)}
                    onSaved={fetchQuotes}
                />
            )}
        </SellerLayout>
    );
};

export default SellerQuotesPage;
