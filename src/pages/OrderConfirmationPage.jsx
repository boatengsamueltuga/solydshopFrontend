import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api/api";
import { HiCheckCircle, HiExternalLink } from "react-icons/hi";

const OrderConfirmationPage = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");
    const { user } = useSelector((s) => s.auth);

    const [order,   setOrder]   = useState(null);
    const [loading, setLoading] = useState(Boolean(orderId));

    useEffect(() => {
        if (!orderId || !user?.userId) return;
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/order/my`);
                const found = (res.data ?? []).find(o => String(o.orderId) === String(orderId));
                setOrder(found ?? null);
            } catch {
                /* order details optional — confirmation still shows */
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId, user?.userId]);

    return (
        <div style={{
            minHeight:      "100vh",
            background:     "var(--bg)",
            color:          "var(--text)",
            fontFamily:     "var(--font-body)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            padding:        "var(--space-6)",
        }}>
            <div style={{ maxWidth: "560px", width: "100%" }}>

                {/* Success icon */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--space-6)" }}>
                    <div style={{
                        width:        "72px",
                        height:       "72px",
                        borderRadius: "50%",
                        background:   "var(--success-subtle)",
                        border:       "1px solid var(--success)",
                        display:      "flex",
                        alignItems:   "center",
                        justifyContent: "center",
                        color:        "var(--success)",
                        fontSize:     "36px",
                    }}>
                        <HiCheckCircle />
                    </div>
                </div>

                {/* Heading */}
                <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
                    <p style={{
                        fontFamily:    "var(--font-mono)",
                        fontSize:      "var(--text-2xs)",
                        fontWeight:    600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color:         "var(--success)",
                        marginBottom:  "var(--space-3)",
                    }}>
                        Order Confirmed
                    </p>
                    <h1 style={{
                        fontFamily:    "var(--font-display)",
                        fontWeight:    700,
                        fontSize:      "var(--text-2xl)",
                        color:         "var(--text)",
                        letterSpacing: "-0.01em",
                        margin:        "0 0 var(--space-3)",
                    }}>
                        Thank you for your order
                    </h1>
                    {orderId && (
                        <p style={{
                            fontFamily: "var(--font-mono)",
                            fontSize:   "var(--text-sm)",
                            color:      "var(--text-3)",
                        }}>
                            Order #{orderId}
                        </p>
                    )}
                </div>

                {/* Order summary card */}
                {!loading && order && (
                    <div style={{
                        background:    "var(--surface-mid)",
                        border:        "1px solid var(--border)",
                        borderRadius:  "var(--r-md)",
                        padding:       "var(--space-5)",
                        marginBottom:  "var(--space-6)",
                    }}>
                        <p style={{
                            fontFamily:    "var(--font-mono)",
                            fontSize:      "var(--text-2xs)",
                            fontWeight:    600,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color:         "var(--text-3)",
                            marginBottom:  "var(--space-4)",
                        }}>
                            Order Summary
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                            <Row label="Status" value={
                                <span style={{
                                    fontFamily:    "var(--font-mono)",
                                    fontSize:      "11px",
                                    fontWeight:    600,
                                    letterSpacing: "0.04em",
                                    textTransform: "uppercase",
                                    color:         "var(--warning)",
                                    background:    "var(--warning-subtle)",
                                    padding:       "2px 8px",
                                    borderRadius:  "var(--r-sm)",
                                }}>
                                    {order.status}
                                </span>
                            } />
                            <Row label="Total"
                                value={
                                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--success)" }}>
                                        ${Number(order.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </span>
                                }
                            />
                            {order.shippingAddress && (
                                <Row label="Ship to" value={<span style={{ color: "var(--text-2)", whiteSpace: "pre-line", display: "block" }}>{order.shippingAddress}</span>} />
                            )}
                        </div>

                        {/* Items */}
                        {order.orderItems?.length > 0 && (
                            <div style={{ marginTop: "var(--space-4)", borderTop: "1px solid var(--border)", paddingTop: "var(--space-4)" }}>
                                <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "var(--space-3)" }}>
                                    Items
                                </p>
                                {order.orderItems.map((item, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-2) 0", borderBottom: i < order.orderItems.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                                        <div>
                                            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text)", margin: 0 }}>{item.productName}</p>
                                            <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-3)", margin: 0 }}>Qty: {item.quantity}</p>
                                        </div>
                                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-2)", whiteSpace: "nowrap" }}>
                                            ${Number(item.orderedProductPrice * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Info message */}
                <div style={{
                    background:    "var(--accent-subtle)",
                    border:        "1px solid var(--accent-border)",
                    borderRadius:  "var(--r-md)",
                    padding:       "var(--space-4)",
                    marginBottom:  "var(--space-8)",
                }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-2)", lineHeight: 1.6, margin: 0 }}>
                        Your order has been received and is being processed. You can track the status in your order history.
                    </p>
                </div>

                {/* CTAs */}
                <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
                    <Link to="/orders" style={{
                        flex:          1,
                        display:       "flex",
                        alignItems:    "center",
                        justifyContent: "center",
                        gap:           "var(--space-2)",
                        padding:       "var(--space-3) var(--space-4)",
                        background:    "var(--accent)",
                        color:         "var(--text)",
                        textDecoration: "none",
                        borderRadius:  "var(--r-md)",
                        fontFamily:    "var(--font-body)",
                        fontWeight:    700,
                        fontSize:      "var(--text-sm)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        textAlign:     "center",
                    }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    >
                        <HiExternalLink />
                        View Orders
                    </Link>
                    <Link to="/" style={{
                        flex:          1,
                        display:       "flex",
                        alignItems:    "center",
                        justifyContent: "center",
                        padding:       "var(--space-3) var(--space-4)",
                        background:    "transparent",
                        color:         "var(--text-2)",
                        textDecoration: "none",
                        borderRadius:  "var(--r-md)",
                        border:        "1px solid var(--border)",
                        fontFamily:    "var(--font-body)",
                        fontWeight:    600,
                        fontSize:      "var(--text-sm)",
                        textAlign:     "center",
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}
                    >
                        Continue Shopping
                    </Link>
                </div>

            </div>
        </div>
    );
};

const Row = ({ label, value }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-1) 0" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-3)", flexShrink: 0 }}>{label}</span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text)", textAlign: "right" }}>{value}</span>
    </div>
);

export default OrderConfirmationPage;
