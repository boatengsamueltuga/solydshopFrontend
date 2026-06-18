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

const getXsrfToken = () =>
    document.cookie.split("; ").find((r) => r.startsWith("XSRF-TOKEN="))?.split("=")[1];

/* ── Skeleton card ── */
const SkeletonCard = () => (
    <div className="rounded overflow-hidden animate-pulse" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="h-32 w-full" style={{ background: "var(--surface-high)" }} />
        <div className="p-3 space-y-2">
            <div className="h-2.5 rounded w-4/5" style={{ background: "var(--surface-high)" }} />
            <div className="h-2.5 rounded w-3/5" style={{ background: "var(--surface-high)" }} />
            <div className="h-7 rounded mt-3" style={{ background: "var(--surface-high)" }} />
        </div>
    </div>
);

/* ── Main component ── */
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
    const [pageNumber,       setPageNumber]       = useState(0);
    const [totalPages,       setTotalPages]       = useState(1);
    const [inStockOnly,      setInStockOnly]      = useState(false);

    const modalRef            = useRef(null);
    const quickViewTriggerRef = useRef(null);

    /* ── Fetchers ── */
    const fetchCategories = async () => {
        try {
            const res = await api.get("/public/categories?pageSize=1000");
            setCategories(res.data.content);
        } catch (e) { console.log(e); }
    };

    const fetchProducts = async (kw = keyword, catId = categoryId, max = priceMax, page = pageNumber, inStock = inStockOnly) => {
        dispatch(fetchProductsStart());
        setProductError(null);
        try {
            let url = `/public/products?pageNumber=${page}&pageSize=12&`;
            if (kw.trim())    url += `keyword=${encodeURIComponent(kw)}&`;
            if (catId)        url += `categoryId=${catId}&`;
            if (max < 100000) url += `maxPrice=${max}&`;
            if (inStock)      url += `inStock=true&`;
            const res = await api.get(url);
            dispatch(fetchProductsSuccess(res.data.content));
            setTotalPages(res.data.totalPages ?? 1);
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
        } catch (e) { console.log(e); }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchCart();
    }, []);

    useEffect(() => {
        setPageNumber(0);
        const t = setTimeout(() => fetchProducts(keyword, categoryId, priceMax, 0, inStockOnly), 400);
        return () => clearTimeout(t);
    }, [keyword, categoryId, priceMax, inStockOnly]);

    /* ── Quick View focus management ── */
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
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        }
    };

    /* ── Cart actions ── */
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
        } catch (e) { console.log(e); }
        finally { setCartBusy(false); }
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
        } catch (e) { console.log(e); }
        finally { setCartBusy(false); }
    };

    const handleCategoryToggle = (id) =>
        setCategoryId((prev) => (prev === String(id) ? "" : String(id)));

    const handleReset = () => {
        setKeyword("");
        setCategoryId("");
        setPriceMax(100000);
        setInStockOnly(false);
        setPageNumber(0);
        fetchProducts("", "", 100000, 0, false);
    };

    const handlePageChange = (newPage) => {
        setPageNumber(newPage);
        fetchProducts(keyword, categoryId, priceMax, newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const cartItems = cart?.items ?? [];
    const cartTotal = Number(cart?.totalPrice ?? 0);
    const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

    /* ── Render ── */
    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)" }}
        >
            {/* ══ Three-column main ══ */}
            <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-12 gap-6 py-6">

                {/* ── Mobile filter toggle ── */}
                <div className="col-span-12 lg:hidden">
                    <button
                        onClick={() => setFiltersOpen((o) => !o)}
                        aria-expanded={filtersOpen}
                        aria-controls="filters-aside"
                        className="w-full py-3 rounded font-bold text-sm flex items-center justify-center gap-2 transition-colors hover:opacity-90 min-h-[44px]"
                        style={{ background: "var(--surface-high)", border: "1px solid var(--border)", color: "var(--text)" }}
                    >
                        <HiSearch aria-hidden="true" size={16} />
                        {filtersOpen ? "Hide Filters" : "Show Filters"}
                    </button>
                </div>

                {/* ── LEFT: Filters ── */}
                <aside
                    id="filters-aside"
                    className={`${filtersOpen ? "flex" : "hidden"} lg:flex flex-col col-span-12 lg:col-span-3 lg:sticky lg:top-24 lg:h-[calc(100vh-112px)] rounded overflow-hidden`}
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                    {/* Card header */}
                    <div
                        className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
                        style={{ background: "var(--surface-high)", borderBottom: "1px solid var(--border)" }}
                    >
                        <HiAdjustments aria-hidden="true" size={16} style={{ color: "var(--text-3)" }} />
                        <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>Filters</h2>
                    </div>

                    {/* Scrollable body */}
                    <div
                        className="flex-grow overflow-y-auto p-4 space-y-5"
                        style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border) var(--bg)" }}
                    >
                        {/* Categories */}
                        <div>
                            <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-3)" }}>
                                Category
                            </p>
                            <div className="space-y-0.5">
                                <label
                                    className="flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors"
                                    style={{ color: categoryId === "" ? "var(--accent)" : "var(--text-2)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    <input
                                        type="checkbox"
                                        checked={categoryId === ""}
                                        onChange={() => setCategoryId("")}
                                        style={{ accentColor: "var(--accent)" }}
                                    />
                                    All Categories
                                </label>
                                {categories.map((cat) => (
                                    <label
                                        key={cat.categoryId}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors"
                                        style={{ color: categoryId === String(cat.categoryId) ? "var(--accent)" : "var(--text-2)" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={categoryId === String(cat.categoryId)}
                                            onChange={() => handleCategoryToggle(cat.categoryId)}
                                            style={{ accentColor: "var(--accent)" }}
                                        />
                                        {cat.categoryName}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                            <label
                                htmlFor="price-range"
                                className="block text-xs font-semibold mb-3"
                                style={{ color: "var(--text-3)" }}
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
                                style={{ accentColor: "var(--accent)", background: "var(--border-mid)" }}
                            />
                            <div className="flex justify-between mt-2 text-[10px]" style={{ color: "var(--text-2)" }}>
                                <span>$0</span>
                                <span style={{ fontFamily: "var(--font-mono)" }}>${Number(priceMax).toLocaleString()}+</span>
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                            <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-3)" }}>
                                Availability
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setInStockOnly((v) => !v)}
                                    aria-pressed={inStockOnly}
                                    className="px-2 py-1 rounded-sm text-[10px] font-bold"
                                    style={{
                                        background: inStockOnly ? "var(--success)" : "var(--success-subtle)",
                                        color:      inStockOnly ? "var(--bg)"      : "var(--success)",
                                        border:     "1px solid var(--success)",
                                        cursor:     "pointer",
                                    }}
                                >
                                    In Stock
                                </button>
                                <button
                                    disabled
                                    aria-disabled="true"
                                    className="px-2 py-1 rounded-sm text-[10px] font-bold opacity-40 cursor-not-allowed"
                                    style={{ background: "var(--surface-high)", color: "var(--text-2)", border: "1px solid var(--border)" }}
                                >
                                    On Demand
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer — Apply / Reset */}
                    <div
                        className="flex gap-2 p-4 flex-shrink-0"
                        style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}
                    >
                        <button
                            onClick={() => { setPageNumber(0); fetchProducts(keyword, categoryId, priceMax, 0, inStockOnly); }}
                            className="flex-1 py-2.5 rounded font-bold text-xs transition-colors hover:opacity-90 min-h-[44px]"
                            style={{ background: "var(--accent)", color: "var(--bg)" }}
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2.5 rounded font-bold text-xs transition-colors hover:opacity-80 min-h-[44px]"
                            style={{ border: "1px solid var(--border)", color: "var(--accent)", background: "transparent" }}
                        >
                            Reset
                        </button>
                    </div>
                </aside>

                {/* ── CENTER: Products ── */}
                <section className="col-span-12 lg:col-span-6 flex flex-col">
                    {/* Section header */}
                    <div className="mb-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
                        <h1 className="text-xl font-semibold inline-block relative" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>
                            Featured Parts
                            <span
                                className="absolute bottom-[-13px] left-0 w-1/2 h-[3px] rounded-t"
                                style={{ background: "var(--accent)" }}
                            />
                        </h1>
                    </div>

                    {/* Search */}
                    <div className="mb-4">
                        <label htmlFor="product-search" className="sr-only">Search parts by name, model, or number</label>
                        <input
                            id="product-search"
                            type="text"
                            placeholder="Search by part name, model, or number..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full px-4 py-2 text-sm rounded focus:outline-none"
                            style={{ background: "var(--surface-high)", border: "1px solid var(--border)", color: "var(--text)", fontFamily: "var(--font-body)" }}
                            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                            onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
                        />
                    </div>

                    {/* Screen-reader count */}
                    <div aria-live="polite" aria-atomic="true" className="sr-only">
                        {!loading && !productError && `${products.length} products`}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : productError ? (
                        <div className="py-20 text-center">
                            <p className="text-base mb-4" style={{ color: "var(--error)" }}>{productError}</p>
                            <button
                                onClick={() => fetchProducts()}
                                className="px-5 py-2 rounded text-sm font-bold transition-opacity hover:opacity-90 min-h-[44px]"
                                style={{ background: "var(--accent)", color: "var(--bg)" }}
                            >
                                Try again
                            </button>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-lg mb-2" style={{ color: "var(--text-2)" }}>No products found</p>
                            <p className="text-sm" style={{ color: "var(--text-3)" }}>Try adjusting your filters</p>
                        </div>
                    ) : (
                        <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {products.map((product) => (
                                <article
                                    key={product.productId}
                                    className="rounded overflow-hidden flex flex-col transition-colors duration-200"
                                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                                >
                                    {/* Product image */}
                                    <div
                                        className="h-32 w-full relative overflow-hidden group"
                                        style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}
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
                                                style={{ color: "var(--text-4)" }}
                                                aria-hidden="true"
                                            >
                                                &#128230;
                                            </div>
                                        )}

                                        {/* Model badge — top left */}
                                        <div
                                            className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold rounded-sm z-10"
                                            style={{ background: "var(--surface-mid)", color: "var(--text-2)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)" }}
                                        >
                                            {product.modelNumber || product.categoryName || "PART"}
                                        </div>

                                        {/* Stock badge — top right */}
                                        {product.quantity > 0 ? (
                                            <div
                                                className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold rounded-sm z-10"
                                                style={{ background: "var(--success-subtle)", color: "var(--success)", border: "1px solid var(--success)" }}
                                            >
                                                IN STOCK
                                            </div>
                                        ) : (
                                            <div
                                                className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold rounded-sm z-10"
                                                style={{ background: "var(--error-subtle)", color: "var(--error)", border: "1px solid var(--error)" }}
                                            >
                                                OUT
                                            </div>
                                        )}

                                        {/* Quick View overlay — desktop */}
                                        <div className="absolute inset-0 hidden md:flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity motion-reduce:transition-none duration-200 z-20">
                                            <button
                                                onClick={(e) => openQuickView(e, product)}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold min-h-[44px]"
                                                style={{ background: "rgba(255,255,255,0.95)", color: "var(--bg)", border: "1px solid var(--border)" }}
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
                                        <h3 className="text-xs font-bold mb-1 leading-snug line-clamp-2" style={{ fontFamily: "var(--font-display)" }}>
                                            <Link
                                                to={`/products/${product.productId}`}
                                                style={{ color: "var(--text)", textDecoration: "none" }}
                                                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text)")}
                                            >
                                                {product.productName}
                                            </Link>
                                        </h3>

                                        <p className="text-[11px] mb-2 line-clamp-2" style={{ color: "var(--text-2)" }}>
                                            {product.description}
                                        </p>

                                        {/* Part number */}
                                        {product.partNumber && (
                                            <div className="mb-2">
                                                <span className="block text-[10px] uppercase tracking-widest font-bold" style={{ color: "var(--text-3)" }}>
                                                    Part No.
                                                </span>
                                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--accent)", fontWeight: 500 }}>
                                                    {product.partNumber}
                                                </span>
                                            </div>
                                        )}

                                        <div className="mt-auto flex flex-col gap-2 pt-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                                            <div>
                                                <span className="block text-[10px] uppercase tracking-widest font-bold" style={{ color: "var(--text-3)" }}>
                                                    Unit Price
                                                </span>
                                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>
                                                    ${Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <button
                                                disabled={product.quantity === 0 || cartBusy}
                                                onClick={() => handleAddToCart(product.productId)}
                                                className="w-full py-2 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity motion-reduce:transition-none disabled:opacity-40 min-h-[44px]"
                                                style={{ background: "var(--accent)", color: "var(--bg)", fontFamily: "var(--font-body)" }}
                                            >
                                                <FaShoppingCart aria-hidden="true" size={12} />
                                                {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-3)", marginTop: "var(--space-6)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--border)" }}>
                                <button
                                    onClick={() => handlePageChange(pageNumber - 1)}
                                    disabled={pageNumber === 0 || loading}
                                    style={{
                                        padding:      "var(--space-2) var(--space-4)",
                                        background:   "var(--surface-mid)",
                                        border:       "1px solid var(--border)",
                                        borderRadius: "var(--r-sm)",
                                        color:        pageNumber === 0 ? "var(--text-4)" : "var(--text-2)",
                                        fontFamily:   "var(--font-body)",
                                        fontSize:     "var(--text-sm)",
                                        fontWeight:   600,
                                        cursor:       pageNumber === 0 ? "not-allowed" : "pointer",
                                        transition:   "border-color var(--duration-fast)",
                                    }}
                                    onMouseEnter={e => { if (pageNumber > 0) e.currentTarget.style.borderColor = "var(--accent)"; }}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                                >
                                    ← Prev
                                </button>

                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-3)" }}>
                                    {pageNumber + 1} / {totalPages}
                                </span>

                                <button
                                    onClick={() => handlePageChange(pageNumber + 1)}
                                    disabled={pageNumber >= totalPages - 1 || loading}
                                    style={{
                                        padding:      "var(--space-2) var(--space-4)",
                                        background:   "var(--surface-mid)",
                                        border:       "1px solid var(--border)",
                                        borderRadius: "var(--r-sm)",
                                        color:        pageNumber >= totalPages - 1 ? "var(--text-4)" : "var(--text-2)",
                                        fontFamily:   "var(--font-body)",
                                        fontSize:     "var(--text-sm)",
                                        fontWeight:   600,
                                        cursor:       pageNumber >= totalPages - 1 ? "not-allowed" : "pointer",
                                        transition:   "border-color var(--duration-fast)",
                                    }}
                                    onMouseEnter={e => { if (pageNumber < totalPages - 1) e.currentTarget.style.borderColor = "var(--accent)"; }}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                        </>
                    )}
                </section>

                {/* ── RIGHT: Mini Cart ── */}
                <aside className="col-span-12 lg:col-span-3">
                    <div
                        className="rounded overflow-hidden flex flex-col lg:sticky lg:top-24 lg:max-h-[calc(100vh-112px)]"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                        {/* Cart header */}
                        <div
                            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                            style={{ background: "var(--surface-high)", borderBottom: "1px solid var(--border)" }}
                        >
                            <div className="flex items-center gap-2">
                                <FaShoppingCart aria-hidden="true" size={14} style={{ color: "var(--text-3)" }} />
                                <h2 className="text-sm font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>Your Cart</h2>
                            </div>
                            {itemCount > 0 && (
                                <span
                                    className="text-[10px] font-bold px-2 py-0.5 rounded"
                                    style={{ background: "var(--accent-subtle)", color: "var(--accent)", fontFamily: "var(--font-mono)" }}
                                    aria-live="polite"
                                >
                                    {itemCount} {itemCount === 1 ? "ITEM" : "ITEMS"}
                                </span>
                            )}
                        </div>

                        {/* Items list */}
                        <div
                            className="flex-grow overflow-y-auto p-3 space-y-3"
                            style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border) var(--bg)" }}
                        >
                            {!user ? (
                                <p className="text-sm text-center py-10" style={{ color: "var(--text-3)" }}>
                                    Login to view your cart
                                </p>
                            ) : cartItems.length === 0 ? (
                                <div className="text-center py-10">
                                    <FaShoppingCart aria-hidden="true" size={28} className="mx-auto mb-3" style={{ color: "var(--text-4)" }} />
                                    <p className="text-sm mb-1" style={{ color: "var(--text-2)" }}>Cart is empty</p>
                                    <p className="text-xs" style={{ color: "var(--text-3)" }}>Add products to get started</p>
                                </div>
                            ) : (
                                cartItems.map((item) => (
                                    <div
                                        key={item.productId}
                                        className="flex gap-2 p-2 rounded relative"
                                        style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                                    >
                                        {/* Thumbnail */}
                                        <div
                                            className="w-12 h-12 rounded flex-shrink-0 overflow-hidden flex items-center justify-center"
                                            style={{ background: "var(--surface-high)", border: "1px solid var(--border)" }}
                                        >
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-contain" />
                                            ) : (
                                                <span aria-hidden="true" className="text-xl" style={{ color: "var(--text-4)" }}>&#128230;</span>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-grow min-w-0 pr-8">
                                            <h4 className="text-[11px] font-bold truncate" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>
                                                {item.productName}
                                            </h4>
                                            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-2)" }}>
                                                Qty: {item.quantity}
                                            </p>
                                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 600, color: "var(--accent)" }}>
                                                ${Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>

                                        {/* Remove */}
                                        <button
                                            onClick={() => handleRemoveFromCart(item.productId)}
                                            aria-label={`Remove ${item.productName} from cart`}
                                            className="absolute top-1 right-1 w-7 h-7 flex items-center justify-center rounded transition-opacity hover:opacity-70"
                                            style={{ color: "var(--text-3)", background: "none", border: "none", cursor: "pointer" }}
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
                                style={{ borderTop: "1px solid var(--border)", background: "var(--surface-high)" }}
                            >
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: "var(--text-2)" }}>Subtotal</span>
                                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--text)", fontWeight: 600 }}>
                                        ${cartTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: "var(--text-3)" }}>Est. Shipping (Freight)</span>
                                    <span style={{ color: "var(--text-3)" }}>TBD</span>
                                </div>
                                <div className="flex justify-between pt-2.5" style={{ borderTop: "1px solid var(--border)" }}>
                                    <span className="text-sm font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-body)" }}>Total</span>
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 700, color: "var(--accent)" }}>
                                        ${cartTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <button
                                    onClick={() => navigate("/checkout")}
                                    className="w-full py-3 rounded font-bold text-xs mt-1 hover:opacity-90 transition-opacity motion-reduce:transition-none flex items-center justify-center gap-1.5 min-h-[44px]"
                                    style={{ background: "var(--accent)", color: "var(--bg)", fontFamily: "var(--font-body)" }}
                                >
                                    Proceed to Checkout →
                                </button>
                            </div>
                        )}
                    </div>
                </aside>
            </main>

            {/* ══ Footer ══ */}
            <footer style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full max-w-[1440px] mx-auto py-6 px-4 sm:px-6 lg:px-10">
                    <div>
                        <span className="text-sm font-bold" style={{ color: "var(--accent)", fontFamily: "var(--font-display)" }}>SolydShop</span>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                            © 2024 SolydShop Industrial Procurement. All rights reserved.
                        </p>
                    </div>
                    <div className="flex gap-5">
                        {["Terms of Service", "Privacy Policy", "Technical Support", "Contact Sales"].map((link) => (
                            <a
                                key={link}
                                href="#"
                                className="text-xs transition-colors"
                                style={{ color: "var(--text-3)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </footer>

            {/* ══ Quick View Modal ══ */}
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
                        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={handleModalKeyDown}
                    >
                        {/* Close */}
                        <button
                            onClick={closeQuickView}
                            aria-label="Close Quick View"
                            className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded transition-opacity hover:opacity-70"
                            style={{ background: "var(--surface-high)", color: "var(--text-2)", border: "1px solid var(--border)" }}
                        >
                            <HiX aria-hidden="true" size={12} />
                        </button>

                        {/* Image */}
                        <div className="h-36 w-full overflow-hidden rounded-t" style={{ background: "var(--bg)" }}>
                            {quickViewProduct.imageUrl ? (
                                <img src={quickViewProduct.imageUrl} alt={quickViewProduct.productName} className="w-full h-full object-contain" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl" style={{ color: "var(--text-4)" }} aria-hidden="true">
                                    &#128230;
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                            {/* Model + stock badges */}
                            <div className="flex items-center justify-between">
                                <span
                                    className="px-2 py-0.5 text-[10px] font-bold rounded-sm"
                                    style={{ background: "var(--surface-mid)", color: "var(--text-2)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)" }}
                                >
                                    {quickViewProduct.modelNumber || quickViewProduct.categoryName || "PRODUCT"}
                                </span>
                                <span
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-sm"
                                    style={quickViewProduct.quantity > 0
                                        ? { background: "var(--success-subtle)", color: "var(--success)", border: "1px solid var(--success)" }
                                        : { background: "var(--error-subtle)", color: "var(--error)", border: "1px solid var(--error)" }
                                    }
                                >
                                    {quickViewProduct.quantity > 0 ? `In Stock (${quickViewProduct.quantity})` : "Out of Stock"}
                                </span>
                            </div>

                            {/* Name */}
                            <h2 id="qv-title" className="text-sm font-bold leading-snug" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>
                                {quickViewProduct.productName}
                            </h2>

                            {/* Part number */}
                            {quickViewProduct.partNumber && (
                                <div>
                                    <span className="block text-[10px] uppercase tracking-widest font-bold" style={{ color: "var(--text-3)" }}>Part No.</span>
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent)", fontWeight: 500 }}>
                                        {quickViewProduct.partNumber}
                                    </span>
                                </div>
                            )}

                            {/* Description */}
                            <p
                                className="text-sm leading-relaxed max-h-24 overflow-y-auto overflow-x-hidden break-all"
                                style={{ color: "var(--text-2)", scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" }}
                            >
                                {quickViewProduct.description || "No description available."}
                            </p>

                            {/* Price + Add */}
                            <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                                <div>
                                    <span className="block text-[10px] uppercase tracking-widest font-bold" style={{ color: "var(--text-3)" }}>Unit Price</span>
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "15px", fontWeight: 700, color: "var(--text)" }}>
                                        ${Number(quickViewProduct.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <button
                                    disabled={quickViewProduct.quantity === 0 || cartBusy}
                                    onClick={() => { handleAddToCart(quickViewProduct.productId); closeQuickView(); }}
                                    className="px-4 py-2 rounded text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity motion-reduce:transition-none disabled:opacity-40 min-h-[44px]"
                                    style={{ background: "var(--accent)", color: "var(--bg)", fontFamily: "var(--font-body)" }}
                                >
                                    <FaShoppingCart aria-hidden="true" size={12} />
                                    {quickViewProduct.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                                </button>
                            </div>

                            {/* View Full Details */}
                            <Link
                                to={`/products/${quickViewProduct.productId}`}
                                onClick={closeQuickView}
                                className="block text-center text-xs font-bold py-2 rounded transition-opacity hover:opacity-80 motion-reduce:transition-none"
                                style={{ color: "var(--accent)", border: "1px solid var(--border)", textDecoration: "none", lineHeight: "2.5", minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
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
