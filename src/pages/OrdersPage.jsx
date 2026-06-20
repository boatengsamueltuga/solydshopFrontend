import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import toast from "react-hot-toast";
import { Step, StepLabel, Stepper } from "@mui/material";
import { HiShoppingBag, HiCube, HiRefresh } from "react-icons/hi";

const getXsrfToken = () =>
    document.cookie.split("; ").find(r => r.startsWith("XSRF-TOKEN="))?.split("=")[1];

const STATUS_STYLE = {
    PENDING:    { color: "var(--warning)",  bg: "var(--warning-subtle)",  border: "var(--warning)" },
    CONFIRMED:  { color: "var(--info)",     bg: "var(--info-subtle)",     border: "var(--info)"    },
    PROCESSING: { color: "var(--info)",     bg: "var(--info-subtle)",     border: "var(--info)"    },
    SHIPPED:    { color: "var(--accent)",   bg: "var(--accent-subtle)",   border: "var(--accent)"  },
    DELIVERED:  { color: "var(--success)",  bg: "var(--success-subtle)",  border: "var(--success)" },
    CANCELLED:  { color: "var(--error)",    bg: "var(--error-subtle)",    border: "var(--error)"   },
};

const ORDER_STEPS = ["Order Placed", "Processing", "Shipped", "Delivered"];

const getActiveStep = (status) => {
    const map = { PENDING: 0, CONFIRMED: 0, PROCESSING: 1, SHIPPED: 2, DELIVERED: 3 };
    return map[status] ?? 0;
};

const StatusBadge = ({ status }) => {
    const s = STATUS_STYLE[status] ?? { color: "var(--text-3)", bg: "var(--surface-mid)", border: "var(--border)" };
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

const OrdersPage = () => {

    const [orders,     setOrders]     = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState("");
    const [reordering, setReordering] = useState(new Set());

    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get(`/order/${user.userId}`);
                setOrders(res.data);
            } catch {
                setError("Unable to load orders. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        if (user?.userId) fetchOrders();
    }, [user]);

    if (loading) return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-3)" }}>
            <div className="solyd-spinner" />
            <p style={{ color: "var(--text-3)", fontFamily: "var(--font-body)", fontSize: "14px" }}>Loading orders…</p>
            <style>{`@keyframes solyd-spin { to { transform: rotate(360deg); } } .solyd-spinner { width: 28px; height: 28px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: solyd-spin 0.8s linear infinite; }`}</style>
        </div>
    );

    if (error) return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "var(--error)", fontFamily: "var(--font-body)", fontSize: "14px" }}>{error}</p>
        </div>
    );

    const totalSpent = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    const handleReorder = async (order) => {
        if (!user?.userId) return;
        setReordering(prev => new Set([...prev, order.orderId]));
        try {
            const xsrf = getXsrfToken();
            await Promise.all(order.items.map(item =>
                api.post(
                    `/cart/${user.userId}/items`,
                    { productId: item.productId, quantity: item.quantity },
                    { headers: { "X-XSRF-TOKEN": xsrf } }
                )
            ));
            toast.success("Items added to cart");
            navigate("/cart");
        } catch {
            toast.error("Reorder failed — some items may no longer be available.");
        } finally {
            setReordering(prev => { const s = new Set(prev); s.delete(order.orderId); return s; });
        }
    };

    return (
        <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)", fontFamily: "var(--font-body)" }}>

            {/* ── Page Header ── */}
            <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "var(--space-6) var(--space-8)" }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", color: "var(--text)", margin: 0, letterSpacing: "-0.01em" }}>
                    MY ORDERS
                </h1>
                {orders.length > 0 && (
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-3)", marginTop: "var(--space-1)" }}>
                        {orders.length} order{orders.length !== 1 ? "s" : ""} · ${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2 })} total
                    </p>
                )}
            </div>

            {/* ── Content ── */}
            <div style={{ maxWidth: "var(--content-max)", margin: "0 auto", padding: "var(--space-6)" }}>

                {/* ── Empty State ── */}
                {orders.length === 0 ? (
                    <div style={{
                        textAlign:    "center",
                        padding:      "var(--space-24) var(--space-6)",
                        background:   "var(--surface-mid)",
                        border:       "1px solid var(--border)",
                        borderRadius: "var(--r-lg)",
                    }}>
                        <HiShoppingBag style={{ fontSize: "48px", color: "var(--text-4)", marginBottom: "var(--space-4)" }} />
                        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-xl)", color: "var(--text)", margin: "0 0 var(--space-2)" }}>
                            No orders yet
                        </h2>
                        <p style={{ color: "var(--text-3)", fontSize: "14px", marginBottom: "var(--space-6)" }}>
                            Browse the catalog and place your first order.
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            style={{ padding: "var(--space-3) var(--space-6)", background: "var(--accent)", color: "var(--text)", border: "none", borderRadius: "var(--r-md)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
                        >
                            Browse Catalog
                        </button>
                    </div>

                ) : (

                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

                        {orders.map((order) => {
                            const s = STATUS_STYLE[order.status] ?? STATUS_STYLE.PENDING;
                            return (
                                <div
                                    key={order.orderId}
                                    style={{
                                        background:   "var(--surface-mid)",
                                        border:       "1px solid var(--border)",
                                        borderTop:    `4px solid ${s.border}`,
                                        borderRadius: "var(--r-lg)",
                                        overflow:     "hidden",
                                        transition:   "border-color var(--duration-fast)",
                                    }}
                                >
                                    {/* ── Order header ── */}
                                    <div style={{
                                        padding:       "var(--space-4) var(--space-5)",
                                        borderBottom:  "1px solid var(--border)",
                                        display:       "flex",
                                        flexDirection: "row",
                                        flexWrap:      "wrap",
                                        justifyContent:"space-between",
                                        alignItems:    "center",
                                        gap:           "var(--space-3)",
                                        background:    "var(--surface-high)",
                                    }}>
                                        <div>
                                            <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", margin: "0 0 2px" }}>
                                                Order
                                            </p>
                                            <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "16px", color: "var(--text)", margin: 0 }}>
                                                #{order.orderId}
                                            </p>
                                            {order.createdAt && (
                                                <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--text-3)", margin: "2px 0 0" }}>
                                                    {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                                </p>
                                            )}
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
                                            <StatusBadge status={order.status} />
                                            <div style={{ textAlign: "right" }}>
                                                <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", margin: "0 0 2px" }}>
                                                    Order Total
                                                </p>
                                                <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "18px", color: "var(--text)", margin: 0 }}>
                                                    ${Number(order.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Stepper (non-cancelled) ── */}
                                    {order.status !== "CANCELLED" ? (
                                        <div style={{ padding: "var(--space-5) var(--space-5) var(--space-4)", borderBottom: "1px solid var(--border)", background: "var(--surface-mid)" }}>
                                            <Stepper activeStep={getActiveStep(order.status)} alternativeLabel>
                                                {ORDER_STEPS.map((label) => (
                                                    <Step key={label}>
                                                        <StepLabel
                                                            sx={{
                                                                "& .MuiStepLabel-label": {
                                                                    fontSize:   { xs: "0.65rem", sm: "0.75rem" },
                                                                    fontWeight: 600,
                                                                    color:      "var(--text-3) !important",
                                                                    "&.Mui-active":    { color: "var(--accent) !important" },
                                                                    "&.Mui-completed": { color: "var(--success) !important" },
                                                                },
                                                                "& .MuiStepIcon-root": {
                                                                    color: "var(--border-mid)",
                                                                    "&.Mui-active":    { color: "var(--accent)" },
                                                                    "&.Mui-completed": { color: "var(--success)" },
                                                                },
                                                            }}
                                                        >
                                                            {label}
                                                        </StepLabel>
                                                    </Step>
                                                ))}
                                            </Stepper>
                                        </div>
                                    ) : (
                                        <div style={{ padding: "var(--space-3) var(--space-5)", background: "var(--error-subtle)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                                            <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--error)", fontWeight: 600 }}>
                                                This order was cancelled.
                                            </span>
                                        </div>
                                    )}

                                    {/* ── Order items ── */}
                                    <div style={{ padding: "var(--space-4) var(--space-5)" }}>
                                        <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", margin: "0 0 var(--space-3)" }}>
                                            {order.items.length} Item{order.items.length !== 1 ? "s" : ""}
                                        </p>

                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            {order.items.map((item, i) => (
                                                <div
                                                    key={item.productId ?? i}
                                                    style={{
                                                        display:       "flex",
                                                        justifyContent:"space-between",
                                                        alignItems:    "center",
                                                        gap:           "var(--space-3)",
                                                        padding:       "var(--space-3) 0",
                                                        borderTop:     i > 0 ? "1px solid var(--border-subtle)" : "none",
                                                        flexWrap:      "wrap",
                                                    }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                                                        {/* Product image / placeholder */}
                                                        <div style={{
                                                            width:          "44px",
                                                            height:         "44px",
                                                            background:     "var(--surface-high)",
                                                            border:         "1px solid var(--border)",
                                                            borderRadius:   "var(--r-sm)",
                                                            flexShrink:     0,
                                                            display:        "flex",
                                                            alignItems:     "center",
                                                            justifyContent: "center",
                                                            overflow:       "hidden",
                                                        }}>
                                                            {item.imageUrl ? (
                                                                <img src={item.imageUrl} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                                            ) : (
                                                                <HiCube style={{ fontSize: "18px", color: "var(--text-4)" }} />
                                                            )}
                                                        </div>

                                                        <div>
                                                            <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "13px", color: "var(--text)", margin: 0 }}>
                                                                {item.productName}
                                                            </p>
                                                            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-3)", margin: "2px 0 0" }}>
                                                                Qty: {item.quantity} · ${Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 2 })} ea
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "14px", color: "var(--text)", whiteSpace: "nowrap" }}>
                                                        ${Number(item.price * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Order total footer + Reorder */}
                                        <div style={{ marginTop: "var(--space-4)", paddingTop: "var(--space-3)", borderTop: "1px dashed var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
                                            <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-3)" }}>
                                                <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--text-3)", fontWeight: 500 }}>Order Total</span>
                                                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "16px", color: "var(--success)" }}>
                                                    ${Number(order.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleReorder(order)}
                                                disabled={reordering.has(order.orderId)}
                                                style={{
                                                    display:       "flex",
                                                    alignItems:    "center",
                                                    gap:           "var(--space-2)",
                                                    padding:       "var(--space-2) var(--space-4)",
                                                    background:    "transparent",
                                                    border:        "1px solid var(--border)",
                                                    borderRadius:  "var(--r-sm)",
                                                    color:         reordering.has(order.orderId) ? "var(--text-4)" : "var(--text-2)",
                                                    fontFamily:    "var(--font-body)",
                                                    fontSize:      "var(--text-sm)",
                                                    fontWeight:    600,
                                                    cursor:        reordering.has(order.orderId) ? "not-allowed" : "pointer",
                                                    transition:    "border-color var(--duration-fast), color var(--duration-fast)",
                                                    flexShrink:    0,
                                                }}
                                                onMouseEnter={e => { if (!reordering.has(order.orderId)) { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; } }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}
                                            >
                                                <HiRefresh style={{ fontSize: "14px" }} />
                                                {reordering.has(order.orderId) ? "Adding…" : "Reorder"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes solyd-spin { to { transform: rotate(360deg); } }
                .solyd-spinner { width: 28px; height: 28px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: solyd-spin 0.8s linear infinite; }
            `}</style>
        </div>
    );
};

export default OrdersPage;
