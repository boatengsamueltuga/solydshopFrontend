import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import toast from "react-hot-toast";
import { HiAdjustments, HiSearch, HiX } from "react-icons/hi";
import { FaShoppingCart } from "react-icons/fa";
import {
    fetchProductsStart,
    fetchProductsSuccess,
    fetchProductsFailure,
} from "../features/product/productSlice";

// ── Design tokens ────────────────────────────────────────────
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
        className="rounded overflow-hidden animate-pulse"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
        <div className="h-32 w-full" style={{ background: C.surfaceHigh }} />
        <div className="p-3 space-y-2">
            <div className="h-2.5 rounded w-4/5" style={{ background: C.surfaceHigh }} />
            <div className="h-2.5 rounded w-3/5" style={{ background: C.surfaceHigh }} />
            <div className="h-7 rounded mt-3" style={{ background: C.surfaceHigh }} />
        </div>
    </div>
);

// ── Main component ───────────────────────────────────────────
const HomePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { products, loading } = useSelector((s) => s.product);
    const { user }              = useSelector((s) => s.auth);

    const [keyword,          setKeyword]          = useState("");
    const [categoryId,       setCategoryId]       = useState("");
    const [categories,       setCategories]       = useState([]);
    const [cart,             setCart]             = useState(null);
    const [cartBusy,         setCartBusy]         = useState(false);
    const [priceMax,         setPriceMax]         = useState(100000);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [filtersOpen,      setFiltersOpen]      = useState(false);
    const [productError,     setProductError]     = useState(null);

    const modalRef            = useRef(null);
    const quickViewTriggerRef = useRef(null);

    // ── Fetchers ─────────────────────────────────────────────
    const fetchCategories = async () => {
        try {
            const res = await api.get("/public/categories?pageSize=1000");
            setCategories(res.data.content);
        } catch (e) {
            console.log(e);
        }
    };

    const fetchProducts = async (kw = keyword, catId = categoryId, max = priceMax) => {
        dispatch(fetchProductsStart());
        setProductError(null);
        try {
            let url = "/public/products?";
            if (kw.trim())    url += `keyword=${kw}&`;
            if (catId)        url += `categoryId=${catId}&`;
            if (max < 100000) url += `maxPrice=${max}&`;
            const res = await api.get(url);
            dispatch(fetchProductsSuccess(res.data.content));
        } catch (e) {
            dispatch(fetchProductsFailure(e.message));
            setProductError("Failed to load products. Check your connection and try again.");
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
    }, [keyword, categoryId, priceMax]);

    // ── Quick View focus management ───────────────────────────
    useEffect(() => {
        if (!quickViewProduct || !modalRef.current) return;
        const focusable = modalRef.current.querySelectorAll(
            'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length) focusable[0].focus();
    }, [quickViewProduct]);

    const openQuickView = (e, product) => {
        e.stopPropagation();
        quickViewTriggerRef.current = e.currentTarget;
        setQuickViewProduct(product);
    };

    const closeQuickView = () => {
        setQuickViewProduct(null);
        setTimeout(() => quickViewTriggerRef.current?.focus(), 0);
    };

    const handleModalKeyDown = (e) => {
        if (!modalRef.current) return;
        const focusable = [...modalRef.current.querySelectorAll(
            'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )];
        if (!focusable.length) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.key === "Escape") { e.preventDefault(); closeQuickView(); return; }
        if (e.key === "Tab") {
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
            }
        }
    };

    // ── Cart actions ──────────────────────────────────────────
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

    const handleReset = () => {
        setKeyword("");
        setCategoryId("");
        setPriceMax(100000);
        fetchProducts("", "", 100000);
    };

    const cartItems = cart?.items ?? [];
    const cartTotal = Number(cart?.totalPrice ?? 0);
    const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

    // ── Render ────────────────────────────────────────────────
    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ background: C.bg, color: C.text, fontFamily: "Inter, sans-serif" }}
        >
            {/* ══ Three-column main ══════════════════════════════════ */}
            <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-12 gap-6 py-6">

                {/* ── Mobile filter toggle ────────────────────────── */}
                <div className="col-span-12 lg:hidden">
                    <button
                        onClick={() => setFiltersOpen((o) => !o)}
                        aria-expanded={filtersOpen}
                        aria-controls="filters-aside"
                        className="w-full py-3 rounded font-bold text-sm flex items-center justify-center gap-2 transition-colors hover:opacity-90 min-h-[44px]"
                        style={{ background: C.surfaceHigh, border: `1px solid ${C.border}`, color: C.text }}
                    >
                        <HiSearch aria-hidden="true" size={16} />
                        {filtersOpen ? "Hide Filters" : "Show Filters"}
                    </button>
                </div>

                {/* ── LEFT: Filters card ──────────────────────────── */}
                <aside
                    id="filters-aside"
                    className={`${filtersOpen ? "flex" : "hidden"} lg:flex flex-col col-span-12 lg:col-span-3 lg:sticky lg:top-24 lg:h-[calc(100vh-112px)] rounded overflow-hidden`}
                    style={{ background: C.surface, border: `1px solid ${C.border}` }}
                >
                    {/* Card header */}
                    <div
                        className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
                        style={{ background: C.surfaceHigh, borderBottom: `1px solid ${C.border}` }}
                    >
                        <HiAdjustments aria-hidden="true" size={16} style={{ color: C.textDim }} />
                        <h2 className="text-sm font-bold" style={{ color: C.text }}>Filters</h2>
                    </div>

                    {/* Scrollable body */}
                    <div
                        className="flex-grow overflow-y-auto p-4 space-y-5"
                        style={{ scrollbarWidth: "thin", scrollbarColor: `${C.border} ${C.bg}` }}
                    >
                        {/* Categories */}
                        <div>
                            <p className="text-xs font-semibold mb-2" style={{ color: C.textDim }}>
                                Category
                            </p>
                            <div className="space-y-0.5">
                                <label
                                    className="flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors"
                                    style={{ color: categoryId === "" ? C.primary : C.textMuted }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(48,53,57,0.4)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    <input
                                        type="checkbox"
                                        checked={categoryId === ""}
                                        onChange={() => setCategoryId("")}
                                        style={{ accentColor: C.btnBg }}
                                    />
                                    All Categories
                                </label>
                                {categories.map((cat) => (
                                    <label
                                        key={cat.categoryId}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors"
                                        style={{ color: categoryId === String(cat.categoryId) ? C.primary : C.textMuted }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(48,53,57,0.4)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={categoryId === String(cat.categoryId)}
                                            onChange={() => handleCategoryToggle(cat.categoryId)}
                                            style={{ accentColor: C.btnBg }}
                                        />
                                        {cat.categoryName}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                            <label
                                htmlFor="price-range"
                                className="block text-xs font-semibold mb-3"
                                style={{ color: C.textDim }}
                            >
                                Price range (USD)
                            </label>
                            <input
                                id="price-range"
                                type="range"
                                min={0}
                                max={100000}
                                value={priceMax}
                                onChange={(e) => setPriceMax(Number(e.target.value))}
                                aria-valuetext={`Up to $${Number(priceMax).toLocaleString()}`}
                                className="w-full h-1 rounded-lg appearance-none cursor-pointer"
                                style={{ accentColor: C.btnBg, background: "#39485a" }}
                            />
                            <div className="flex justify-between mt-2 text-[10px]" style={{ color: C.textMuted }}>
                                <span>$0</span>
                                <span>${Number(priceMax).toLocaleString()}+</span>
                            </div>
                        </div>

                        {/* Availability — coming soon, not yet wired */}
                        <div className="pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                            <p className="text-xs font-semibold mb-3" style={{ color: C.textDim }}>
                                Availability
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    disabled
                                    aria-disabled="true"
                                    className="px-2 py-1 rounded-sm text-[10px] font-bold opacity-40 cursor-not-allowed"
                                    style={{ background: "rgba(15,58,43,0.9)", color: "#86efac", border: "1px solid #166534" }}
                                >
                                    In Stock
                                </button>
                                <button
                                    disabled
                                    aria-disabled="true"
                                    className="px-2 py-1 rounded-sm text-[10px] font-bold opacity-40 cursor-not-allowed"
                                    style={{ background: C.surfaceHigh, color: C.textMuted, border: `1px solid ${C.border}` }}
                                >
                                    On Demand
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Pinned footer — Apply / Reset */}
                    <div
                        className="flex gap-2 p-4 flex-shrink-0"
                        style={{ borderTop: `1px solid ${C.border}`, background: "rgba(9,21,34,0.6)" }}
                    >
                        <button
                            onClick={() => fetchProducts()}
                            className="flex-1 py-2.5 rounded font-bold text-xs transition-colors hover:opacity-90 min-h-[44px]"
                            style={{ background: C.btnBg, color: C.btnText }}
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2.5 rounded font-bold text-xs transition-colors hover:opacity-80 min-h-[44px]"
                            style={{ border: `1px solid ${C.border}`, color: C.primary, background: "transparent" }}
                        >
                            Reset
                        </button>
                    </div>
                </aside>

                {/* ── CENTER: Products ─────────────────────────────── */}
                <section className="col-span-12 lg:col-span-6 flex flex-col">
                    {/* Section header */}
                    <div className="mb-4 pb-3" style={{ borderBottom: `1px solid ${C.border}` }}>
                        <h1 className="text-xl font-semibold inline-block relative" style={{ color: C.text }}>
                            Featured Products
                            <span
                                className="absolute bottom-[-13px] left-0 w-1/2 h-[3px] rounded-t"
                                style={{ background: C.primary }}
                            />
                        </h1>
                    </div>

                    {/* Search */}
                    <div className="mb-4">
                        <label htmlFor="product-search" className="sr-only">
                            Search products or part numbers
                        </label>
                        <input
                            id="product-search"
                            type="text"
                            placeholder="Search products or part numbers..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full px-4 py-2 text-sm rounded focus:outline-none"
                            style={{ background: C.surfaceHigh, border: `1px solid ${C.border}`, color: C.text }}
                            onFocus={(e) => (e.target.style.borderColor = C.primary)}
                            onBlur={(e)  => (e.target.style.borderColor = C.border)}
                        />
                    </div>

                    {/* Screen-reader product count announcement */}
                    <div aria-live="polite" aria-atomic="true" className="sr-only">
                        {!loading && !productError && `${products.length} products`}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : productError ? (
                        <div className="py-20 text-center">
                            <p className="text-base mb-4" style={{ color: C.error }}>{productError}</p>
                            <button
                                onClick={() => fetchProducts()}
                                className="px-5 py-2 rounded text-sm font-bold transition-opacity hover:opacity-90 min-h-[44px]"
                                style={{ background: C.btnBg, color: C.btnText }}
                            >
                                Try again
                            </button>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-lg mb-2" style={{ color: C.textMuted }}>No products found</p>
                            <p className="text-sm" style={{ color: C.textDim }}>Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {products.map((product) => (
                                <article
                                    key={product.productId}
                                    className="rounded overflow-hidden flex flex-col transition-colors duration-200"
                                    style={{ background: C.surface, border: `1px solid ${C.border}` }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; }}
                                >
                                    {/* Image */}
                                    <div
                                        className="h-32 w-full relative overflow-hidden group"
                                        style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}
                                    >
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.productName}
                                                loading="lazy"
                                                className="w-full h-full object-contain group-hover:scale-105 transition-transform motion-reduce:transition-none duration-200"
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full flex items-center justify-center text-3xl"
                                                style={{ color: C.textDim }}
                                                aria-hidden="true"
                                            >
                                                &#128230;
                                            </div>
                                        )}

                                        {/* SKU badge — top left */}
                                        <div
                                            className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold rounded-sm z-10"
                                            style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}` }}
                                        >
                                            {product.modelNumber || product.categoryName || "PRODUCT"}
                                        </div>

                                        {/* Stock badge — top right */}
                                        {product.quantity > 0 ? (
                                            <div
                                                className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold rounded-sm z-10"
                                                style={{ background: "rgba(15,58,43,0.9)", color: "#86efac", border: "1px solid #166534" }}
                                            >
                                                IN STOCK
                                            </div>
                                        ) : (
                                            <div
                                                className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold rounded-sm z-10"
                                                style={{ background: "rgba(100,0,0,0.85)", color: C.error, border: "1px solid #93000a" }}
                                            >
                                                OUT
                                            </div>
                                        )}

                                        {/* Quick View overlay — desktop */}
                                        <div className="absolute inset-0 hidden md:flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity motion-reduce:transition-none duration-200 z-20">
                                            <button
                                                onClick={(e) => openQuickView(e, product)}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold min-h-[44px]"
                                                style={{ background: "rgba(255,255,255,0.95)", color: C.btnText, border: `1px solid ${C.border}` }}
                                            >
                                                Quick View
                                            </button>
                                        </div>

                                        {/* Quick View pill — mobile */}
                                        <div className="absolute bottom-2 left-0 right-0 flex justify-center md:hidden z-20">
                                            <button
                                                onClick={(e) => openQuickView(e, product)}
                                                className="px-4 py-2 rounded-full text-[10px] font-bold backdrop-blur-sm min-h-[44px]"
                                                style={{ background: "rgba(0,0,0,0.65)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}
                                            >
                                                Quick View
                                            </button>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3 flex flex-col flex-grow">
                                        <h3 className="text-xs font-bold mb-1 leading-snug line-clamp-2">
                                            <Link
                                                to={`/products/${product.productId}`}
                                                style={{ color: C.text, textDecoration: "none" }}
                                                onMouseEnter={(e) => (e.currentTarget.style.color = C.primary)}
                                                onMouseLeave={(e) => (e.currentTarget.style.color = C.text)}
                                            >
                                                {product.productName}
                                            </Link>
                                        </h3>
                                        <p className="text-[11px] mb-3 line-clamp-2" style={{ color: C.textMuted }}>
                                            {product.description}
                                        </p>
                                        <div className="mt-auto flex flex-col gap-2 pt-2" style={{ borderTop: `1px solid rgba(62,72,79,0.4)` }}>
                                            <div>
                                                <span className="block text-[10px] uppercase tracking-widest font-bold" style={{ color: C.textDim }}>
                                                    Unit Price
                                                </span>
                                                <span className="text-sm font-bold" style={{ color: C.primary }}>
                                                    ${Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <button
                                                disabled={product.quantity === 0 || cartBusy}
                                                onClick={() => handleAddToCart(product.productId)}
                                                className="w-full py-2 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity motion-reduce:transition-none disabled:opacity-40 min-h-[44px]"
                                                style={{ background: C.btnBg, color: C.btnText }}
                                            >
                                                <FaShoppingCart aria-hidden="true" size={12} />
                                                {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* ── RIGHT: Mini Cart card ────────────────────────── */}
                <aside className="col-span-12 lg:col-span-3">
                    <div
                        className="rounded overflow-hidden flex flex-col lg:sticky lg:top-24 lg:max-h-[calc(100vh-112px)]"
                        style={{ background: C.surface, border: `1px solid ${C.border}` }}
                    >
                        {/* Cart header */}
                        <div
                            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                            style={{ background: C.surfaceHigh, borderBottom: `1px solid ${C.border}` }}
                        >
                            <div className="flex items-center gap-2">
                                <FaShoppingCart aria-hidden="true" size={14} style={{ color: C.textDim }} />
                                <h2 className="text-sm font-bold" style={{ color: C.text }}>Your Cart</h2>
                            </div>
                            {itemCount > 0 && (
                                <span
                                    className="text-[10px] font-bold px-2 py-0.5 rounded"
                                    style={{ background: "rgba(142,213,255,0.2)", color: C.primary }}
                                    aria-live="polite"
                                >
                                    {itemCount} {itemCount === 1 ? "ITEM" : "ITEMS"}
                                </span>
                            )}
                        </div>

                        {/* Items list */}
                        <div
                            className="flex-grow overflow-y-auto p-3 space-y-3"
                            style={{ scrollbarWidth: "thin", scrollbarColor: `${C.border} ${C.bg}` }}
                        >
                            {!user ? (
                                <p className="text-sm text-center py-10" style={{ color: C.textDim }}>
                                    Login to view your cart
                                </p>
                            ) : cartItems.length === 0 ? (
                                <div className="text-center py-10">
                                    <FaShoppingCart aria-hidden="true" size={28} className="mx-auto mb-3" style={{ color: C.textDim }} />
                                    <p className="text-sm mb-1" style={{ color: C.textMuted }}>Cart is empty</p>
                                    <p className="text-xs" style={{ color: C.textDim }}>Add products to get started</p>
                                </div>
                            ) : (
                                cartItems.map((item) => (
                                    <div
                                        key={item.productId}
                                        className="flex gap-2 p-2 rounded relative"
                                        style={{ background: C.bg, border: `1px solid ${C.border}` }}
                                    >
                                        {/* Thumbnail */}
                                        <div
                                            className="w-12 h-12 rounded flex-shrink-0 overflow-hidden flex items-center justify-center"
                                            style={{ background: C.surfaceHigh, border: `1px solid ${C.border}` }}
                                        >
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.productName}
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <span aria-hidden="true" className="text-xl" style={{ color: C.textDim }}>&#128230;</span>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-grow min-w-0 pr-8">
                                            <h4 className="text-[11px] font-bold truncate" style={{ color: C.text }}>
                                                {item.productName}
                                            </h4>
                                            <p className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>
                                                Qty: {item.quantity}
                                            </p>
                                            <span className="text-xs font-bold" style={{ color: C.primary }}>
                                                ${Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>

                                        {/* Remove */}
                                        <button
                                            onClick={() => handleRemoveFromCart(item.productId)}
                                            aria-label={`Remove ${item.productName} from cart`}
                                            className="absolute top-1 right-1 w-7 h-7 flex items-center justify-center rounded transition-opacity hover:opacity-70"
                                            style={{ color: C.textDim, background: "none", border: "none", cursor: "pointer" }}
                                        >
                                            <HiX aria-hidden="true" size={12} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Summary + checkout */}
                        {user && cartItems.length > 0 && (
                            <div
                                className="p-4 space-y-2.5 flex-shrink-0"
                                style={{ borderTop: `1px solid ${C.border}`, background: C.surfaceHigh }}
                            >
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: C.textMuted }}>Subtotal</span>
                                    <span style={{ color: C.text }}>
                                        ${cartTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: C.textMuted }}>Est. Shipping (Freight)</span>
                                    <span style={{ color: C.textMuted }}>TBD</span>
                                </div>
                                <div className="flex justify-between pt-2.5" style={{ borderTop: `1px solid ${C.border}` }}>
                                    <span className="text-sm font-bold" style={{ color: C.text }}>Total</span>
                                    <span className="text-sm font-bold" style={{ color: C.primary }}>
                                        ${cartTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <button
                                    onClick={() => navigate("/checkout")}
                                    className="w-full py-3 rounded font-bold text-xs mt-1 hover:opacity-90 transition-opacity motion-reduce:transition-none flex items-center justify-center gap-1.5 min-h-[44px]"
                                    style={{ background: C.btnBg, color: C.btnText }}
                                >
                                    Proceed to Checkout →
                                </button>
                            </div>
                        )}
                    </div>
                </aside>
            </main>

            {/* ══ Mobile floating cart badge ═════════════════════════ */}
            {user && itemCount > 0 && (
                <div className="fixed bottom-6 right-4 z-40 lg:hidden">
                    <button
                        onClick={() => navigate("/cart")}
                        aria-label={`Cart: ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
                        className="flex items-center gap-2 px-4 py-3 rounded-full shadow-lg min-h-[44px]"
                        style={{ background: C.btnBg, color: C.btnText }}
                    >
                        <FaShoppingCart aria-hidden="true" size={18} />
                        <span className="font-bold text-sm">{itemCount}</span>
                    </button>
                </div>
            )}

            {/* ══ Footer ════════════════════════════════════════════ */}
            <footer style={{ background: C.footer, borderTop: `1px solid ${C.border}` }}>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full max-w-[1440px] mx-auto py-6 px-4 sm:px-6 lg:px-10">
                    <div>
                        <span className="text-sm font-bold" style={{ color: C.primary }}>SolydShop</span>
                        <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                            © 2024 SolydShop Industrial Procurement. All rights reserved.
                        </p>
                    </div>
                    <div className="flex gap-5">
                        {["Terms of Service", "Privacy Policy", "Technical Support", "Contact Sales"].map((link) => (
                            <a
                                key={link}
                                href="#"
                                className="text-xs transition-colors"
                                style={{ color: C.textMuted }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = C.primary)}
                                onMouseLeave={(e) => (e.currentTarget.style.color = C.textMuted)}
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
                    onClick={closeQuickView}
                >
                    <div
                        ref={modalRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="qv-title"
                        className="relative rounded w-full max-w-xs max-h-[80vh] overflow-y-auto"
                        style={{ background: C.surface, border: `1px solid ${C.border}` }}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={handleModalKeyDown}
                    >
                        {/* Close */}
                        <button
                            onClick={closeQuickView}
                            aria-label="Close Quick View"
                            className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded transition-opacity hover:opacity-70"
                            style={{ background: C.surfaceHigh, color: C.textMuted, border: `1px solid ${C.border}` }}
                        >
                            <HiX aria-hidden="true" size={12} />
                        </button>

                        {/* Image */}
                        <div className="h-36 w-full overflow-hidden rounded-t" style={{ background: C.bg }}>
                            {quickViewProduct.imageUrl ? (
                                <img
                                    src={quickViewProduct.imageUrl}
                                    alt={quickViewProduct.productName}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center text-4xl"
                                    style={{ color: C.textDim }}
                                    aria-hidden="true"
                                >
                                    &#128230;
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                            {/* SKU + stock */}
                            <div className="flex items-center justify-between">
                                <span
                                    className="px-2 py-0.5 text-[10px] font-bold rounded-sm"
                                    style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}` }}
                                >
                                    {quickViewProduct.modelNumber || quickViewProduct.categoryName || "PRODUCT"}
                                </span>
                                <span
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-sm"
                                    style={quickViewProduct.quantity > 0
                                        ? { background: "rgba(15,58,43,0.9)", color: "#86efac", border: "1px solid #166534" }
                                        : { background: "rgba(100,0,0,0.85)", color: C.error, border: "1px solid #93000a" }
                                    }
                                >
                                    {quickViewProduct.quantity > 0 ? `In Stock (${quickViewProduct.quantity})` : "Out of Stock"}
                                </span>
                            </div>

                            {/* Name */}
                            <h2 id="qv-title" className="text-sm font-bold leading-snug" style={{ color: C.text }}>
                                {quickViewProduct.productName}
                            </h2>

                            {/* Description */}
                            <p
                                className="text-sm leading-relaxed max-h-24 overflow-y-auto overflow-x-hidden break-all"
                                style={{ color: C.textMuted, scrollbarWidth: "thin", scrollbarColor: `${C.border} transparent` }}
                            >
                                {quickViewProduct.description || "No description available."}
                            </p>

                            {/* Price + Add */}
                            <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                                <div>
                                    <span className="block text-[10px] uppercase tracking-widest font-bold" style={{ color: C.textDim }}>Unit Price</span>
                                    <span className="text-base font-bold" style={{ color: C.primary }}>
                                        ${Number(quickViewProduct.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <button
                                    disabled={quickViewProduct.quantity === 0 || cartBusy}
                                    onClick={() => { handleAddToCart(quickViewProduct.productId); closeQuickView(); }}
                                    className="px-4 py-2 rounded text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity motion-reduce:transition-none disabled:opacity-40 min-h-[44px]"
                                    style={{ background: C.btnBg, color: C.btnText }}
                                >
                                    <FaShoppingCart aria-hidden="true" size={12} />
                                    {quickViewProduct.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                                </button>
                            </div>

                            {/* View Full Details link */}
                            <Link
                                to={`/products/${quickViewProduct.productId}`}
                                onClick={closeQuickView}
                                className="block text-center text-xs font-bold py-2 rounded transition-opacity hover:opacity-80 motion-reduce:transition-none"
                                style={{ color: C.primary, border: `1px solid ${C.border}`, textDecoration: "none", lineHeight: "2.5", minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                                View Full Details →
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
