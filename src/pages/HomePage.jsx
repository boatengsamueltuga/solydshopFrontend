import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import toast from "react-hot-toast";
import {
    fetchProductsStart,
    fetchProductsSuccess,
    fetchProductsFailure,
} from "../features/product/productSlice";

// ── Design tokens (Steel Slate Industrial) ──────────────────
const C = {
    bg:          "#0D1B2A",
    surface:     "#1B2A3D",
    surfaceHigh: "#243447",
    border:      "#2D4263",
    text:        "#dee3e8",
    textMuted:   "#bdc8d1",
    textDim:     "#87929a",
    primary:     "#8ed5ff",
    btnBg:       "#38bdf8",
    btnText:     "#003a57",
    error:       "#ffb4ab",
    footer:      "#091522",
};

const getXsrfToken = () =>
    document.cookie
        .split("; ")
        .find((r) => r.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

// ── Skeleton card ────────────────────────────────────────────
const SkeletonCard = () => (
    <div
        className="rounded-lg overflow-hidden animate-pulse"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
        <div className="h-48 w-full" style={{ background: C.surfaceHigh }} />
        <div className="p-4 space-y-3">
            <div className="h-3 rounded w-4/5" style={{ background: C.surfaceHigh }} />
            <div className="h-3 rounded w-3/5" style={{ background: C.surfaceHigh }} />
            <div className="h-8 rounded mt-4" style={{ background: C.surfaceHigh }} />
        </div>
    </div>
);

// ── Main component ───────────────────────────────────────────
const HomePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { products, loading } = useSelector((s) => s.product);
    const { user } = useSelector((s) => s.auth);

    const [keyword,    setKeyword]    = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState([]);
    const [cart,       setCart]       = useState(null);
    const [cartBusy,   setCartBusy]   = useState(false);
    const [priceMax,   setPriceMax]   = useState(50000);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [filtersOpen, setFiltersOpen] = useState(false);

    // ── Fetchers ────────────────────────────────────────────
    const fetchCategories = async () => {
        try {
            const res = await api.get("/public/categories?pageSize=1000");
            setCategories(res.data.content);
        } catch (e) {
            console.log(e);
        }
    };

    const fetchProducts = async (kw = keyword, catId = categoryId) => {
        dispatch(fetchProductsStart());
        try {
            let url = "/public/products?";
            if (kw.trim())  url += `keyword=${kw}&`;
            if (catId)      url += `categoryId=${catId}`;
            const res = await api.get(url);
            dispatch(fetchProductsSuccess(res.data.content));
        } catch (e) {
            dispatch(fetchProductsFailure(e.message));
        }
    };

    const fetchCart = async () => {
        if (!user?.userId) return;
        try {
            const res = await api.get(`/cart/${user.userId}`);
            setCart(res.data);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchCart();
    }, []);

    useEffect(() => {
        const t = setTimeout(() => fetchProducts(), 400);
        return () => clearTimeout(t);
    }, [keyword, categoryId]);

    // ── Cart actions ────────────────────────────────────────
    const handleAddToCart = async (productId) => {
        if (!user) { toast.error("Please login to add items to cart"); return; }
        setCartBusy(true);
        try {
            await api.post(
                `/cart/${user.userId}/items`,
                { productId, quantity: 1 },
                { headers: { "X-XSRF-TOKEN": getXsrfToken() } }
            );
            toast.success("Added to cart");
            await fetchCart();
        } catch (e) {
            console.log(e);
        } finally {
            setCartBusy(false);
        }
    };

    const handleRemoveFromCart = async (productId) => {
        if (!user) return;
        setCartBusy(true);
        try {
            await api.delete(
                `/cart/${user.userId}/items/${productId}`,
                { headers: { "X-XSRF-TOKEN": getXsrfToken() } }
            );
            await fetchCart();
        } catch (e) {
            console.log(e);
        } finally {
            setCartBusy(false);
        }
    };

    const handleCategoryToggle = (id) =>
        setCategoryId((prev) => (prev === String(id) ? "" : String(id)));

    const cartItems  = cart?.items ?? [];
    const cartTotal  = Number(cart?.totalPrice ?? 0);
    const itemCount  = cartItems.reduce((s, i) => s + i.quantity, 0);

    // ── Render ──────────────────────────────────────────────
    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ background: C.bg, color: C.text, fontFamily: "Inter, sans-serif" }}
        >
            {/* ══ Three-column main ══════════════════════════════════ */}
            <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-12 gap-6 py-6">

                {/* ── Mobile filter toggle (only < 640px) ────────── */}
                <div className="col-span-12 lg:hidden">
                    <button
                        onClick={() => setFiltersOpen((o) => !o)}
                        aria-expanded={filtersOpen}
                        className="w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[0.98]"
                        style={{ background: C.surfaceHigh, border: `1px solid ${C.border}`, color: C.text }}
                    >
                        <span>&#128269;</span>
                        {filtersOpen ? "Hide Filters" : "Show Filters"}
                    </button>
                </div>

                {/* ── LEFT: Filters ──────────────────────────────── */}
                {/* mobile (<640): toggled drawer · tablet (640-1024): stacked & visible · desktop (1024+): sticky sidebar */}
                <aside
                    className={`${filtersOpen ? "flex" : "hidden"} lg:flex flex-col col-span-12 lg:col-span-3 lg:sticky lg:top-24 lg:h-[calc(100vh-112px)]`}
                    style={{ borderRight: `1px solid ${C.border}`, paddingRight: "24px" }}
                >
                    {/* Header */}
                    <div className="mb-6">
                        <h2 className="text-lg font-bold mb-1" style={{ color: C.primary }}>
                            Filters
                        </h2>
                        <p className="text-xs" style={{ color: C.textMuted }}>
                            Refine Industrial Search
                        </p>
                    </div>

                    <div className="flex-grow overflow-y-auto space-y-5 pr-1"
                        style={{ scrollbarWidth: "thin", scrollbarColor: `${C.border} ${C.bg}` }}>

                        {/* Categories */}
                        <div>
                            <h3 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: C.text }}>
                                <span>&#128230;</span> Categories
                            </h3>
                            <div className="space-y-0.5">
                                <label
                                    className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm cursor-pointer transition-colors"
                                    style={{ color: categoryId === "" ? C.primary : C.textMuted }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(48,53,57,0.4)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    <input
                                        type="checkbox"
                                        checked={categoryId === ""}
                                        onChange={() => setCategoryId("")}
                                        className="rounded"
                                        style={{ accentColor: C.btnBg }}
                                    />
                                    All Categories
                                </label>
                                {categories.map((cat) => (
                                    <label
                                        key={cat.categoryId}
                                        className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm cursor-pointer transition-colors"
                                        style={{ color: C.textMuted }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(48,53,57,0.4)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={categoryId === String(cat.categoryId)}
                                            onChange={() => handleCategoryToggle(cat.categoryId)}
                                            className="rounded"
                                            style={{ accentColor: C.btnBg }}
                                        />
                                        {cat.categoryName}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: C.text }}>
                                <span>&#128176;</span> Price Range
                            </h3>
                            <input
                                type="range"
                                min={0}
                                max={100000}
                                value={priceMax}
                                onChange={(e) => setPriceMax(e.target.value)}
                                className="w-full h-1 rounded-lg appearance-none cursor-pointer"
                                style={{ accentColor: C.btnBg, background: "#39485a" }}
                            />
                            <div className="flex justify-between mt-2 text-xs" style={{ color: C.textMuted }}>
                                <span>$500</span>
                                <span>${Number(priceMax).toLocaleString()}+</span>
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: C.text }}>
                                <span>&#128230;</span> Availability
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <span
                                    className="px-3 py-1 rounded-full text-xs font-bold"
                                    style={{ background: "rgba(56,189,248,0.15)", color: C.primary, border: `1px solid rgba(142,213,255,0.2)` }}
                                >
                                    In Stock
                                </span>
                                <span
                                    className="px-3 py-1 rounded-full text-xs cursor-pointer transition-colors"
                                    style={{ background: "rgba(48,53,57,0.2)", color: C.textMuted }}
                                >
                                    On Demand
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Apply / Reset buttons */}
                    <div className="mt-6 flex gap-2">
                        <button
                            onClick={() => fetchProducts()}
                            className="flex-1 py-3 rounded-lg font-bold text-sm transition-opacity hover:opacity-90 active:scale-[0.98]"
                            style={{ background: C.btnBg, color: C.btnText }}
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={() => {
                                setKeyword("");
                                setCategoryId("");
                                setPriceMax(50000);
                                fetchProducts("", "");
                            }}
                            className="flex-1 py-3 rounded-lg font-bold text-sm transition-opacity hover:opacity-90 active:scale-[0.98]"
                            style={{ background: C.surfaceHigh, color: C.textMuted, border: `1px solid ${C.border}` }}
                        >
                            Reset
                        </button>
                    </div>
                </aside>

                {/* ── MIDDLE: Products ────────────────────────────── */}
                <section className="col-span-12 lg:col-span-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold" style={{ color: C.text }}>
                            Featured Products
                        </h1>
                        <div className="h-1 w-16 mt-2 rounded mb-4" style={{ background: C.primary }} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full px-4 py-2.5 text-sm rounded-lg focus:outline-none"
                            style={{ background: C.surfaceHigh, border: `1px solid ${C.border}`, color: C.text }}
                            onFocus={(e) => (e.target.style.borderColor = C.primary)}
                            onBlur={(e)  => (e.target.style.borderColor = C.border)}
                        />
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>

                    ) : products.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-xl mb-2" style={{ color: C.textMuted }}>No products found</p>
                            <p className="text-sm" style={{ color: C.textDim }}>Try adjusting your filters</p>
                        </div>

                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                            {products.map((product) => (
                                <article
                                    key={product.productId}
                                    className="rounded-lg overflow-hidden flex flex-col transition-all duration-300"
                                    style={{ background: C.surface, border: `1px solid ${C.border}` }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "rgba(142,213,255,0.4)";
                                        e.currentTarget.style.boxShadow   = "0px 4px 20px rgba(56,189,248,0.15)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = C.border;
                                        e.currentTarget.style.boxShadow   = "none";
                                    }}
                                >
                                    {/* Image */}
                                    <div
                                        className="h-48 w-full relative overflow-hidden group"
                                        style={{ background: C.bg }}
                                    >
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.productName}
                                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl"
                                                style={{ color: C.textDim }}>&#128230;</div>
                                        )}
                                        {/* SKU badge */}
                                        <div
                                            className="absolute top-2 left-2 px-2 py-1 text-[10px] font-bold rounded-sm"
                                            style={{ background: "rgba(142,213,255,0.15)", color: C.primary, border: "1px solid rgba(142,213,255,0.2)", backdropFilter: "blur(4px)" }}
                                        >
                                            {product.modelNumber || product.categoryName || "PRODUCT"}
                                        </div>

                                        {/* Quick View hover overlay — desktop */}
                                        <div className="absolute inset-0 hidden md:flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
                                                className="px-4 py-2 rounded-lg text-xs font-bold"
                                                style={{ background: "rgba(255,255,255,0.95)", color: C.btnText }}
                                            >
                                                Quick View
                                            </button>
                                        </div>

                                        {/* Quick View pill — always visible on mobile */}
                                        <div className="absolute bottom-2 left-0 right-0 flex justify-center md:hidden">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
                                                className="px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm"
                                                style={{ background: "rgba(0,0,0,0.6)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}
                                            >
                                                Quick View
                                            </button>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4 flex flex-col flex-grow">
                                        <h3 className="text-sm font-bold mb-1 leading-snug" style={{ color: C.text }}>
                                            {product.productName}
                                        </h3>
                                        <p
                                            className="text-xs mb-4 overflow-hidden"
                                            style={{ color: C.textMuted, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                                        >
                                            {product.description}
                                        </p>
                                        <div className="mt-auto flex flex-col gap-2">
                                            <span className="text-base font-semibold" style={{ color: C.primary }}>
                                                ${Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </span>
                                            <button
                                                disabled={product.quantity === 0 || cartBusy}
                                                onClick={() => handleAddToCart(product.productId)}
                                                className="w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-40"
                                                style={{ background: C.btnBg, color: C.btnText }}
                                            >
                                                &#128722;&nbsp;{product.quantity === 0 ? "Out of Stock" : "Add"}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* ── RIGHT: Mini Cart ────────────────────────────── */}
                <aside className="col-span-12 lg:col-span-3">
                    <div
                        className="rounded-lg p-4 flex flex-col lg:sticky lg:top-24 lg:max-h-[calc(100vh-112px)]"
                        style={{ background: C.surface, border: `1px solid ${C.border}` }}
                    >
                        {/* Cart header */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold" style={{ color: C.text }}>Your Cart</h2>
                            {itemCount > 0 && (
                                <span
                                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                                    style={{ background: "rgba(56,189,248,0.2)", color: C.primary }}
                                >
                                    {itemCount} {itemCount === 1 ? "ITEM" : "ITEMS"}
                                </span>
                            )}
                        </div>

                        {/* Items list */}
                        <div
                            className="flex-grow overflow-y-auto space-y-4 mb-4 pr-1"
                            style={{ scrollbarWidth: "thin", scrollbarColor: `${C.border} ${C.bg}` }}
                        >
                            {!user ? (
                                <p className="text-sm text-center py-10" style={{ color: C.textDim }}>
                                    Login to view your cart
                                </p>
                            ) : cartItems.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="text-3xl mb-3">&#128722;</div>
                                    <p className="text-sm mb-1" style={{ color: C.textMuted }}>Cart is empty</p>
                                    <p className="text-xs" style={{ color: C.textDim }}>Add products to get started</p>
                                </div>
                            ) : (
                                cartItems.map((item) => (
                                    <div
                                        key={item.productId}
                                        className="flex gap-3 pb-4"
                                        style={{ borderBottom: `1px solid rgba(62,72,79,0.4)` }}
                                    >
                                        {/* Thumbnail */}
                                        <div
                                            className="w-16 h-16 rounded flex-shrink-0 overflow-hidden flex items-center justify-center"
                                            style={{ background: C.bg, border: `1px solid ${C.border}` }}
                                        >
                                            <span className="text-2xl" style={{ color: C.textDim }}>&#128230;</span>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-grow min-w-0">
                                            <h4 className="text-xs font-bold truncate" style={{ color: C.text }}>
                                                {item.productName}
                                            </h4>
                                            <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: C.textMuted }}>
                                                Qty: {item.quantity}
                                            </p>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-sm font-bold" style={{ color: C.primary }}>
                                                    ${Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                </span>
                                                <button
                                                    onClick={() => handleRemoveFromCart(item.productId)}
                                                    className="transition-opacity hover:opacity-70 text-sm"
                                                    style={{ color: C.error }}
                                                    title="Remove"
                                                >
                                                    &#128465;
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Summary + checkout */}
                        {user && cartItems.length > 0 && (
                            <div className="pt-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: C.textMuted }}>Subtotal</span>
                                    <span style={{ color: C.text }}>
                                        ${cartTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: C.textMuted }}>Shipping</span>
                                    <span className="font-bold" style={{ color: C.primary }}>FREE</span>
                                </div>
                                <div className="flex justify-between pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                                    <span className="font-bold" style={{ color: C.text }}>Total</span>
                                    <span className="font-bold" style={{ color: C.primary }}>
                                        ${cartTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <button
                                    onClick={() => navigate("/checkout")}
                                    className="w-full py-4 rounded-lg font-bold text-sm mt-2 hover:opacity-90 active:scale-[0.98] transition-all"
                                    style={{ background: C.btnBg, color: C.btnText, boxShadow: "0px 4px 20px rgba(56,189,248,0.15)" }}
                                >
                                    Proceed to Checkout
                                </button>
                                <p className="text-[10px] text-center" style={{ color: "rgba(189,200,209,0.6)" }}>
                                    Secure industrial payment gateway
                                </p>
                            </div>
                        )}
                    </div>
                </aside>
            </main>

            {/* ══ Footer ════════════════════════════════════════════ */}
            <footer
                className="mt-8"
                style={{ background: C.footer, borderTop: `1px solid ${C.border}` }}
            >
                <div className="flex flex-col md:flex-row justify-between items-center w-full py-8 px-4 sm:px-6 lg:px-10 mx-auto max-w-[1440px]">
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <span className="text-sm font-bold" style={{ color: C.text }}>SolydShop</span>
                        <p className="text-xs" style={{ color: C.textMuted }}>
                            © 2024 SolydShop Industrial Marketplace. All rights reserved.
                        </p>
                    </div>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        {["Terms", "Privacy", "Support", "Contact"].map((link) => (
                            <a
                                key={link}
                                href="#"
                                className="text-xs transition-colors hover:text-white"
                                style={{ color: C.textMuted }}
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </footer>

            {/* ══ Quick View Modal ══════════════════════════════════ */}
            {quickViewProduct && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-10 py-6"
                    style={{ background: "rgba(0,0,0,0.75)" }}
                    onClick={() => setQuickViewProduct(null)}
                >
                    <div
                        className="relative rounded-xl w-full max-w-xs max-h-[80vh] overflow-y-auto"
                        style={{ background: C.surface, border: `1px solid ${C.border}` }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close */}
                        <button
                            onClick={() => setQuickViewProduct(null)}
                            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-opacity hover:opacity-70"
                            style={{ background: C.surfaceHigh, color: C.textMuted }}
                        >
                            ✕
                        </button>

                        {/* Image */}
                        <div className="h-40 w-full overflow-hidden rounded-t-xl" style={{ background: C.bg }}>
                            {quickViewProduct.imageUrl ? (
                                <img
                                    src={quickViewProduct.imageUrl}
                                    alt={quickViewProduct.productName}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-5xl" style={{ color: C.textDim }}>
                                    &#128230;
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                            {/* SKU + stock */}
                            <div className="flex items-center justify-between">
                                <span
                                    className="px-2 py-1 text-[10px] font-bold rounded-sm"
                                    style={{ background: "rgba(142,213,255,0.15)", color: C.primary, border: "1px solid rgba(142,213,255,0.2)" }}
                                >
                                    {quickViewProduct.modelNumber || quickViewProduct.categoryName || "PRODUCT"}
                                </span>
                                <span
                                    className="text-xs font-semibold px-2 py-1 rounded-full"
                                    style={quickViewProduct.quantity > 0
                                        ? { background: "rgba(56,189,248,0.1)", color: C.primary }
                                        : { background: "rgba(255,180,171,0.1)", color: C.error }
                                    }
                                >
                                    {quickViewProduct.quantity > 0 ? `In Stock (${quickViewProduct.quantity})` : "Out of Stock"}
                                </span>
                            </div>

                            {/* Name */}
                            <h2 className="text-sm font-bold leading-snug" style={{ color: C.text }}>
                                {quickViewProduct.productName}
                            </h2>

                            {/* Description */}
                            <p
                                className="text-sm leading-relaxed max-h-24 overflow-y-auto overflow-x-hidden break-all"
                                style={{ color: C.textMuted, scrollbarWidth: "thin", scrollbarColor: `${C.border} transparent` }}
                            >
                                {quickViewProduct.description || "No description available."}
                            </p>

                            {/* Price + Add to Cart */}
                            <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                                <span className="text-base font-bold" style={{ color: C.primary }}>
                                    ${Number(quickViewProduct.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </span>
                                <button
                                    disabled={quickViewProduct.quantity === 0 || cartBusy}
                                    onClick={() => { handleAddToCart(quickViewProduct.productId); setQuickViewProduct(null); }}
                                    className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-40"
                                    style={{ background: C.btnBg, color: C.btnText }}
                                >
                                    &#128722; {quickViewProduct.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
