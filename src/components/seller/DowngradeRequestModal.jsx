import { useState } from "react";
import toast from "react-hot-toast";

/**
 * DowngradeRequestModal — reason prompt for a seller requesting to revert
 * to a standard buyer account. Shared by SellerDashboardPage (Account
 * Management) and UserAccountPage (Seller access section) so both entry points submit
 * through the exact same UX and validation.
 */
const DowngradeRequestModal = ({ onClose, onConfirm }) => {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const tooShort = reason.trim().length > 0 && reason.trim().length < 10;

    const handleConfirm = async () => {
        if (reason.trim().length < 10) { toast.error("Please provide at least 10 characters explaining why."); return; }
        setLoading(true);
        await onConfirm(reason.trim());
        setLoading(false);
    };

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 10001, background: "oklch(0 0 0 / 0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-4)" }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderTop: "3px solid var(--error)", borderRadius: "var(--r-lg)", width: "100%", maxWidth: 480, padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--error)", margin: "0 0 var(--space-2)" }}>
                        Revert to buyer account
                    </p>
                    <p style={{ color: "var(--text-2)", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                        An admin will review your request. If approved, your seller access will be removed and your
                        product listings will be archived. You can reapply to sell again anytime.
                    </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)" }}>
                        Why are you stepping down?
                    </span>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="e.g. I'm no longer able to fulfill orders, or I'm winding down this business…"
                        rows={4}
                        autoFocus
                        style={{
                            width: "100%", background: "var(--surface-high)", border: "1px solid var(--border)",
                            borderRadius: "var(--r-sm)", color: "var(--text)", fontFamily: "var(--font-body)",
                            fontSize: "var(--text-sm)", padding: "var(--space-3) var(--space-4)", outline: "none",
                            boxSizing: "border-box", resize: "vertical", transition: "border-color 0.15s",
                        }}
                        onFocus={e => { e.target.style.borderColor = "var(--error)"; }}
                        onBlur={e => { e.target.style.borderColor = "var(--border)"; }}
                    />
                    {tooShort && (
                        <span style={{ fontSize: 11, color: "var(--text-4)", fontFamily: "var(--font-mono)" }}>
                            At least 10 characters ({reason.trim().length}/10)
                        </span>
                    )}
                </div>

                <div style={{ display: "flex", gap: "var(--space-3)" }}>
                    <button
                        onClick={onClose}
                        style={{ flex: 1, padding: "var(--space-3)", background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--r-md)", color: "var(--text-3)", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 600, cursor: "pointer" }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading || reason.trim().length < 10}
                        style={{
                            flex: 2, padding: "var(--space-3)", background: loading ? "var(--surface-high)" : "var(--error)",
                            border: "none", borderRadius: "var(--r-md)", color: loading ? "var(--text-3)" : "#fff",
                            fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 700,
                            cursor: loading || reason.trim().length < 10 ? "not-allowed" : "pointer",
                            opacity: reason.trim().length < 10 ? 0.5 : 1,
                        }}
                    >
                        {loading ? "Submitting…" : "Submit Request"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DowngradeRequestModal;
