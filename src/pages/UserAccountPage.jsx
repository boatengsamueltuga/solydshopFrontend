import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";
import { fmtCurrency } from "../utils/format";
import { HiUser, HiMail, HiShieldCheck, HiClipboardList, HiUserRemove } from "react-icons/hi";
import ListAltOutlinedIcon    from "@mui/icons-material/ListAltOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import DowngradeRequestModal from "../components/seller/DowngradeRequestModal";

const getXsrfToken = () =>
    document.cookie.split("; ").find(r => r.startsWith("XSRF-TOKEN="))?.split("=")[1];

const ROLE_STYLE = {
    ROLE_ADMIN:  { label: "Admin",  color: "var(--error)",   bg: "var(--error-subtle)"   },
    ROLE_SELLER: { label: "Seller", color: "var(--warning)", bg: "var(--warning-subtle)" },
    ROLE_USER:   { label: "User",   color: "var(--info)",    bg: "var(--info-subtle)"    },
};

const ORDER_STATUS_STYLE = {
    PENDING:         { color: "var(--warning)",  bg: "var(--warning-subtle)"  },
    PAYMENT_PENDING: { color: "var(--warning)",  bg: "var(--warning-subtle)"  },
    PROCESSING:      { color: "var(--info)",     bg: "var(--info-subtle)"     },
    SHIPPED:         { color: "var(--accent)",   bg: "var(--accent-subtle)"   },
    DELIVERED:       { color: "var(--success)",  bg: "var(--success-subtle)"  },
    CANCELLED:       { color: "var(--error)",    bg: "var(--error-subtle)"    },
};

const RoleBadge = ({ role }) => {
    const s = ROLE_STYLE[role] ?? { label: role, color: "var(--text-3)", bg: "var(--surface-mid)" };
    return (
        <span style={{
            padding:       "2px 8px",
            borderRadius:  "var(--r-sm)",
            background:    s.bg,
            color:         s.color,
            fontSize:      "11px",
            fontWeight:    600,
            fontFamily:    "var(--font-mono)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
        }}>
            {s.label}
        </span>
    );
};

const InfoRow = ({ icon: Icon, label, value }) => (
    <div style={{
        display:       "flex",
        alignItems:    "center",
        gap:           "var(--space-3)",
        padding:       "var(--space-3) 0",
        borderBottom:  "1px solid var(--border-subtle)",
    }}>
        <span style={{ color: "var(--accent)", fontSize: "18px", flexShrink: 0 }}><Icon /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", margin: "0 0 2px" }}>{label}</p>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text)", margin: 0, wordBreak: "break-word" }}>{value}</div>
        </div>
    </div>
);

const StatCard = ({ label, value, loading }) => (
    <div style={{
        background:   "var(--surface-mid)",
        border:       "1px solid var(--border)",
        borderTop:    "3px solid var(--accent)",
        borderRadius: "var(--r-md)",
        padding:      "var(--space-4) var(--space-5)",
        textAlign:    "center",
        overflow:     "hidden",
        minWidth:     0,
    }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(0.95rem, 3.5vw, 1.75rem)", fontWeight: 700, color: "var(--text)", lineHeight: 1.2, margin: "0 0 var(--space-1)", wordBreak: "break-word" }}>
            {loading ? "—" : value}
        </p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", margin: 0 }}>
            {label}
        </p>
    </div>
);

const UserAccountPage = () => {
    const { user } = useSelector(s => s.auth);
    const navigate = useNavigate();

    const [orders,    setOrders]    = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [sellerApp, setSellerApp] = useState(undefined); // undefined = loading
    const [downgradeRequest,   setDowngradeRequest]   = useState(undefined); // undefined = loading, null = none
    const [showDowngradeModal, setShowDowngradeModal] = useState(false);

    useEffect(() => {
        if (!user?.userId) { setLoading(false); return; }
        const fetch = async () => {
            try {
                const res = await api.get("/order/my");
                setOrders(res.data ?? []);
            } catch {
                /* non-critical */
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [user]);

    const roles = user?.roles ?? [];
    const isBuyerOnly = roles.includes("ROLE_USER") && !roles.includes("ROLE_SELLER") && !roles.includes("ROLE_ADMIN");
    const isSeller    = roles.includes("ROLE_SELLER");

    useEffect(() => {
        if (!isBuyerOnly) { setSellerApp(null); return; }
        api.get("/seller-applications/my", { silent: true })
            .then(r => setSellerApp(r.data))
            .catch(() => setSellerApp(null));
    }, [isBuyerOnly]);

    useEffect(() => {
        if (!isSeller) { setDowngradeRequest(null); return; }
        api.get("/seller-downgrade-requests/my", { silent: true })
            .then(r => setDowngradeRequest(r.data))
            .catch(() => setDowngradeRequest(null));
    }, [isSeller]);

    const handleSubmitDowngrade = async (reason) => {
        try {
            const res = await api.post("/seller-downgrade-requests", { reason }, {
                headers: { "X-XSRF-TOKEN": getXsrfToken() },
            });
            toast.success("Request submitted — an admin will review it shortly.");
            setDowngradeRequest(res.data);
            setShowDowngradeModal(false);
        } catch {
            // global interceptor already surfaced the error toast
        }
    };

    const totalSpend = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const initials = (user?.name ?? "U")
        .split(" ")
        .map(w => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <div style={{
            minHeight:     "100vh",
            background:    "var(--bg)",
            color:         "var(--text)",
            fontFamily:    "var(--font-body)",
            paddingBottom: "var(--space-12)",
        }}>

            {/* Quick actions — icon launcher strip */}
            <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                <div style={{ maxWidth: "680px", margin: "0 auto", padding: "var(--space-3) var(--space-6)", display: "flex", gap: "var(--space-2)" }}>
                    {[
                        { to: "/orders",     Icon: ListAltOutlinedIcon,     label: "Orders"  },
                        { to: "/quotes/my",  Icon: RequestQuoteOutlinedIcon, label: "Quotes"  },
                        { to: "/",           Icon: StorefrontOutlinedIcon,   label: "Catalog" },
                    ].map(({ to, Icon, label }) => (
                        <Link
                            key={to}
                            to={to}
                            style={{
                                display:        "flex",
                                flexDirection:  "column",
                                alignItems:     "center",
                                gap:            "4px",
                                padding:        "var(--space-2) var(--space-4)",
                                textDecoration: "none",
                                borderRadius:   "var(--r-md)",
                                color:          "var(--text-3)",
                                transition:     "background 0.15s, color 0.15s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-mid)"; e.currentTarget.style.color = "var(--accent)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent";        e.currentTarget.style.color = "var(--text-3)";  }}
                        >
                            <Icon style={{ fontSize: 22 }} />
                            <span style={{
                                fontFamily:    "var(--font-body)",
                                fontSize:      "10px",
                                fontWeight:    600,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                lineHeight:    1,
                            }}>
                                {label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Profile header band */}
            <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                <div style={{ maxWidth: "680px", margin: "0 auto", padding: "var(--space-6) var(--space-6)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                        {/* Avatar */}
                        <div style={{
                            width:          "52px",
                            height:         "52px",
                            borderRadius:   "50%",
                            background:     "var(--accent)",
                            color:          "var(--bg)",
                            display:        "flex",
                            alignItems:     "center",
                            justifyContent: "center",
                            fontFamily:     "var(--font-mono)",
                            fontWeight:     700,
                            fontSize:       "18px",
                            flexShrink:     0,
                        }}>
                            {initials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", margin: "0 0 4px" }}>
                                Account
                            </p>
                            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(1.25rem, 4vw, 1.75rem)", color: "var(--text)", letterSpacing: "-0.01em", margin: "0 0 var(--space-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {user?.name ?? "My Account"}
                            </h1>
                            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                                {roles.map(r => <RoleBadge key={r} role={r} />)}
                            </div>
                        </div>
                    </div>

                    {/* Stats inline */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "var(--space-4)", marginTop: "var(--space-5)" }}>
                        <StatCard label="Orders Placed" value={orders.length} loading={loading} />
                        <StatCard label="Total Spend" value={fmtCurrency(totalSpend)} loading={loading} />
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: "680px", margin: "0 auto", padding: "var(--space-6) var(--space-6) 0" }}>

                {/* Profile Details */}
                <section style={{
                    background:    "var(--surface-mid)",
                    border:        "1px solid var(--border)",
                    borderRadius:  "var(--r-md)",
                    padding:       "var(--space-5)",
                    marginBottom:  "var(--space-6)",
                }}>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "var(--space-4)" }}>
                        Profile
                    </p>
                    <InfoRow icon={HiUser}       label="Name"  value={user?.name ?? "—"} />
                    <InfoRow icon={HiMail}       label="Email" value={user?.email    ?? "—"} />
                    <InfoRow icon={HiShieldCheck} label="Role"
                        value={
                            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginTop: "2px" }}>
                                {roles.map(r => <RoleBadge key={r} role={r} />)}
                            </div>
                        }
                    />
                </section>

                {/* ── Seller access section (buyers only) ── */}
                {isBuyerOnly && sellerApp !== undefined && (() => {
                    const status = sellerApp?.status;

                    if (!sellerApp || status === "REJECTED") return (
                        <section style={{ background: "var(--surface-mid)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "var(--space-5)", marginBottom: "var(--space-6)" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-4)", flexWrap: "wrap" }}>
                                <div>
                                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", margin: "0 0 var(--space-1)" }}>
                                        Sell on SolydShop
                                    </p>
                                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--text)", margin: "0 0 var(--space-2)" }}>
                                        {status === "REJECTED" ? "Application not approved" : "List your products and reach more buyers"}
                                    </p>
                                    {status === "REJECTED" ? (
                                        <p style={{ color: "var(--text-3)", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                                            {sellerApp.rejectionReason ?? "Your previous application was not approved."}{" "}
                                            <span style={{ color: "var(--text-4)" }}>You can update your details and reapply below.</span>
                                        </p>
                                    ) : (
                                        <p style={{ color: "var(--text-3)", fontSize: 13, margin: 0 }}>
                                            Apply to become a seller. Applications are reviewed by our team before access is granted.
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => navigate("/seller-application")}
                                    style={{
                                        flexShrink: 0, padding: "var(--space-3) var(--space-5)",
                                        background: "var(--accent)", border: "none", borderRadius: "var(--r-md)",
                                        color: "var(--text)", fontFamily: "var(--font-body)", fontWeight: 700,
                                        fontSize: "var(--text-sm)", cursor: "pointer", letterSpacing: "0.04em",
                                        textTransform: "uppercase", transition: "opacity 0.15s", whiteSpace: "nowrap",
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
                                    onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                                >
                                    {status === "REJECTED" ? "Reapply" : "Apply now"}
                                </button>
                            </div>
                        </section>
                    );

                    if (status === "PENDING") return (
                        <section style={{ background: "var(--surface-mid)", border: "1px solid var(--warning)", borderRadius: "var(--r-md)", overflow: "hidden", marginBottom: "var(--space-6)" }}>
                            <div style={{ background: "color-mix(in srgb, var(--warning) 15%, transparent)", padding: "var(--space-3) var(--space-5)", borderBottom: "1px solid color-mix(in srgb, var(--warning) 30%, transparent)" }}>
                                <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--warning)", margin: 0 }}>
                                    Seller Application · Under Review
                                </p>
                            </div>
                            <div style={{ padding: "var(--space-4) var(--space-5)" }}>
                                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--text)", margin: "0 0 var(--space-2)" }}>
                                    {sellerApp.businessName}
                                </p>
                                <p style={{ color: "var(--text-3)", fontSize: 13, margin: 0 }}>
                                    Your application is being reviewed. We'll notify you once a decision has been made.
                                </p>
                            </div>
                        </section>
                    );

                    return null;
                })()}

                {/* ── Seller access section (sellers only) ── */}
                {isSeller && downgradeRequest !== undefined && (() => {
                    const status = downgradeRequest?.status;

                    if (status === "PENDING") return (
                        <section style={{ background: "var(--surface-mid)", border: "1px solid var(--warning)", borderRadius: "var(--r-md)", overflow: "hidden", marginBottom: "var(--space-6)" }}>
                            <div style={{ background: "color-mix(in srgb, var(--warning) 15%, transparent)", padding: "var(--space-3) var(--space-5)", borderBottom: "1px solid color-mix(in srgb, var(--warning) 30%, transparent)" }}>
                                <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--warning)", margin: 0 }}>
                                    Downgrade Request · Under Review
                                </p>
                            </div>
                            <div style={{ padding: "var(--space-4) var(--space-5)" }}>
                                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--text)", margin: "0 0 var(--space-2)" }}>
                                    Revert to buyer account
                                </p>
                                <p style={{ color: "var(--text-3)", fontSize: 13, margin: 0 }}>
                                    You've asked to revert to a standard buyer account. An admin is reviewing your request — you'll be notified once a decision is made.
                                </p>
                            </div>
                        </section>
                    );

                    return (
                        <section style={{ background: "var(--surface-mid)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "var(--space-5)", marginBottom: "var(--space-6)" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-4)", flexWrap: "wrap" }}>
                                <div>
                                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--error)", margin: "0 0 var(--space-1)" }}>
                                        Selling on SolydShop
                                    </p>
                                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--text)", margin: "0 0 var(--space-2)" }}>
                                        Step down from your seller account
                                    </p>
                                    {status === "REJECTED" ? (
                                        <p style={{ color: "var(--text-3)", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                                            Your last downgrade request was declined
                                            {downgradeRequest?.rejectionReason ? `: ${downgradeRequest.rejectionReason}` : "."}{" "}
                                            <span style={{ color: "var(--text-4)" }}>You can submit a new request below.</span>
                                        </p>
                                    ) : (
                                        <p style={{ color: "var(--text-3)", fontSize: 13, margin: 0 }}>
                                            Revert to a standard buyer account. Requires admin approval — your product listings
                                            will be archived if approved.
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowDowngradeModal(true)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                                        padding: "var(--space-3) var(--space-5)",
                                        background: "transparent", border: "1px solid var(--error)", borderRadius: "var(--r-md)",
                                        color: "var(--error)", fontFamily: "var(--font-body)", fontWeight: 700,
                                        fontSize: "var(--text-sm)", cursor: "pointer", letterSpacing: "0.02em",
                                        transition: "background-color 0.15s", whiteSpace: "nowrap",
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = "var(--error-subtle)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                                >
                                    <HiUserRemove size={15} />
                                    {status === "REJECTED" ? "Request again" : "Revert to buyer"}
                                </button>
                            </div>
                        </section>
                    );
                })()}

                {/* Recent Orders */}
                <section style={{
                    background:    "var(--surface-mid)",
                    border:        "1px solid var(--border)",
                    borderRadius:  "var(--r-md)",
                    overflow:      "hidden",
                    marginBottom:  "var(--space-6)",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--border)" }}>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", margin: 0 }}>
                            Recent Orders
                        </p>
                        <Link to="/orders" style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-2)", textDecoration: "none" }}
                            onMouseEnter={e => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.textDecoration = "underline"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.textDecoration = "none"; }}
                        >
                            View all →
                        </Link>
                    </div>

                    {loading ? (
                        <p style={{ padding: "var(--space-5)", color: "var(--text-3)", fontSize: "var(--text-sm)" }}>Loading…</p>
                    ) : orders.length === 0 ? (
                        <div style={{ padding: "var(--space-8)", textAlign: "center" }}>
                            <HiClipboardList style={{ fontSize: "32px", color: "var(--text-4)", marginBottom: "var(--space-3)" }} />
                            <p style={{ color: "var(--text-3)", fontSize: "var(--text-sm)", margin: "0 0 var(--space-4)" }}>No orders yet.</p>
                            <Link to="/" style={{ color: "var(--accent)", fontWeight: 600, fontSize: "var(--text-sm)", textDecoration: "none" }}>
                                Browse the catalog →
                            </Link>
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                        {["Order", "Total", "Status"].map(h => (
                                            <th key={h} style={{ padding: "var(--space-3) var(--space-4)", textAlign: "left", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", whiteSpace: "nowrap" }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...orders].sort((a, b) => b.orderId - a.orderId).slice(0, 5).map((order, i, arr) => {
                                        const ss = ORDER_STATUS_STYLE[order.status] ?? { color: "var(--text-3)", bg: "var(--surface-high)" };
                                        return (
                                            <tr key={order.orderId}
                                                style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
                                            >
                                                <td style={{ padding: "var(--space-3) var(--space-4)", fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-3)" }}>
                                                    #{order.orderId}
                                                </td>
                                                <td style={{ padding: "var(--space-3) var(--space-4)", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600, color: "var(--success)", whiteSpace: "nowrap" }}>
                                                    {fmtCurrency(order.totalAmount)}
                                                </td>
                                                <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                                                    <span style={{
                                                        fontFamily:    "var(--font-mono)",
                                                        fontSize:      "11px",
                                                        fontWeight:    600,
                                                        letterSpacing: "0.04em",
                                                        textTransform: "uppercase",
                                                        padding:       "2px 8px",
                                                        borderRadius:  "var(--r-sm)",
                                                        background:    ss.bg,
                                                        color:         ss.color,
                                                        whiteSpace:    "nowrap",
                                                    }}>
                                                        {order.status.replace(/_/g, " ")}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

            </div>

            {showDowngradeModal && (
                <DowngradeRequestModal
                    onClose={() => setShowDowngradeModal(false)}
                    onConfirm={handleSubmitDowngrade}
                />
            )}
        </div>
    );
};

export default UserAccountPage;
