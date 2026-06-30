import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { fmtPrice } from "../utils/format";
import { setCartCount } from "../features/cart/cartSlice";
import toast from "react-hot-toast";
import { IconButton, Tooltip } from "@mui/material";
import AddIcon           from "@mui/icons-material/Add";
import RemoveIcon        from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import { HiShoppingCart, HiArrowLeft, HiCube } from "react-icons/hi";

const CartPage = () => {

    const [cart,          setCart]          = useState(null);
    const [loading,       setLoading]       = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const getXsrfToken = () =>
        document.cookie.split("; ").find(r => r.startsWith("XSRF-TOKEN="))?.split("=")[1];

    const fetchCart = async () => {
        try {
            const res = await api.get(`/cart/${user.userId}`);
            setCart(res.data);
            const items = res.data?.items ?? [];
            dispatch(setCartCount(items.reduce((s, i) => s + i.quantity, 0)));
        } catch (e) {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.userId) fetchCart();
    }, [user]);

    const handleIncreaseQuantity = async (productId) => {
        setActionLoading(true);
        try {
            await api.post(
                `/cart/${user.userId}/items`,
                { productId, quantity: 1 },
                { headers: { "X-XSRF-TOKEN": getXsrfToken() } }
            );
            await fetchCart();
        } catch (e) {
            toast.error("Failed to increase quantity");
        } finally { setActionLoading(false); }
    };

    const handleDecreaseQuantity = async (productId) => {
        setActionLoading(true);
        try {
            await api.put(
                `/cart/${user.userId}/items/${productId}/decrease`,
                {},
                { headers: { "X-XSRF-TOKEN": getXsrfToken() } }
            );
            await fetchCart();
        } catch (e) {
            toast.error("Failed to decrease quantity");
        } finally { setActionLoading(false); }
    };

    const handleRemoveItem = async (productId) => {
        setActionLoading(true);
        try {
            await api.delete(
                `/cart/${user.userId}/items/${productId}`,
                { headers: { "X-XSRF-TOKEN": getXsrfToken() } }
            );
            await fetchCart();
        } catch (e) {
            toast.error("Failed to remove item");
        } finally { setActionLoading(false); }
    };

    if (loading) return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-3)" }}>
            <div className="solyd-spinner" />
            <p style={{ color: "var(--text-3)", fontFamily: "var(--font-body)", fontSize: "14px" }}>Loading cart…</p>
            <style>{`@keyframes solyd-spin { to { transform: rotate(360deg); } } .solyd-spinner { width: 28px; height: 28px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: solyd-spin 0.8s linear infinite; }`}</style>
        </div>
    );

    const items      = cart?.items ?? [];
    const totalPrice = Number(cart?.totalPrice ?? 0);
    const itemCount  = items.reduce((s, i) => s + i.quantity, 0);

    return (
        <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)", fontFamily: "var(--font-body)" }}>

            {/* ── Page Header ── */}
            <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "var(--space-6) var(--space-8)" }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", color: "var(--text)", margin: 0, letterSpacing: "-0.01em" }}>
                    MY CART
                </h1>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-3)", marginTop: "var(--space-1)" }}>
                    {itemCount > 0
                        ? `${itemCount} item${itemCount !== 1 ? "s" : ""} · ${fmtPrice(totalPrice)}`
                        : "Your cart is empty"}
                </p>
            </div>

            {/* ── Content ── */}
            <div style={{ maxWidth: "var(--content-max)", margin: "0 auto", padding: "var(--space-6)" }}>

                {/* Action loading banner */}
                {actionLoading && (
                    <div style={{
                        marginBottom: "var(--space-4)",
                        padding:      "var(--space-3) var(--space-4)",
                        background:   "var(--accent-subtle)",
                        border:       "1px solid var(--accent-border)",
                        borderRadius: "var(--r-md)",
                        display:      "flex",
                        alignItems:   "center",
                        gap:          "var(--space-3)",
                    }}>
                        <div className="solyd-spinner" style={{ width: "14px", height: "14px", borderWidth: "2px" }} />
                        <span style={{ fontSize: "13px", color: "var(--text)", fontWeight: 600 }}>Updating cart…</span>
                    </div>
                )}

                {/* ── Empty State ── */}
                {items.length === 0 ? (
                    <div style={{
                        textAlign:    "center",
                        padding:      "var(--space-24) var(--space-6)",
                        background:   "var(--surface-mid)",
                        border:       "1px solid var(--border)",
                        borderRadius: "var(--r-lg)",
                    }}>
                        <HiShoppingCart style={{ fontSize: "48px", color: "var(--text-4)", marginBottom: "var(--space-4)" }} />
                        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-xl)", color: "var(--text)", margin: "0 0 var(--space-2)" }}>
                            Cart is empty
                        </h2>
                        <p style={{ color: "var(--text-3)", fontSize: "14px", marginBottom: "var(--space-6)" }}>
                            Browse the catalog and add parts to get started.
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            style={{
                                padding:      "var(--space-3) var(--space-6)",
                                background:   "var(--accent)",
                                color:        "var(--text)",
                                border:       "none",
                                borderRadius: "var(--r-md)",
                                fontFamily:   "var(--font-body)",
                                fontWeight:   700,
                                fontSize:     "14px",
                                cursor:       "pointer",
                            }}
                        >
                            Browse Catalog
                        </button>
                    </div>

                ) : (

                    /* ── Two-column layout ── */
                    <div className="cart-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-6)" }}>

                        {/* ── Cart Items ── */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>

                            <button
                                onClick={() => navigate("/")}
                                style={{
                                    background:   "none",
                                    border:       "none",
                                    cursor:       "pointer",
                                    color:        "var(--text-3)",
                                    fontFamily:   "var(--font-body)",
                                    fontSize:     "13px",
                                    display:      "flex",
                                    alignItems:   "center",
                                    gap:          "var(--space-2)",
                                    padding:      0,
                                    marginBottom: "var(--space-2)",
                                    width:        "fit-content",
                                    transition:   "color var(--duration-fast)",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.textDecoration = "underline"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.textDecoration = "none"; }}
                            >
                                <HiArrowLeft style={{ fontSize: 14 }} /> Continue Shopping
                            </button>

                            {items.map((item) => (
                                <div
                                    key={item.productId}
                                    style={{
                                        background:   "var(--surface-high)",
                                        border:       "1px solid var(--border)",
                                        borderRadius: "var(--r-md)",
                                        padding:      "var(--space-4)",
                                        display:      "flex",
                                        gap:          "var(--space-4)",
                                        alignItems:   "center",
                                        flexWrap:     "wrap",
                                        transition:   "border-color var(--duration-fast)",
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--border-mid)"}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                                >
                                    {/* Product image */}
                                    <div style={{
                                        width:          "72px",
                                        height:         "72px",
                                        background:     "var(--surface)",
                                        border:         "1px solid var(--border)",
                                        borderRadius:   "var(--r-sm)",
                                        flexShrink:     0,
                                        overflow:       "hidden",
                                        display:        "flex",
                                        alignItems:     "center",
                                        justifyContent: "center",
                                    }}>
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                        ) : (
                                            <HiCube style={{ fontSize: "28px", color: "var(--text-4)" }} />
                                        )}
                                    </div>

                                    {/* Product info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{
                                            fontFamily:   "var(--font-display)",
                                            fontWeight:   600,
                                            fontSize:     "14px",
                                            color:        "var(--text)",
                                            margin:       "0 0 var(--space-1)",
                                            overflow:     "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace:   "nowrap",
                                        }}>
                                            {item.productName}
                                        </h3>
                                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-3)", margin: 0 }}>
                                            {fmtPrice(item.price)} ea
                                        </p>
                                    </div>

                                    {/* Controls */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexShrink: 0, flexWrap: "wrap" }}>

                                        {/* Qty +/- */}
                                        <div style={{
                                            display:    "flex",
                                            alignItems: "center",
                                            border:     "1px solid var(--border)",
                                            borderRadius:"var(--r-md)",
                                            background: "var(--surface-mid)",
                                            overflow:   "hidden",
                                        }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDecreaseQuantity(item.productId)}
                                                disabled={actionLoading}
                                                sx={{ color: "var(--text-3)", borderRadius: 0, "&:hover": { color: "var(--text)", background: "var(--accent-subtle)" } }}
                                            >
                                                <RemoveIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                            <span style={{
                                                fontFamily: "var(--font-mono)",
                                                fontSize:   "13px",
                                                fontWeight: 700,
                                                color:      "var(--text)",
                                                minWidth:   "28px",
                                                textAlign:  "center",
                                                padding:    "0 var(--space-1)",
                                            }}>
                                                {item.quantity}
                                            </span>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleIncreaseQuantity(item.productId)}
                                                disabled={actionLoading}
                                                sx={{ color: "var(--text-2)", borderRadius: 0, "&:hover": { color: "var(--text)", background: "var(--accent-subtle)" } }}
                                            >
                                                <AddIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                        </div>

                                        {/* Line total */}
                                        <span style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize:   "15px",
                                            fontWeight: 700,
                                            color:      "var(--text)",
                                            minWidth:   "88px",
                                            textAlign:  "right",
                                        }}>
                                            {fmtPrice(item.price * item.quantity)}
                                        </span>

                                        {/* Remove */}
                                        <Tooltip title="Remove item" arrow>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemoveItem(item.productId)}
                                                disabled={actionLoading}
                                                sx={{
                                                    color:     "var(--error)",
                                                    border:    "1px solid var(--error-subtle)",
                                                    borderRadius: "var(--r-sm)",
                                                    "&:hover": { background: "var(--error-subtle)" },
                                                }}
                                            >
                                                <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Order Summary ── */}
                        <div
                            className="cart-summary"
                            style={{
                                background:   "var(--surface-mid)",
                                border:       "1px solid var(--border)",
                                borderRadius: "var(--r-md)",
                                overflow:     "hidden",
                                alignSelf:    "start",
                            }}
                        >
                            <div style={{ padding: "var(--space-5)", borderBottom: "1px solid var(--border)" }}>
                                <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", margin: "0 0 var(--space-4)" }}>
                                    Order Summary
                                </p>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
                                    <span style={{ color: "var(--text-3)", fontSize: "13px" }}>Items ({itemCount})</span>
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text)", fontWeight: 600 }}>
                                        {fmtPrice(totalPrice)}
                                    </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--text-3)", fontSize: "13px" }}>Shipping</span>
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-3)" }}>TBD (Freight)</span>
                                </div>
                            </div>

                            <div style={{ padding: "var(--space-5)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-5)", paddingBottom: "var(--space-4)", borderBottom: "1px solid var(--border)" }}>
                                    <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "11px", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                        Total
                                    </span>
                                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "22px", color: "var(--text)" }}>
                                        {fmtPrice(totalPrice)}
                                    </span>
                                </div>

                                <button
                                    onClick={() => navigate("/checkout")}
                                    disabled={actionLoading}
                                    style={{
                                        width:         "100%",
                                        padding:       "var(--space-4)",
                                        background:    "var(--accent)",
                                        color:         "var(--text)",
                                        border:        "none",
                                        borderRadius:  "var(--r-md)",
                                        fontFamily:    "var(--font-body)",
                                        fontWeight:    700,
                                        fontSize:      "14px",
                                        cursor:        actionLoading ? "not-allowed" : "pointer",
                                        opacity:       actionLoading ? 0.6 : 1,
                                        transition:    "opacity var(--duration-fast)",
                                        letterSpacing: "0.02em",
                                    }}
                                >
                                    Proceed to Checkout →
                                </button>

                                <button
                                    onClick={() => navigate("/")}
                                    style={{
                                        width:      "100%",
                                        padding:    "var(--space-3)",
                                        background: "none",
                                        color:      "var(--text-3)",
                                        border:     "none",
                                        cursor:     "pointer",
                                        fontFamily: "var(--font-body)",
                                        fontSize:   "13px",
                                        marginTop:  "var(--space-2)",
                                        transition: "color var(--duration-fast)",
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--text)"}
                                    onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-3)"}
                                >
                                    ← Continue Shopping
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            <style>{`
                @keyframes solyd-spin { to { transform: rotate(360deg); } }
                .solyd-spinner {
                    width: 28px; height: 28px;
                    border: 3px solid var(--border);
                    border-top-color: var(--accent);
                    border-radius: 50%;
                    animation: solyd-spin 0.8s linear infinite;
                }
                @media (min-width: 768px) {
                    .cart-grid { grid-template-columns: 1fr 340px !important; }
                    .cart-summary { position: sticky; top: 24px; }
                }
            `}</style>
        </div>
    );
};

export default CartPage;
