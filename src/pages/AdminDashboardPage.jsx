import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    HiCube,
    HiTag,
    HiClipboardList,
    HiUsers,
    HiArrowRight,
    HiCurrencyDollar,
} from "react-icons/hi";

import api from "../api/api";
import AdminLayout from "../components/layouts/AdminLayout";

/* ── Status colour map ─────────────────────────────────────────────────────── */
const STATUS_STYLE = {
    PENDING:    { color: "var(--warning)",  bg: "var(--warning-subtle)"  },
    PROCESSING: { color: "var(--info)",     bg: "var(--info-subtle)"     },
    SHIPPED:    { color: "var(--accent)",   bg: "var(--accent-subtle)"   },
    DELIVERED:  { color: "var(--success)",  bg: "var(--success-subtle)"  },
    CANCELLED:  { color: "var(--error)",    bg: "var(--error-subtle)"    },
};

const StatusBadge = ({ status }) => {
    const s = STATUS_STYLE[status] ?? { color: "var(--text-3)", bg: "var(--surface-mid)" };
    return (
        <span style={{
            display:       "inline-block",
            padding:       "2px 8px",
            borderRadius:  "var(--r-sm)",
            background:    s.bg,
            color:         s.color,
            fontSize:      "11px",
            fontWeight:    600,
            fontFamily:    "var(--font-mono)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
        }}>
            {status}
        </span>
    );
};

/* ── StatCard ──────────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, Icon, loading }) => (
    <div style={{
        background:     "var(--surface-mid)",
        border:         "1px solid var(--border)",
        borderRadius:   "var(--r-md)",
        padding:        "var(--space-5)",
        display:        "flex",
        alignItems:     "flex-start",
        justifyContent: "space-between",
        gap:            "var(--space-3)",
    }}>
        <div>
            <p style={{
                color:         "var(--text-3)",
                fontSize:      "11px",
                fontWeight:    600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontFamily:    "var(--font-body)",
                marginBottom:  "var(--space-2)",
            }}>
                {label}
            </p>
            <p style={{
                color:      "var(--text)",
                fontSize:   "2rem",
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                lineHeight: 1,
            }}>
                {loading ? "—" : value}
            </p>
        </div>
        <div style={{ color: "var(--accent)", fontSize: "24px", opacity: 0.8, flexShrink: 0 }}>
            <Icon />
        </div>
    </div>
);

/* ── QuickAction ───────────────────────────────────────────────────────────── */
const QuickAction = ({ label, Icon, onClick }) => (
    <button
        onClick={onClick}
        style={{
            display:        "flex",
            alignItems:     "center",
            gap:            "var(--space-3)",
            padding:        "var(--space-3) var(--space-4)",
            background:     "var(--surface-mid)",
            border:         "1px solid var(--border)",
            borderRadius:   "var(--r-md)",
            color:          "var(--text-2)",
            cursor:         "pointer",
            fontSize:       "14px",
            fontWeight:     500,
            fontFamily:     "var(--font-body)",
            transition:     "border-color var(--duration-fast), color var(--duration-fast)",
            width:          "100%",
            justifyContent: "space-between",
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.color = "var(--accent)";
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-2)";
        }}
    >
        <span style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <Icon style={{ fontSize: "16px" }} />
            {label}
        </span>
        <HiArrowRight style={{ fontSize: "14px" }} />
    </button>
);

/* ── AdminDashboardPage ────────────────────────────────────────────────────── */
const AdminDashboardPage = () => {
    const navigate = useNavigate();

    const [products,   setProducts]   = useState([]);
    const [categories, setCategories] = useState([]);
    const [orders,     setOrders]     = useState([]);
    const [users,      setUsers]      = useState([]);
    const [loading,    setLoading]    = useState(true);

    const fetchAll = async () => {
        try {
            const [prodRes, catRes, ordRes, usrRes] = await Promise.all([
                api.get("/public/products"),
                api.get("/public/categories"),
                api.get("/order/admin"),
                api.get("/admin/users"),
            ]);
            setProducts(prodRes.data.content ?? []);
            setCategories(catRes.data.content ?? []);
            setOrders(ordRes.data ?? []);
            setUsers(usrRes.data ?? []);
        } catch (err) {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const recentOrders = [...orders]
        .sort((a, b) => b.orderId - a.orderId)
        .slice(0, 5);

    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const revenueDisplay = "$" + totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 });

    return (
        <AdminLayout title="Dashboard">

            {/* ── Stats ── */}
            <div style={{
                display:             "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap:                 "var(--space-4)",
                marginBottom:        "var(--space-8)",
            }}>
                <StatCard label="Products"   value={products.length}   Icon={HiCube}            loading={loading} />
                <StatCard label="Categories" value={categories.length} Icon={HiTag}             loading={loading} />
                <StatCard label="Orders"     value={orders.length}     Icon={HiClipboardList}   loading={loading} />
                <StatCard label="Users"      value={users.length}      Icon={HiUsers}           loading={loading} />
                <StatCard label="Total Revenue" value={revenueDisplay} Icon={HiCurrencyDollar}  loading={loading} />
            </div>

            {/* ── Quick Actions ── */}
            <section style={{ marginBottom: "var(--space-8)" }}>
                <h2 style={{
                    color:         "var(--text-3)",
                    fontSize:      "11px",
                    fontWeight:    600,
                    fontFamily:    "var(--font-body)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom:  "var(--space-3)",
                }}>
                    Quick Actions
                </h2>
                <div style={{
                    display:             "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap:                 "var(--space-3)",
                }}>
                    <QuickAction label="Manage Products"   Icon={HiCube}          onClick={() => navigate("/admin/products")} />
                    <QuickAction label="Manage Categories" Icon={HiTag}           onClick={() => navigate("/admin/categories")} />
                    <QuickAction label="Manage Orders"     Icon={HiClipboardList} onClick={() => navigate("/admin/orders")} />
                    <QuickAction label="Manage Users"      Icon={HiUsers}         onClick={() => navigate("/admin/users")} />
                </div>
            </section>

            {/* ── Recent Orders ── */}
            <section>
                <h2 style={{
                    color:         "var(--text-3)",
                    fontSize:      "11px",
                    fontWeight:    600,
                    fontFamily:    "var(--font-body)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom:  "var(--space-3)",
                }}>
                    Recent Orders
                </h2>

                <div style={{
                    background:   "var(--surface-mid)",
                    border:       "1px solid var(--border)",
                    borderRadius: "var(--r-md)",
                    overflow:     "hidden",
                }}>
                    {loading ? (
                        <p style={{ color: "var(--text-3)", padding: "var(--space-5)", fontSize: "14px" }}>
                            Loading orders…
                        </p>
                    ) : recentOrders.length === 0 ? (
                        <p style={{ color: "var(--text-3)", padding: "var(--space-5)", fontSize: "14px" }}>
                            No orders yet.
                        </p>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                        {["Order", "Customer", "Total", "Status"].map(h => (
                                            <th key={h} style={{
                                                padding:       "var(--space-3) var(--space-4)",
                                                textAlign:     "left",
                                                color:         "var(--text-3)",
                                                fontSize:      "11px",
                                                fontWeight:    600,
                                                fontFamily:    "var(--font-body)",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.08em",
                                                whiteSpace:    "nowrap",
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order, i) => (
                                        <tr
                                            key={order.orderId}
                                            style={{
                                                borderBottom: i < recentOrders.length - 1 ? "1px solid var(--border-subtle)" : "none",
                                                cursor:       "pointer",
                                            }}
                                            onClick={() => navigate("/admin/orders")}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                        >
                                            <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                                                #{order.orderId}
                                            </td>
                                            <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--text)", fontSize: "14px" }}>
                                                {order.customerName}
                                            </td>
                                            <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--success)", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" }}>
                                                ${Number(order.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                                                <StatusBadge status={order.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

        </AdminLayout>
    );
};

export default AdminDashboardPage;
