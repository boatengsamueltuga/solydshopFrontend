import { useState } from "react";
import api from "../../api/api";
import toast from "react-hot-toast";

const URGENCY_COLOR = {
    Standard:  { color: "var(--text-3)",  bg: "var(--surface-high)", border: "var(--border)" },
    Urgent:    { color: "#d97706",         bg: "rgba(217,119,6,0.1)",  border: "rgba(217,119,6,0.3)" },
    Emergency: { color: "#dc2626",         bg: "rgba(220,38,38,0.1)",  border: "rgba(220,38,38,0.3)" },
};

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

/**
 * QuoteRespondModal — shared by SellerQuotesPage and AdminQuotesPage.
 *
 * Props:
 *   quote     — QuoteDTO
 *   endpoint  — PUT URL, e.g. "/seller/quotes/5/respond"
 *   isAdmin   — shows "Platform" badge when responding as admin
 *   onClose   — close handler
 *   onSaved   — called after successful save
 */
const QuoteRespondModal = ({ quote, endpoint, isAdmin = false, onClose, onSaved }) => {
    const [declineMode, setDeclineMode] = useState(false);
    const [price,       setPrice]       = useState("");
    const [message,     setMessage]     = useState("");
    const [declineNote, setDeclineNote] = useState("");
    const [saving,      setSaving]      = useState(false);

    const urgencyStyle = URGENCY_COLOR[quote.urgency] || URGENCY_COLOR.Standard;

    const submit = async (action) => {
        if (action === "RESPOND" && !price) {
            toast.error("Enter a unit price before sending the offer.");
            return;
        }
        setSaving(true);
        try {
            await api.put(endpoint, {
                action,
                quotedPrice: action === "RESPOND" ? Number(price) : null,
                sellerNote:  action === "RESPOND" ? message : declineNote,
            });
            toast.success(action === "RESPOND" ? "Offer sent to buyer." : "Quote declined.");
            onSaved();
            onClose();
        } catch {
            toast.error("Failed to send response. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            style={{
                position:        "fixed",
                inset:           0,
                zIndex:          9500,
                background:      "oklch(0 0 0 / 0.72)",
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
                padding:         "var(--space-4)",
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background:    "var(--surface)",
                    border:        "1px solid var(--border)",
                    borderRadius:  "var(--r-lg)",
                    width:         "100%",
                    maxWidth:      560,
                    maxHeight:     "90vh",
                    display:       "flex",
                    flexDirection: "column",
                    overflow:      "hidden",
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Modal header ── */}
                <div style={{
                    display:         "flex",
                    alignItems:      "center",
                    justifyContent:  "space-between",
                    padding:         "var(--space-4) var(--space-5)",
                    borderBottom:    "1px solid var(--border)",
                    background:      "var(--bg)",
                    flexShrink:      0,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-4)" }}>
                            {declineMode ? "Decline quote" : "Quote response"}
                        </span>
                        {isAdmin && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(96,165,250,0.12)", color: "#60a5fa", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                                Admin
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: "none", border: "none", color: "var(--text-3)", fontSize: 22, lineHeight: 1, padding: "2px 4px", cursor: "pointer", borderRadius: "var(--r-sm)" }}
                        onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
                        onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}
                        aria-label="Close"
                    >×</button>
                </div>

                {/* ── Scrollable body ── */}
                <div style={{ overflowY: "auto", flex: 1 }}>

                    {/* RECEIVED REQUEST */}
                    <div style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--border)" }}>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-4)", margin: "0 0 var(--space-3)" }}>
                            Received request
                        </p>

                        {/* Product row */}
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
                            <div style={{ width: 44, height: 44, borderRadius: "var(--r-sm)", overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg)", flexShrink: 0 }}>
                                {quote.productImageUrl
                                    ? <img src={quote.productImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : <span style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-4)", fontSize: 18 }}>📦</span>
                                }
                            </div>
                            <div>
                                <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text)", margin: 0 }}>{quote.productName}</p>
                                {quote.productPartNumber && (
                                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", margin: "2px 0 0", letterSpacing: "0.02em" }}>{quote.productPartNumber}</p>
                                )}
                            </div>
                        </div>

                        {/* Buyer details grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2) var(--space-4)" }}>
                            <Detail label="From" value={quote.buyerName} />
                            <Detail label="Email" value={quote.buyerEmail} />
                            {quote.phone && <Detail label="Phone" value={quote.phone} />}
                            <Detail label="Contact" value={quote.contactEmail} />
                            <div>
                                <p style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-4)", margin: "0 0 3px" }}>Qty</p>
                                <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text)", margin: 0 }}>{quote.qtyNeeded}</p>
                            </div>
                            <div>
                                <p style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-4)", margin: "0 0 3px" }}>Urgency</p>
                                <span style={{
                                    fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700,
                                    padding: "2px 8px", borderRadius: 99,
                                    background: urgencyStyle.bg, color: urgencyStyle.color,
                                    border: `1px solid ${urgencyStyle.border}`,
                                    display: "inline-block",
                                }}>
                                    {quote.urgency}
                                </span>
                            </div>
                            <Detail label="Submitted" value={fmtDate(quote.createdAt)} />
                        </div>

                        {quote.notes && (
                            <div style={{ marginTop: "var(--space-3)", padding: "var(--space-3)", background: "var(--surface-high)", borderRadius: "var(--r-sm)", borderLeft: "2px solid var(--border)" }}>
                                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-2)", fontStyle: "italic", margin: 0 }}>"{quote.notes}"</p>
                            </div>
                        )}
                    </div>

                    {/* YOUR OFFER / DECLINE REASON */}
                    <div style={{ padding: "var(--space-4) var(--space-5)" }}>
                        {!declineMode ? (
                            <>
                                <p style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-4)", margin: "0 0 var(--space-4)" }}>
                                    Your offer
                                </p>

                                {/* Price input with $ prefix */}
                                <div style={{ marginBottom: "var(--space-4)" }}>
                                    <label style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", display: "block", marginBottom: 6 }}>
                                        Unit price (USD) *
                                    </label>
                                    <div style={{
                                        display: "flex",
                                        border: "1px solid var(--border)",
                                        borderRadius: "var(--r-sm)",
                                        overflow: "hidden",
                                        transition: "border-color 0.15s",
                                    }}
                                        onFocusCapture={e => e.currentTarget.style.borderColor = "var(--accent)"}
                                        onBlurCapture={e => e.currentTarget.style.borderColor = "var(--border)"}
                                    >
                                        <span style={{
                                            display:     "flex",
                                            alignItems:  "center",
                                            padding:     "0 var(--space-3)",
                                            background:  "var(--bg)",
                                            borderRight: "1px solid var(--border)",
                                            fontFamily:  "var(--font-mono)",
                                            fontSize:    "var(--text-base)",
                                            fontWeight:  700,
                                            color:       "var(--text-3)",
                                            userSelect:  "none",
                                            flexShrink:  0,
                                        }}>$</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={price}
                                            onChange={e => setPrice(e.target.value)}
                                            style={{
                                                flex:       1,
                                                border:     "none",
                                                outline:    "none",
                                                padding:    "var(--space-3) var(--space-4)",
                                                background: "var(--surface-high)",
                                                color:      "var(--text)",
                                                fontFamily: "var(--font-mono)",
                                                fontSize:   "var(--text-base)",
                                                fontWeight: 600,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Message */}
                                <div>
                                    <label style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", display: "block", marginBottom: 6 }}>
                                        Message to buyer
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Lead time, shipping terms, payment conditions, availability notes…"
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        style={{
                                            width:        "100%",
                                            boxSizing:    "border-box",
                                            padding:      "var(--space-3) var(--space-4)",
                                            borderRadius: "var(--r-sm)",
                                            border:       "1px solid var(--border)",
                                            background:   "var(--surface-high)",
                                            color:        "var(--text)",
                                            fontFamily:   "var(--font-body)",
                                            fontSize:     "var(--text-sm)",
                                            resize:       "vertical",
                                            outline:      "none",
                                            transition:   "border-color 0.15s",
                                        }}
                                        onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
                                        onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
                                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#dc2626", flexShrink: 0 }} />
                                    <p style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#dc2626", margin: 0 }}>
                                        Decline reason
                                    </p>
                                </div>
                                <textarea
                                    rows={4}
                                    placeholder="Reason for declining (optional, sent to buyer)…"
                                    value={declineNote}
                                    onChange={e => setDeclineNote(e.target.value)}
                                    style={{
                                        width:        "100%",
                                        boxSizing:    "border-box",
                                        padding:      "var(--space-3) var(--space-4)",
                                        borderRadius: "var(--r-sm)",
                                        border:       "1px solid rgba(220,38,38,0.3)",
                                        background:   "rgba(220,38,38,0.04)",
                                        color:        "var(--text)",
                                        fontFamily:   "var(--font-body)",
                                        fontSize:     "var(--text-sm)",
                                        resize:       "vertical",
                                        outline:      "none",
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = "#dc2626"}
                                    onBlur={e => e.currentTarget.style.borderColor = "rgba(220,38,38,0.3)"}
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* ── Sticky footer ── */}
                <div style={{
                    display:      "flex",
                    alignItems:   "center",
                    gap:          "var(--space-2)",
                    padding:      "var(--space-4) var(--space-5)",
                    borderTop:    "1px solid var(--border)",
                    background:   "var(--surface)",
                    flexShrink:   0,
                }}>
                    {!declineMode ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setDeclineMode(true)}
                                disabled={saving}
                                style={{ padding: "var(--space-3) var(--space-4)", borderRadius: "var(--r-md)", border: "1px solid rgba(220,38,38,0.35)", background: "transparent", color: "#dc2626", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 600, cursor: "pointer", transition: "background 0.15s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(220,38,38,0.06)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                Decline quote
                            </button>
                            <div style={{ flex: 1 }} />
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={saving}
                                style={{ padding: "var(--space-3) var(--space-4)", borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: "transparent", color: "var(--text-3)", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 600, cursor: "pointer" }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => submit("RESPOND")}
                                disabled={saving}
                                style={{ padding: "var(--space-3) var(--space-5)", borderRadius: "var(--r-md)", border: "none", background: "var(--accent)", color: "var(--text)", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1, letterSpacing: "0.01em" }}
                            >
                                {saving ? "Sending…" : "Send offer →"}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => setDeclineMode(false)}
                                disabled={saving}
                                style={{ padding: "var(--space-3) var(--space-4)", borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: "transparent", color: "var(--text-3)", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 600, cursor: "pointer" }}
                            >
                                ← Back
                            </button>
                            <div style={{ flex: 1 }} />
                            <button
                                type="button"
                                onClick={() => submit("DECLINE")}
                                disabled={saving}
                                style={{ padding: "var(--space-3) var(--space-5)", borderRadius: "var(--r-md)", border: "none", background: "#dc2626", color: "#fff", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}
                            >
                                {saving ? "Declining…" : "Confirm decline"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

/* Small detail cell used in received request grid */
const Detail = ({ label, value }) => (
    <div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-4)", margin: "0 0 3px" }}>{label}</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-2)", margin: 0, wordBreak: "break-all" }}>{value || "—"}</p>
    </div>
);

export default QuoteRespondModal;
