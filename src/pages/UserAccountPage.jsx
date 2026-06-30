import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import api from "../api/api";
import { fmtCurrency } from "../utils/format";
import { HiUser, HiMail, HiShieldCheck, HiClipboardList } from "react-icons/hi";

const ROLE_STYLE = {
    ROLE_ADMIN:  { label: "Admin",  color: "var(--error)",   bg: "var(--error-subtle)"   },
    ROLE_SELLER: { label: "Seller", color: "var(--warning)", bg: "var(--warning-subtle)" },
    ROLE_USER:   { label: "User",   color: "var(--info)",    bg: "var(--info-subtle)"    },
};

const ORDER_STATUS_STYLE = {
    PENDING:    { color: "var(--warning)",  bg: "var(--warning-subtle)"  },
    PROCESSING: { color: "var(--info)",     bg: "var(--info-subtle)"     },
    SHIPPED:    { color: "var(--accent)",   bg: "var(--accent-subtle)"   },
    DELIVERED:  { color: "var(--success)",  bg: "var(--success-subtle)"  },
    CANCELLED:  { color: "var(--error)",    bg: "var(--error-subtle)"    },
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

    const [orders,  setOrders]  = useState([]);
    const [loading, setLoading] = useState(true);

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

    const totalSpend = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const roles = user?.roles ?? [];

    return (
        <div style={{
            minHeight:   "100vh",
            background:  "var(--bg)",
            color:       "var(--text)",
            fontFamily:  "var(--font-body)",
            paddingTop:  "calc(80px + var(--space-8))",
            paddingBottom: "var(--space-12)",
        }}>
            <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 var(--space-6)" }}>

                {/* Header */}
                <div style={{ marginBottom: "var(--space-8)" }}>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "var(--space-2)" }}>
                        Account
                    </p>
                    <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", color: "var(--text)", letterSpacing: "-0.01em", margin: "0 0 var(--space-3)" }}>
                        {user?.name ?? "My Account"}
                    </h1>
                    <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                        {roles.map(r => <RoleBadge key={r} role={r} />)}
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
                    <StatCard label="Orders Placed" value={orders.length} loading={loading} />
                    <StatCard
                        label="Total Spend"
                        value={fmtCurrency(totalSpend)}
                        loading={loading}
                    />
                </div>

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
                                    {[...orders].sort((a, b) => b.orderId - a.orderId).slice(0, 5).map((order, i, arr) => (
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
                                                {(() => {
                                                    const ss = ORDER_STATUS_STYLE[order.status] ?? { color: "var(--text-3)", bg: "var(--surface-high)" };
                                                    return (
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
                                                        }}>
                                                            {order.status}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Quick links */}
                <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
                    <Link to="/orders" style={{
                        padding:       "var(--space-3) var(--space-5)",
                        background:    "var(--accent)",
                        color:         "var(--text)",
                        textDecoration: "none",
                        borderRadius:  "var(--r-md)",
                        fontFamily:    "var(--font-body)",
                        fontWeight:    700,
                        fontSize:      "var(--text-sm)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                    }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    >
                        My Orders
                    </Link>
                    <Link to="/" style={{
                        padding:       "var(--space-3) var(--space-5)",
                        background:    "transparent",
                        color:         "var(--text-2)",
                        textDecoration: "none",
                        borderRadius:  "var(--r-md)",
                        border:        "1px solid var(--border)",
                        fontFamily:    "var(--font-body)",
                        fontWeight:    600,
                        fontSize:      "var(--text-sm)",
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}
                    >
                        Browse Catalog
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default UserAccountPage;
