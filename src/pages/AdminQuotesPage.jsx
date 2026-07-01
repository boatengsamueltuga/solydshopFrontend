import { useCallback, useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import AdminLayout from "../components/layouts/AdminLayout";

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

/* ── Respond Modal ── */
const RespondModal = ({ quote, onClose, onSaved }) => {
    const [form, setForm]     = useState({ quotedPrice: "", sellerNote: "", action: "RESPOND" });
    const [saving, setSaving] = useState(false);

    const isAdminProduct = !quote.sellerId;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.action === "RESPOND" && !form.quotedPrice) {
            toast.error("Please enter a quoted price.");
            return;
        }
        setSaving(true);
        try {
            await api.put(`/admin/quotes/${quote.quoteId}/respond`, {
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
            style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-4)" }}
            onClick={onClose}
        >
            <div
                style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "var(--space-6)", width: "100%", maxWidth: 500 }}
                onClick={e => e.stopPropagation()}
            >
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "var(--text)", margin: "0 0 var(--space-4)" }}>
                    Respond to Quote
                </h3>

                {isAdminProduct && (
                    <div style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)", borderRadius: "var(--r-sm)", padding: "8px 12px", marginBottom: "var(--space-4)", fontSize: 12, color: "#60a5fa" }}>
                        Platform product — responding as admin
                    </div>
                )}

                <div style={{ background: "var(--bg)", borderRadius: "var(--r-md)", padding: "var(--space-3)", marginBottom: "var(--space-4)", fontSize: 13 }}>
                    <p style={{ margin: "0 0 4px", color: "var(--text)", fontWeight: 600 }}>{quote.productName}</p>
                    <p style={{ margin: 0, color: "var(--text-3)" }}>
                        Buyer: <strong>{quote.buyerName}</strong> ({quote.buyerEmail}) &bull; Qty: <strong>{quote.qtyNeeded}</strong> &bull; Urgency: <strong>{quote.urgency}</strong>
                    </p>
                    {quote.notes && <p style={{ margin: "6px 0 0", color: "var(--text-3)", fontStyle: "italic" }}>"{quote.notes}"</p>}
                    <p style={{ margin: "6px 0 0", color: "var(--text-3)", fontSize: 12 }}>
                        Contact: {quote.contactEmail}{quote.phone ? ` / ${quote.phone}` : ""}
                    </p>
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
                                type="number" min="0" step="0.01" required
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
                            placeholder="Additional information for the buyer…"
                            value={form.sellerNote}
                            onChange={e => setForm(f => ({ ...f, sellerNote: e.target.value }))}
                            style={{ padding: "8px 10px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13, resize: "vertical" }}
                        />
                    </label>

                    <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end", marginTop: "var(--space-1)", borderTop: "1px solid var(--border)", paddingTop: "var(--space-3)" }}>
                        <button type="button" onClick={onClose}
                            style={{ padding: "8px 18px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "transparent", color: "var(--text-2)", fontSize: 13, cursor: "pointer" }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            style={{
                                padding: "8px 18px", borderRadius: "var(--r-sm)", border: "none",
                                background: form.action === "DECLINE" ? "#dc2626" : "var(--accent)",
                                color: "#fff", fontSize: 13, fontWeight: 600,
                                cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1,
                            }}>
                            {saving ? "Sending…" : form.action === "DECLINE" ? "Decline" : "Send Response"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
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
                <RespondModal quote={active} onClose={() => setActive(null)} onSaved={fetchQuotes} />
            )}
        </AdminLayout>
    );
};

export default AdminQuotesPage;
