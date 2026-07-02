import { useCallback, useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import AdminLayout from "../components/layouts/AdminLayout";
import BackButton  from "../components/BackButton";
import { HiUserRemove } from "react-icons/hi";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon     from "@mui/icons-material/CancelOutlined";
import WarningAmberIcon       from "@mui/icons-material/WarningAmber";

const getXsrfToken = () =>
    document.cookie.split("; ").find(r => r.startsWith("XSRF-TOKEN="))?.split("=")[1];

const fmtDate = d =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

const STATUS = {
    PENDING:   { label: "Pending",   color: "var(--warning)", bg: "var(--warning-subtle)",  border: "rgba(217,119,6,0.3)"  },
    APPROVED:  { label: "Approved",  color: "var(--success)", bg: "var(--success-subtle)",  border: "rgba(5,150,105,0.3)"  },
    REJECTED:  { label: "Rejected",  color: "var(--error)",   bg: "var(--error-subtle)",    border: "rgba(220,38,38,0.3)"  },
};

const StatusBadge = ({ status }) => {
    const s = STATUS[status] ?? { label: status, color: "var(--text-3)", bg: "var(--surface-mid)", border: "var(--border)" };
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

const TABS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

/* ── Reject reason modal ─────────────────────────────────── */
const RejectModal = ({ req, onClose, onConfirm }) => {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!reason.trim()) { toast.error("Please provide a reason for rejection."); return; }
        setLoading(true);
        await onConfirm(req.id, reason.trim());
        setLoading(false);
    };

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 10001, background: "oklch(0 0 0 / 0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-4)" }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", width: "100%", maxWidth: 480, padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--error)", margin: "0 0 var(--space-2)" }}>Reject downgrade request</p>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "var(--text)", margin: "0 0 4px" }}>{req.userName}</p>
                    <p style={{ color: "var(--text-3)", fontSize: 13, margin: 0 }}>{req.userEmail}</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)" }}>
                        Reason for rejection
                    </span>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="Explain why this request is being declined. The seller will see this message."
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
                        disabled={loading || !reason.trim()}
                        style={{
                            flex: 2, padding: "var(--space-3)", background: loading ? "var(--surface-high)" : "var(--error)",
                            border: "none", borderRadius: "var(--r-md)", color: loading ? "var(--text-3)" : "#fff",
                            fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 700,
                            cursor: loading || !reason.trim() ? "not-allowed" : "pointer", opacity: !reason.trim() ? 0.5 : 1,
                        }}
                    >
                        {loading ? "Rejecting…" : "Confirm Rejection"}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── Request card ─────────────────────────────────────────── */
const RequestCard = ({ req, onApprove, onReject, approving }) => {
    const blocked = req.status === "PENDING" && ((req.openOrderCount ?? 0) > 0 || (req.pendingQuoteCount ?? 0) > 0);

    return (
        <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderLeft: `3px solid ${STATUS[req.status]?.color ?? "var(--border)"}`,
            borderRadius: "var(--r-md)", overflow: "hidden",
        }}>
            <div style={{ padding: "var(--space-4) var(--space-5)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-4)", flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", flexWrap: "wrap" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-base)", color: "var(--text)", margin: 0 }}>
                            {req.userName}
                        </p>
                        <StatusBadge status={req.status} />
                    </div>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-3)", margin: "0 0 var(--space-2)" }}>
                        {req.userEmail}
                    </p>
                    <p style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.6, margin: "0 0 var(--space-2)", fontFamily: "var(--font-body)" }}>
                        {req.reason}
                    </p>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-4)" }}>
                        Requested {fmtDate(req.createdAt)}
                    </span>

                    {req.status === "REJECTED" && req.rejectionReason && (
                        <div style={{ background: "var(--error-subtle)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "var(--r-sm)", padding: "var(--space-3) var(--space-4)", marginTop: "var(--space-3)" }}>
                            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--error)", margin: "0 0 4px" }}>Rejection reason</p>
                            <p style={{ color: "var(--text-2)", fontSize: 13, margin: 0, fontFamily: "var(--font-body)" }}>{req.rejectionReason}</p>
                        </div>
                    )}

                    {blocked && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "var(--warning-subtle)", border: "1px solid rgba(217,119,6,0.3)", borderRadius: "var(--r-sm)", padding: "var(--space-3) var(--space-4)", marginTop: "var(--space-3)" }}>
                            <WarningAmberIcon sx={{ color: "var(--warning)", fontSize: 16, flexShrink: 0, mt: "1px" }} />
                            <p style={{ color: "var(--text-2)", fontSize: 12, margin: 0, fontFamily: "var(--font-body)", lineHeight: 1.5 }}>
                                Cannot approve yet — {req.openOrderCount ?? 0} open order{req.openOrderCount === 1 ? "" : "s"} and{" "}
                                {req.pendingQuoteCount ?? 0} pending quote{req.pendingQuoteCount === 1 ? "" : "s"} must be resolved first.
                            </p>
                        </div>
                    )}
                </div>

                {req.status === "PENDING" && (
                    <div style={{ display: "flex", gap: "var(--space-2)", flexShrink: 0 }}>
                        <button
                            onClick={() => onApprove(req.id)}
                            disabled={approving === req.id || blocked}
                            title={blocked ? "Blocked by open orders or pending quotes" : undefined}
                            style={{
                                display: "flex", alignItems: "center", gap: 5,
                                padding: "var(--space-2) var(--space-4)",
                                background: "var(--accent)", border: "none", borderRadius: "var(--r-md)",
                                color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700,
                                cursor: (approving === req.id || blocked) ? "not-allowed" : "pointer",
                                opacity: (approving === req.id || blocked) ? 0.5 : 1,
                                letterSpacing: "0.03em", textTransform: "uppercase", transition: "opacity 0.15s",
                            }}
                        >
                            <CheckCircleOutlineIcon style={{ fontSize: 15 }} />
                            {approving === req.id ? "Approving…" : "Approve"}
                        </button>
                        <button
                            onClick={() => onReject(req)}
                            style={{
                                display: "flex", alignItems: "center", gap: 5,
                                padding: "var(--space-2) var(--space-4)",
                                background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                                color: "var(--text-3)", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600,
                                cursor: "pointer", letterSpacing: "0.03em", textTransform: "uppercase", transition: "border-color 0.15s, color 0.15s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--error)"; e.currentTarget.style.color = "var(--error)"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-3)"; }}
                        >
                            <CancelOutlinedIcon style={{ fontSize: 15 }} />
                            Reject
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── Main page ───────────────────────────────────────────── */
export default function AdminSellerDowngradeRequestsPage() {
    const [requests,   setRequests]   = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [activeTab,  setActiveTab]  = useState("PENDING");
    const [rejectReq,  setRejectReq]  = useState(null);
    const [approving,  setApproving]  = useState(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/seller-downgrade-requests");
            setRequests(res.data ?? []);
        } catch {
            toast.error("Failed to load downgrade requests.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const handleApprove = async (id) => {
        setApproving(id);
        try {
            await api.post(`/admin/seller-downgrade-requests/${id}/approve`, {}, { headers: { "X-XSRF-TOKEN": getXsrfToken() } });
            toast.success("Request approved — the user is now a standard buyer.");
            fetch();
        } catch {
            // global interceptor surfaces the 409 blocking-reason message
        } finally {
            setApproving(null);
        }
    };

    const handleReject = async (id, reason) => {
        try {
            await api.post(`/admin/seller-downgrade-requests/${id}/reject`, { reason }, { headers: { "X-XSRF-TOKEN": getXsrfToken() } });
            toast.success("Request rejected.");
            setRejectReq(null);
            fetch();
        } catch {
            toast.error("Failed to reject request.");
        }
    };

    const counts = {
        ALL:      requests.length,
        PENDING:  requests.filter(r => r.status === "PENDING").length,
        APPROVED: requests.filter(r => r.status === "APPROVED").length,
        REJECTED: requests.filter(r => r.status === "REJECTED").length,
    };

    const visible = activeTab === "ALL" ? requests : requests.filter(r => r.status === activeTab);

    return (
        <AdminLayout title="Seller Downgrade Requests">
            <div style={{ maxWidth: 900, margin: "0 auto" }}>

                <BackButton style={{ marginBottom: "var(--space-4)" }} />

                {/* ── Page header ── */}
                <div style={{ marginBottom: "var(--space-5)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-1)" }}>
                        <HiUserRemove style={{ fontSize: 22, color: "var(--accent)" }} />
                        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.5rem", color: "var(--text)", margin: 0 }}>
                            Downgrade Requests
                        </h1>
                        {counts.PENDING > 0 && (
                            <span style={{ padding: "2px 8px", borderRadius: 99, background: "var(--warning-subtle)", color: "var(--warning)", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                                {counts.PENDING} pending
                            </span>
                        )}
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0, fontFamily: "var(--font-body)" }}>
                        Review sellers who want to revert to a standard buyer account.
                    </p>
                </div>

                {/* ── Stats strip ── */}
                <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-5)", flexWrap: "wrap" }}>
                    {[
                        { label: "Total",    count: counts.ALL,      color: "var(--text-3)"   },
                        { label: "Pending",  count: counts.PENDING,  color: "var(--warning)"  },
                        { label: "Approved", count: counts.APPROVED, color: "var(--success)"  },
                        { label: "Rejected", count: counts.REJECTED, color: "var(--error)"    },
                    ].map(s => (
                        <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "var(--space-3) var(--space-5)", minWidth: 90, textAlign: "center" }}>
                            <p style={{ fontFamily: "var(--font-mono)", fontSize: "1.25rem", fontWeight: 700, color: s.color, margin: "0 0 2px", lineHeight: 1 }}>{s.count}</p>
                            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-4)", margin: 0 }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Tabs ── */}
                <div style={{ display: "flex", gap: "4px", marginBottom: "var(--space-4)", background: "var(--surface-mid)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "4px", width: "fit-content" }}>
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: "var(--space-2) var(--space-4)",
                                background: activeTab === tab ? "var(--surface)" : "transparent",
                                border: activeTab === tab ? "1px solid var(--border)" : "1px solid transparent",
                                borderRadius: "var(--r-sm)",
                                color: activeTab === tab ? "var(--text)" : "var(--text-3)",
                                fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                                letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer",
                                transition: "all 0.15s",
                            }}
                        >
                            {tab} {counts[tab] > 0 && <span style={{ marginLeft: 4, opacity: 0.7 }}>({counts[tab]})</span>}
                        </button>
                    ))}
                </div>

                {/* ── List ── */}
                {loading ? (
                    <p style={{ color: "var(--text-4)", fontFamily: "var(--font-mono)", fontSize: 12 }}>Loading…</p>
                ) : visible.length === 0 ? (
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "var(--space-10)", textAlign: "center" }}>
                        <p style={{ color: "var(--text-3)", margin: "0 0 var(--space-2)", fontFamily: "var(--font-display)", fontWeight: 600 }}>No {activeTab === "ALL" ? "" : activeTab.toLowerCase()} requests</p>
                        <p style={{ color: "var(--text-4)", fontSize: 13, margin: 0, fontFamily: "var(--font-body)" }}>
                            {activeTab === "PENDING" ? "All caught up — no requests are waiting for review." : "Nothing to show here."}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                        {visible.map(req => (
                            <RequestCard
                                key={req.id}
                                req={req}
                                onApprove={handleApprove}
                                onReject={setRejectReq}
                                approving={approving}
                            />
                        ))}
                    </div>
                )}

            </div>

            {rejectReq && (
                <RejectModal
                    req={rejectReq}
                    onClose={() => setRejectReq(null)}
                    onConfirm={handleReject}
                />
            )}
        </AdminLayout>
    );
}
