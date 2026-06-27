import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import toast from "react-hot-toast";
import { FaRegHeart, FaShoppingCart, FaTrash } from "react-icons/fa";
import { optimisticRemoveItem, setWishlistItems } from "../features/wishlist/wishlistSlice";
import { incrementCartCount } from "../features/cart/cartSlice";

const getXsrfToken = () =>
    document.cookie.split("; ").find((r) => r.startsWith("XSRF-TOKEN="))?.split("=")[1];

export default function WishlistPage() {
    const dispatch           = useDispatch();
    const navigate           = useNavigate();
    const { items, loading } = useSelector((s) => s.wishlist);
    const user               = useSelector((s) => s.auth.user);

    const handleRemove = async (productId) => {
        const snapshot = items;
        dispatch(optimisticRemoveItem(productId));
        toast("Removed from wishlist");
        try {
            const res = await api.delete(`/wishlist/items/${productId}`);
            dispatch(setWishlistItems(res.data));
        } catch {
            dispatch(setWishlistItems(snapshot));
            toast.error("Could not remove item");
        }
    };

    const handleAddToCart = async (productId) => {
        if (!user) return;
        try {
            await api.post(
                `/cart/${user.userId}/items`,
                { productId, quantity: 1 },
                { headers: { "X-XSRF-TOKEN": getXsrfToken() } },
            );
            dispatch(incrementCartCount());
            toast.success("Added to cart");
        } catch {
            toast.error("Could not add to cart");
        }
    };

    return (
        <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "32px 24px", minHeight: "60vh" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "28px" }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", margin: 0 }}>
                    Wishlist
                </h1>
                {items.length > 0 && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, color: "var(--text-4)", letterSpacing: "0.06em" }}>
                        {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                )}
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ color: "var(--text-4)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                    Loading…
                </div>
            )}

            {/* Empty state */}
            {!loading && items.length === 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "80px 24px", textAlign: "center" }}>
                    <FaRegHeart size={40} style={{ color: "var(--text-4)" }} />
                    <p style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600, color: "var(--text-2)", margin: 0 }}>
                        Your wishlist is empty
                    </p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-4)", margin: 0 }}>
                        Save products you want to come back to later.
                    </p>
                    <Link
                        to="/"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "8px", padding: "9px 20px", background: "var(--accent)", color: "oklch(0.15 0.02 63)", border: "none", borderRadius: "var(--r-md)", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none" }}
                    >
                        Browse Products
                    </Link>
                </div>
            )}

            {/* Product grid */}
            {!loading && items.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {items.map((product) => (
                        <article
                            key={product.productId}
                            className="rounded overflow-hidden flex flex-col group"
                            style={{ background: "var(--surface)", border: "1px solid var(--border)", transition: "border-color var(--duration-mid) var(--ease-out-quart)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-border)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                        >
                            {/* Image */}
                            <div
                                className="overflow-hidden flex-shrink-0"
                                style={{ height: "160px", background: "var(--surface-high)", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                                onClick={() => navigate(`/products/${product.productId}`)}
                            >
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.productName}
                                        loading="lazy"
                                        className="w-full h-full object-contain transition-transform duration-[220ms] group-hover:scale-[1.04]"
                                        style={{ padding: "10px" }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-4)" }}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex flex-col flex-grow" style={{ padding: "10px 11px 11px" }}>
                                {product.categoryName && (
                                    <p style={{ margin: "0 0 3px", fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)" }}>
                                        {product.categoryName}
                                    </p>
                                )}

                                <h3 className="line-clamp-2" style={{ fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: 600, color: "var(--text)", margin: "0 0 5px", lineHeight: 1.35, letterSpacing: "-0.01em" }}>
                                    <Link
                                        to={`/products/${product.productId}`}
                                        style={{ color: "var(--text)", textDecoration: "none", transition: "color var(--duration-fast)" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text)")}
                                    >
                                        {product.productName}
                                    </Link>
                                </h3>

                                <div style={{ flex: 1, minHeight: "8px" }} />

                                {/* Price */}
                                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "8px", marginBottom: "8px" }}>
                                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "8.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-4)" }}>
                                            Unit Price
                                        </span>
                                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
                                            ${Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: "flex", gap: "5px" }}>
                                    <button
                                        onClick={() => handleRemove(product.productId)}
                                        title="Remove from wishlist"
                                        aria-label="Remove from wishlist"
                                        style={{ flex: 1, minHeight: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-mid)", border: "1px solid var(--error)", borderRadius: "var(--r-md)", color: "var(--error)", cursor: "pointer", transition: "opacity var(--duration-fast)" }}
                                        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.75"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                                    >
                                        <FaTrash size={11} />
                                    </button>

                                    <button
                                        disabled={product.quantity === 0}
                                        onClick={() => handleAddToCart(product.productId)}
                                        title={product.quantity === 0 ? "Out of stock" : "Add to cart"}
                                        aria-label="Add to cart"
                                        className="disabled:opacity-40"
                                        style={{ flex: 2, minHeight: "32px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", background: product.quantity === 0 ? "var(--surface-high)" : "var(--accent)", color: product.quantity === 0 ? "var(--text-3)" : "oklch(0.15 0.02 63)", border: "none", borderRadius: "var(--r-md)", fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", cursor: product.quantity === 0 ? "not-allowed" : "pointer", transition: "opacity var(--duration-fast)" }}
                                        onMouseEnter={(e) => { if (product.quantity > 0) e.currentTarget.style.opacity = "0.88"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                                    >
                                        <FaShoppingCart aria-hidden="true" size={9} />
                                        {product.quantity === 0 ? "Out" : "Add"}
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
