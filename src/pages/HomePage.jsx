import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import toast from "react-hot-toast";
import { HiAdjustments, HiArrowRight, HiSearch, HiX } from "react-icons/hi";
import { FaShoppingCart, FaHeart, FaRegHeart, FaEye } from "react-icons/fa";
import {
    fetchProductsStart,
    fetchProductsSuccess,
    fetchProductsFailure,
} from "../features/product/productSlice";
import {
    optimisticAddItem,
    optimisticRemoveItem,
    setWishlistItems,
} from "../features/wishlist/wishlistSlice";
import { setCartCount } from "../features/cart/cartSlice";
import SolydLogo from "../components/SolydLogo";
import { fmtCurrency, fmtPrice } from "../utils/format";

const getXsrfToken = () =>
    document.cookie.split("; ").find((r) => r.startsWith("XSRF-TOKEN="))?.split("=")[1];

/* ── Static data ─────────────────────────────────────────────────────── */
const HERO_GRID = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="#ccd5ae" stroke-width="0.5"/></svg>')}")`;


const TRUST_PILLARS = [
    { symbol: "✓", label: "ISO 9001 CERTIFIED",   copy: "Every part meets international quality management standards." },
    { symbol: "◈", label: "OEM VERIFIED STOCK",   copy: "Cross-referenced OEM specs before every order ships." },
    { symbol: "⊠", label: "SECURE B2B PORTAL",    copy: "End-to-end encrypted transactions, GDPR compliant." },
    { symbol: "→", label: "FAST GLOBAL DISPATCH", copy: "Most orders dispatched within 48 business hours." },
];

const SUPPLIERS = ["Komatsu", "Caterpillar", "Hitachi", "Volvo CE", "Liebherr", "Doosan"];

/* ── Two-part engineering illustration ───────────────────────────────── */
const BearingIllustration = () => {
    // Bearing balls — scaled bearing, center (148, 200)
    const bCX = 148, bCY = 200;
    const bearingBalls = Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return { cx: Math.round(bCX + 72 * Math.cos(a)), cy: Math.round(bCY + 72 * Math.sin(a)) };
    });

    // Spur gear path — M7 Z24 PA20°, center (415, 200)
    const gCX = 415, gCY = 200;
    const gearPath = (() => {
        const n = 24, rR = 75, rT = 91;
        const p = (2 * Math.PI) / n;
        const ht = p * 0.27, htt = p * 0.18;
        const xy = (r, a) => `${(gCX + r * Math.cos(a)).toFixed(1)},${(gCY + r * Math.sin(a)).toFixed(1)}`;
        const segs = Array.from({ length: n }, (_, i) => {
            const a = i * p - Math.PI / 2;
            return { rb: a - ht, tl: a - htt, tr: a + htt, ra: a + ht };
        });
        let d = `M ${xy(rR, segs[0].rb)}`;
        for (let i = 0; i < n; i++) {
            if (i > 0) d += ` A ${rR},${rR} 0 0,1 ${xy(rR, segs[i].rb)}`;
            d += ` L ${xy(rT, segs[i].tl)} A ${rT},${rT} 0 0,1 ${xy(rT, segs[i].tr)} L ${xy(rR, segs[i].ra)}`;
        }
        return d + ` A ${rR},${rR} 0 0,1 ${xy(rR, segs[0].rb)} Z`;
    })();

    return (
        <svg className="solyd-bearing-svg" viewBox="0 0 560 450" fill="none" xmlns="http://www.w3.org/2000/svg"
             aria-hidden="true" style={{ width: "100%", height: "auto" }}>

            <defs>
                <pattern id="bgGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path className="svg-grid-line" d="M 20 0 L 0 0 0 20" stroke="#ccd5ae" strokeWidth="0.3" fill="none"/>
                </pattern>
                <pattern id="metalHatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <line className="svg-hatch-line" x1="0" y1="0" x2="0" y2="5" stroke="#7a9055" strokeWidth="0.7" opacity="0.4"/>
                </pattern>
                <radialGradient id="ballShine" cx="32%" cy="28%" r="68%">
                    <stop offset="0%"   stopColor="#f8f4e8"/>
                    <stop offset="55%"  stopColor="#ddd0a0"/>
                    <stop offset="100%" stopColor="#a89060"/>
                </radialGradient>
            </defs>

            {/* Background */}
            <rect className="svg-bg-main" width="560" height="450" fill="#f5f0e0"/>
            <rect width="560" height="450" fill="url(#bgGrid)" opacity="0.75"/>

            {/* Title block separator */}
            <line className="svg-struct-line" x1="4" y1="391" x2="556" y2="391" strokeWidth="1.5"/>

            {/* ════════════════════════════════════
                LEFT PANEL · DGBB (scale ~0.68×)
                Center (148, 200)
            ════════════════════════════════════ */}

            {/* Center lines */}
            <line className="svg-centerline" x1="148" y1="13"  x2="148" y2="383" strokeWidth="0.9" strokeDasharray="14 4 2 4"/>
            <line className="svg-centerline" x1="13"  y1="200" x2="275" y2="200" strokeWidth="0.9" strokeDasharray="14 4 2 4"/>

            {/* Outer race (r 82–94) */}
            <circle className="svg-metal-fill" cx={bCX} cy={bCY} r="94" fill="#ddd8b8" stroke="#7a9055" strokeWidth="2"/>
            <circle cx={bCX} cy={bCY} r="94" fill="url(#metalHatch)"/>
            <circle className="svg-bore-fill" cx={bCX} cy={bCY} r="82" fill="#f5f0e0" stroke="#8a9d6a" strokeWidth="0.8"/>
            <circle className="svg-struct-line" cx={bCX} cy={bCY} r="81" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.4"/>

            {/* Cage rings */}
            <circle cx={bCX} cy={bCY} r="76" stroke="#b8a060" strokeWidth="1" strokeDasharray="5 3" opacity="0.65"/>
            <circle cx={bCX} cy={bCY} r="68" stroke="#b8a060" strokeWidth="1" strokeDasharray="5 3" opacity="0.65"/>

            {/* 12 balls */}
            {bearingBalls.map((b, i) => (
                <g key={i}>
                    <circle className="svg-ball" cx={b.cx} cy={b.cy} r="9" fill="url(#ballShine)" stroke="#7a9055" strokeWidth="1.2"/>
                    <circle cx={b.cx - 3} cy={b.cy - 3} r="2.5" fill="white" opacity="0.3"/>
                </g>
            ))}

            {/* Inner race (r 28–63) */}
            <circle className="svg-metal-fill" cx={bCX} cy={bCY} r="63" fill="#ddd8b8" stroke="#7a9055" strokeWidth="1.5"/>
            <circle cx={bCX} cy={bCY} r="63" fill="url(#metalHatch)"/>
            <circle className="svg-bore-fill" cx={bCX} cy={bCY} r="28" fill="#ede8d2" stroke="#8a9d6a" strokeWidth="1.5"/>

            {/* Bore center mark */}
            <line className="svg-struct-line" x1="140" y1="200" x2="156" y2="200" strokeWidth="1.3"/>
            <line className="svg-struct-line" x1="148" y1="192" x2="148" y2="208" strokeWidth="1.3"/>

            {/* OD Ø276 — top dimension */}
            <line x1="54"  y1="106" x2="54"  y2="44" stroke="#d4a373" strokeWidth="0.9"/>
            <line x1="242" y1="106" x2="242" y2="44" stroke="#d4a373" strokeWidth="0.9"/>
            <line x1="47"  y1="40"  x2="249" y2="40" stroke="#d4a373" strokeWidth="0.9"/>
            <polygon points="54,40  60,36  60,44"  fill="#d4a373"/>
            <polygon points="242,40 236,36 236,44" fill="#d4a373"/>
            <text x="148" y="34" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="9" fill="#d4a373" fontWeight="700">Ø 276.0 mm</text>

            {/* Bore Ø82 — left dimension */}
            <line x1="120" y1="200" x2="30"  y2="200" stroke="#d4a373" strokeWidth="0.7" opacity="0.4"/>
            <line x1="34"  y1="172" x2="34"  y2="228" stroke="#d4a373" strokeWidth="0.9"/>
            <polygon points="34,172 30,178 38,178" fill="#d4a373"/>
            <polygon points="34,228 30,222 38,222" fill="#d4a373"/>
            <text x="25" y="203" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="7.5" fill="#d4a373" fontWeight="700" transform="rotate(-90,25,203)">Ø 82 H7</text>

            {/* Callouts: 1 outer race / 2 ball / 3 cage / 4 inner race */}
            <line className="svg-struct-line" x1="224" y1="152" x2="247" y2="128" strokeWidth="0.9"/>
            <circle className="svg-callout-chip" cx="253" cy="122" r="8" fill="#e8e3cc" stroke="#8a9d6a" strokeWidth="1.2"/>
            <text className="svg-callout-text" x="253" y="126" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="8" fill="#3a4a1a" fontWeight="700">1</text>

            <line className="svg-struct-line" x1="218" y1="170" x2="244" y2="148" strokeWidth="0.9"/>
            <circle className="svg-callout-chip" cx="250" cy="142" r="8" fill="#e8e3cc" stroke="#8a9d6a" strokeWidth="1.2"/>
            <text className="svg-callout-text" x="250" y="146" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="8" fill="#3a4a1a" fontWeight="700">2</text>

            <line className="svg-struct-line" x1="220" y1="200" x2="247" y2="228" strokeWidth="0.9"/>
            <circle className="svg-callout-chip" cx="253" cy="234" r="8" fill="#e8e3cc" stroke="#8a9d6a" strokeWidth="1.2"/>
            <text className="svg-callout-text" x="253" y="238" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="8" fill="#3a4a1a" fontWeight="700">3</text>

            <line className="svg-struct-line" x1="186" y1="200" x2="247" y2="263" strokeWidth="0.9"/>
            <circle className="svg-callout-chip" cx="253" cy="269" r="8" fill="#e8e3cc" stroke="#8a9d6a" strokeWidth="1.2"/>
            <text className="svg-callout-text" x="253" y="273" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="8" fill="#3a4a1a" fontWeight="700">4</text>

            {/* IN STOCK badge */}
            <rect x="14" y="356" width="78" height="22" rx="11" fill="#d4ead4" stroke="#4a8a4a" strokeWidth="1.2"/>
            <text x="53" y="371" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="8.5" fill="#2a5a2a" fontWeight="700">IN STOCK</text>

            {/* ════════════════════════════════════
                RIGHT PANEL · SPUR GEAR M7 Z24 PA20°
                Center (415, 200)
            ════════════════════════════════════ */}

            {/* Center lines */}
            <line className="svg-centerline" x1="415" y1="13"  x2="415" y2="383" strokeWidth="0.9" strokeDasharray="14 4 2 4"/>
            <line className="svg-centerline" x1="286" y1="200" x2="552" y2="200" strokeWidth="0.9" strokeDasharray="14 4 2 4"/>

            {/* Gear body (full disc with teeth) */}
            <path className="svg-metal-fill" d={gearPath} fill="#ddd8b8" stroke="#7a9055" strokeWidth="1.5"/>
            <path d={gearPath} fill="url(#metalHatch)"/>

            {/* Pitch circle — dashed accent */}
            <circle cx={gCX} cy={gCY} r="84" stroke="#d4a373" strokeWidth="0.8" strokeDasharray="7 3" opacity="0.75"/>

            {/* Hub boundary ring */}
            <circle className="svg-struct-line" cx={gCX} cy={gCY} r="38" strokeWidth="1.2" fill="none"/>

            {/* Bore */}
            <circle className="svg-bore-fill" cx={gCX} cy={gCY} r="21" fill="#ede8d2" stroke="#8a9d6a" strokeWidth="1.5"/>

            {/* Keyway at 12 o'clock */}
            <rect className="svg-bore-fill" x="409" y="172" width="12" height="8" rx="1" fill="#ede8d2" stroke="#8a9d6a" strokeWidth="0.9"/>

            {/* Bore center mark */}
            <line className="svg-struct-line" x1="407" y1="200" x2="423" y2="200" strokeWidth="1.3"/>
            <line className="svg-struct-line" x1="415" y1="192" x2="415" y2="208" strokeWidth="1.3"/>

            {/* OD Ø182 — top dimension */}
            <line x1="324" y1="109" x2="324" y2="44" stroke="#d4a373" strokeWidth="0.9"/>
            <line x1="506" y1="109" x2="506" y2="44" stroke="#d4a373" strokeWidth="0.9"/>
            <line x1="317" y1="40"  x2="513" y2="40" stroke="#d4a373" strokeWidth="0.9"/>
            <polygon points="324,40 330,36 330,44"  fill="#d4a373"/>
            <polygon points="506,40 500,36 500,44"  fill="#d4a373"/>
            <text x="415" y="34" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="9" fill="#d4a373" fontWeight="700">Ø 182.0 mm</text>

            {/* Bore Ø42 — right dimension */}
            <line x1="436" y1="200" x2="534" y2="200" stroke="#d4a373" strokeWidth="0.7" opacity="0.4"/>
            <line x1="530" y1="179" x2="530" y2="221" stroke="#d4a373" strokeWidth="0.9"/>
            <polygon points="530,179 526,185 534,185" fill="#d4a373"/>
            <polygon points="530,221 526,215 534,215" fill="#d4a373"/>
            <text x="540" y="203" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="7.5" fill="#d4a373" fontWeight="700" transform="rotate(-90,540,203)">Ø 42 H7</text>

            {/* PCD dashed leader */}
            <line x1="415" y1="117" x2="456" y2="78" stroke="#d4a373" strokeWidth="0.7" strokeDasharray="3 2"/>
            <text x="460" y="76" fontFamily="'IBM Plex Mono',monospace" fontSize="7.5" fill="#d4a373" fontWeight="700">PCD</text>
            <text className="svg-text-accent" x="460" y="87" fontFamily="'IBM Plex Mono',monospace" fontSize="7" fill="#a0845c">Ø 168 mm</text>

            {/* Gear spec callout */}
            <line className="svg-struct-line" x1="500" y1="160" x2="524" y2="140" strokeWidth="0.9"/>
            <rect className="svg-spec-chip" x="524" y="118" width="30" height="50" rx="2" fill="#f0ead0" stroke="#ccd5ae" strokeWidth="1"/>
            <text className="svg-text-secondary" x="539" y="131" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="7.5" fill="#7a6030" fontWeight="700">m = 7</text>
            <text className="svg-text-primary"   x="539" y="143" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="7.5" fill="#3a4a1a" fontWeight="700">z = 24</text>
            <text className="svg-text-secondary" x="539" y="155" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="7.5" fill="#4a5a2a">PA20°</text>
            <text className="svg-text-muted"     x="539" y="164" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="6.5" fill="#8a9d6a">DIN3960</text>

            {/* ══ TITLE BLOCK ══ */}
            <rect className="svg-title-bg" x="4" y="391" width="552" height="55" fill="#ede8d0"/>
            <line className="svg-title-line" x1="220" y1="391" x2="220" y2="446" strokeWidth="0.8"/>
            <line className="svg-title-line" x1="400" y1="391" x2="400" y2="446" strokeWidth="0.8"/>
            <line className="svg-title-line" x1="460" y1="391" x2="460" y2="446" strokeWidth="0.8"/>
            <line className="svg-title-line" x1="220" y1="418" x2="556" y2="418" strokeWidth="0.5"/>

            {/* Col 1: Bearing info */}
            <text className="svg-text-primary"   x="112" y="405" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="8"   fill="#3a4a1a" fontWeight="700">DEEP GROOVE BALL BEARING</text>
            <text className="svg-text-secondary" x="112" y="416" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="7"   fill="#6a7a4a">Ø276 × Ø82 × B48 · CLASS P6</text>
            <text className="svg-text-accent"    x="112" y="428" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="6.5" fill="#a0845c">SLY-DGBB-276/82-P6</text>
            <text className="svg-text-muted"     x="112" y="440" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="6"   fill="#8a9d6a">DIN 625 TYPE · AISI 52100 HRC 60</text>

            {/* Col 2: Gear info */}
            <text className="svg-text-primary"   x="310" y="405" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="8"   fill="#3a4a1a" fontWeight="700">SPUR GEAR M7 Z24 PA20°</text>
            <text className="svg-text-secondary" x="310" y="416" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="7"   fill="#6a7a4a">OD Ø182 · BORE Ø42 H7 · PCD Ø168</text>
            <text className="svg-text-accent"    x="310" y="428" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="6.5" fill="#a0845c">SLY-GR-M7-Z24-PA20</text>
            <text className="svg-text-muted"     x="310" y="440" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="6"   fill="#8a9d6a">DIN 3960 · 16MnCr5 CASE HARD.</text>

            {/* Col 3: Scale */}
            <text className="svg-text-muted"    x="404" y="407" fontFamily="'IBM Plex Mono',monospace" fontSize="6.5" fill="#8a9d6a">SCALE</text>
            <text className="svg-text-primary"  x="404" y="417" fontFamily="'IBM Plex Mono',monospace" fontSize="11"  fill="#3a4a1a" fontWeight="700">1 : 2</text>
            <text className="svg-text-muted"    x="404" y="429" fontFamily="'IBM Plex Mono',monospace" fontSize="6.5" fill="#8a9d6a">UNIT: mm</text>

            {/* Col 4: Attribution */}
            <text className="svg-text-muted"      x="465" y="407" fontFamily="'IBM Plex Mono',monospace" fontSize="6.5" fill="#8a9d6a">DRAWN BY</text>
            <text className="svg-text-primary"    x="465" y="418" fontFamily="'IBM Plex Mono',monospace" fontSize="9"   fill="#3a4a1a" fontWeight="700">SolydShop</text>
            <text className="svg-text-accent"     x="465" y="429" fontFamily="'IBM Plex Mono',monospace" fontSize="6.5" fill="#a0845c">ENG DEPT.</text>
            <text className="svg-text-muted"      x="465" y="440" fontFamily="'IBM Plex Mono',monospace" fontSize="6"   fill="#8a9d6a">REV B · 2026-06</text>
        </svg>
    );
};

/* ── Skeleton card ───────────────────────────────────────────────────── */
const SkeletonCard = () => (
    <div className="rounded overflow-hidden animate-pulse flex flex-col" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div style={{ height: "128px", background: "var(--surface-high)", borderBottom: "1px solid var(--border)", flexShrink: 0 }} />
        <div style={{ padding: "10px 11px 11px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div className="h-3 rounded w-4/5"  style={{ background: "var(--surface-high)" }} />
            <div className="h-2.5 rounded w-2/5" style={{ background: "var(--surface-high)" }} />
            <div style={{ flex: 1, minHeight: "16px" }} />
            <div className="h-px w-full" style={{ background: "var(--border-subtle)", margin: "4px 0" }} />
            <div className="h-3 rounded w-3/5"  style={{ background: "var(--surface-high)" }} />
            <div className="h-8 rounded mt-1"   style={{ background: "var(--surface-high)" }} />
        </div>
    </div>
);

/* ── Main component ──────────────────────────────────────────────────── */
const HomePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { products, loading } = useSelector((s) => s.product);
    const { user }              = useSelector((s) => s.auth);
    const wishlistItems         = useSelector((s) => s.wishlist.items);
    const wishlistedIds         = new Set(wishlistItems.map((i) => i.productId));

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
    const [hasLoaded,        setHasLoaded]        = useState(false);
    const [sortOrder,        setSortOrder]        = useState("default");

    const modalRef            = useRef(null);
    const quickViewTriggerRef = useRef(null);
    const catalogRef          = useRef(null);

    /* ── Fetchers ────────────────────────────────────────────────────── */
    const fetchCategories = async () => {
        try {
            const res = await api.get("/public/categories?pageSize=1000");
            setCategories(res.data.content);
        } catch { }
    };

    const fetchProducts = async (
        kw      = keyword,
        catId   = categoryId,
        max     = priceMax,
        page    = pageNumber,
        inStock = inStockOnly,
    ) => {
        dispatch(fetchProductsStart());
        setProductError(null);
        try {
            let url = `/public/products?pageNumber=${page}&pageSize=8&`;
            if (kw.trim())    url += `keyword=${encodeURIComponent(kw)}&`;
            if (catId)        url += `categoryId=${catId}&`;
            if (max < 100000) url += `maxPrice=${max}&`;
            if (inStock)      url += `inStock=true&`;
            const res = await api.get(url);
            dispatch(fetchProductsSuccess(res.data.content ?? []));
            setTotalPages(res.data.totalPages ?? 1);
        } catch (e) {
            dispatch(fetchProductsFailure(e.message));
            setProductError("Failed to load products. Check your connection and try again.");
        } finally {
            setHasLoaded(true);
        }
    };

    const fetchCart = async () => {
        if (!user?.userId) return;
        try {
            const res = await api.get(`/cart/${user.userId}`);
            setCart(res.data);
            const items = res.data?.items ?? [];
            dispatch(setCartCount(items.reduce((s, i) => s + i.quantity, 0)));
        } catch { }
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

    /* ── Quick View focus trap ───────────────────────────────────────── */
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

    /* ── Cart actions ────────────────────────────────────────────────── */
    const handleAddToCart = async (productId) => {
        if (!user) { toast.error("Please login to add items to cart"); return; }
        setCartBusy(true);
        try {
            await api.post(
                `/cart/${user.userId}/items`,
                { productId, quantity: 1 },
                { headers: { "X-XSRF-TOKEN": getXsrfToken() } },
            );
            toast.success("Added to cart");
            await fetchCart();
        } catch { }
        finally { setCartBusy(false); }
    };

    const handleRemoveFromCart = async (productId) => {
        if (!user) return;
        setCartBusy(true);
        try {
            await api.delete(
                `/cart/${user.userId}/items/${productId}`,
                { headers: { "X-XSRF-TOKEN": getXsrfToken() } },
            );
            await fetchCart();
        } catch { }
        finally { setCartBusy(false); }
    };

    const handleWishlistToggle = async (product) => {
        if (!user) { toast.error("Please login to save items"); return; }
        const isWishlisted = wishlistedIds.has(product.productId);

        if (isWishlisted) {
            dispatch(optimisticRemoveItem(product.productId));
            toast("Removed from wishlist");
            try {
                const res = await api.delete(`/wishlist/items/${product.productId}`);
                dispatch(setWishlistItems(res.data));
            } catch {
                dispatch(setWishlistItems(wishlistItems));
                toast.error("Could not update wishlist");
            }
        } else {
            dispatch(optimisticAddItem({
                productId:    product.productId,
                productName:  product.productName,
                price:        product.price,
                imageUrl:     product.imageUrl,
                quantity:     product.quantity,
                categoryName: product.categoryName ?? null,
            }));
            toast.success("Added to wishlist");
            try {
                const res = await api.post(
                    `/wishlist/items/${product.productId}`,
                    {},
                    { headers: { "X-XSRF-TOKEN": getXsrfToken() } },
                );
                dispatch(setWishlistItems(res.data));
            } catch {
                dispatch(setWishlistItems(wishlistItems));
                toast.error("Could not update wishlist");
            }
        }
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
        catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    /* ── Body scroll-lock for mobile filter drawer ───────────────────── */
    useEffect(() => {
        if (filtersOpen) document.body.style.overflow = "hidden";
        else             document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [filtersOpen]);

    /* ── Derived ─────────────────────────────────────────────────────── */
    const cartItems        = cart?.items ?? [];
    const cartTotal        = Number(cart?.totalPrice ?? 0);
    const itemCount        = cartItems.reduce((s, i) => s + i.quantity, 0);
    const activeFilterCount = [priceMax < 100000, inStockOnly].filter(Boolean).length;
    const hasAnyFilter      = categoryId !== "" || priceMax < 100000 || inStockOnly;
    const displayProducts   = useMemo(() => {
        if (!products?.length) return [];
        if (sortOrder === "price-asc")  return [...products].sort((a, b) => a.price - b.price);
        if (sortOrder === "price-desc") return [...products].sort((a, b) => b.price - a.price);
        if (sortOrder === "name-asc")   return [...products].sort((a, b) => a.productName.localeCompare(b.productName));
        return products;
    }, [products, sortOrder]);

    /* ═══════════════════════════════════════════════════════════════════
       RENDER
    ═══════════════════════════════════════════════════════════════════ */
    return (
        <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)" }}>

            {/* ══════════════════════════════════════════
                HERO — warm sand + blueprint grid
            ══════════════════════════════════════════ */}
            <section className="solyd-hero" style={{ background: "var(--surface)", backgroundImage: HERO_GRID, borderBottom: "1px solid var(--border)" }}>
                <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 lg:py-20 flex flex-col gap-10">

                    {/* Hero search — full width at top */}
                    <div className="flex items-center rounded overflow-hidden" style={{ background: "var(--surface-high)", border: "1px solid var(--border-strong)", maxWidth: "720px" }}>
                        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                            <HiSearch
                                aria-hidden="true"
                                size={16}
                                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }}
                            />
                            <input
                                type="text"
                                placeholder="Search parts, SKU, model number…"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                                className="w-full focus:outline-none"
                                style={{ background: "transparent", border: "none", color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: "13px", padding: "13px 36px 13px 42px", height: "52px" }}
                            />
                            {keyword && (
                                <button
                                    aria-label="Clear search"
                                    onClick={() => setKeyword("")}
                                    style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", display: "flex", alignItems: "center" }}
                                >
                                    <HiX aria-hidden="true" size={13} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                            style={{ background: "var(--accent)", color: "var(--text)", border: "none", padding: "0 24px", height: "52px", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", flexShrink: 0, transition: "opacity var(--duration-fast)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                        >
                            Search
                        </button>
                    </div>

                    {/* Headline + illustration grid */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_440px] lg:grid-cols-[1fr_560px] xl:grid-cols-[1fr_680px] gap-10 lg:gap-12 items-center">

                    {/* Left: headline + CTAs + stats */}
                    <div>
                        {/* Eyebrow label */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                            <span className="animate-pulse" style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)" }}>
                                Verified B2B Industrial Marketplace
                            </span>
                        </div>

                        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.25rem, 4vw, 3.25rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.05, color: "var(--text)", margin: 0, textWrap: "balance" }}>
                            The Global Marketplace<br className="hidden sm:block" /> for Industrial Parts.
                        </h1>

                        <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "var(--text-2)", marginTop: "20px", lineHeight: 1.65, maxWidth: "48ch" }}>
                            Buy and sell heavy machinery components worldwide. Verified sellers, OEM-grade parts, and fast international shipping — all on one platform.
                        </p>

                        <div className="flex flex-wrap gap-3 items-center" style={{ marginTop: "28px" }}>
                            <button
                                onClick={() => catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                                style={{ background: "var(--accent)", color: "var(--text)", border: "none", borderRadius: "var(--r-md)", padding: "12px 28px", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", transition: "opacity var(--duration-fast)", display: "flex", alignItems: "center", gap: "8px" }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                            >
                                <HiArrowRight style={{ fontSize: "15px" }} />
                                Browse Parts
                            </button>
                            {user && !user.roles?.includes("ROLE_ADMIN") && !user.roles?.includes("ROLE_SELLER") && (
                                <button
                                    onClick={() => navigate("/wishlist")}
                                    style={{ background: "transparent", color: "var(--text)", border: "1px solid var(--border-strong)", borderRadius: "var(--r-md)", padding: "12px 28px", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", transition: "border-color var(--duration-fast)", display: "flex", alignItems: "center", gap: "8px" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
                                >
                                    <FaHeart style={{ fontSize: "13px", color: "var(--accent)" }} />
                                    My Wishlist
                                </button>
                            )}
                            {!user && (
                                <button
                                    onClick={() => navigate("/register")}
                                    style={{ background: "transparent", color: "var(--text)", border: "1px solid var(--border-strong)", borderRadius: "var(--r-md)", padding: "12px 28px", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", transition: "border-color var(--duration-fast)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
                                >
                                    Get Started
                                </button>
                            )}
                        </div>


                        {/* Stats row */}
                        <div className="flex flex-wrap gap-6 mt-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                            {[
                                { num: "24K+",  label: "Parts Listed"      },
                                { num: "150+",  label: "Countries Served"  },
                                { num: "48h",   label: "Avg. Dispatch"     },
                                { num: "ISO",   label: "9001 Verified"     },
                            ].map(({ num, label }) => (
                                <div key={label}>
                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>{num}</div>
                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginTop: "2px" }}>{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: industrial bearing illustration */}
                    <div className="flex items-center justify-center" style={{ opacity: 0.9 }}>
                        <BearingIllustration />
                    </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                CATEGORY STRIP
            ══════════════════════════════════════════ */}
            <section style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10" style={{ paddingTop: "12px", paddingBottom: "12px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: "var(--text-3)", textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0 }}>
                        CATEGORY
                    </span>
                    <div style={{ width: "1px", height: "16px", background: "var(--border)", flexShrink: 0 }} />
                    <div style={{ display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none", flexWrap: "nowrap", flex: 1, minWidth: 0, paddingRight: "4px" }}>
                        <button
                            onClick={() => setCategoryId("")}
                            style={{
                                background:   categoryId === "" ? "var(--accent)" : "transparent",
                                color:        categoryId === "" ? "var(--text)"   : "var(--text-3)",
                                border:       "1px solid",
                                borderColor:  categoryId === "" ? "var(--accent)" : "var(--border-mid)",
                                borderRadius: "var(--r-pill)",
                                padding:      "4px 14px",
                                fontFamily:   "var(--font-mono)",
                                fontSize:     "11px",
                                letterSpacing: "0.04em",
                                cursor:       "pointer",
                                whiteSpace:   "nowrap",
                                flexShrink:   0,
                                transition:   "all var(--duration-fast)",
                            }}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.categoryId}
                                onClick={() => handleCategoryToggle(cat.categoryId)}
                                style={{
                                    background:   String(cat.categoryId) === categoryId ? "var(--accent)" : "transparent",
                                    color:        String(cat.categoryId) === categoryId ? "var(--text)"   : "var(--text-3)",
                                    border:       "1px solid",
                                    borderColor:  String(cat.categoryId) === categoryId ? "var(--accent)" : "var(--border-mid)",
                                    borderRadius: "var(--r-pill)",
                                    padding:      "4px 14px",
                                    fontFamily:   "var(--font-mono)",
                                    fontSize:     "11px",
                                    letterSpacing: "0.04em",
                                    cursor:       "pointer",
                                    whiteSpace:   "nowrap",
                                    flexShrink:   0,
                                    transition:   "all var(--duration-fast)",
                                }}
                            >
                                {cat.categoryName}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                MAIN 3-COLUMN: filters | products | cart
            ══════════════════════════════════════════ */}
            <main ref={catalogRef} className="flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-12 gap-6 py-6">

                {/* Mobile filter toggle */}
                <div className="col-span-12 lg:hidden flex items-center gap-2">
                    <button
                        onClick={() => setFiltersOpen(true)}
                        aria-expanded={filtersOpen}
                        aria-controls="filters-aside"
                        aria-label={hasAnyFilter ? "Filters (active)" : "Filters"}
                        className="flex-1 py-3 rounded font-bold text-sm flex items-center justify-center gap-2 min-h-[44px]"
                        style={{ background: "var(--surface-high)", border: hasAnyFilter ? "1px solid var(--accent)" : "1px solid var(--border)", color: "var(--text)" }}
                    >
                        <HiAdjustments aria-hidden="true" size={16} />
                        Filters
                        {hasAnyFilter && (
                            <span
                                aria-hidden="true"
                                style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--accent)", flexShrink: 0, display: "inline-block" }}
                            />
                        )}
                    </button>
                    {hasAnyFilter && (
                        <button
                            onClick={handleReset}
                            className="py-3 px-4 rounded text-xs font-bold min-h-[44px]"
                            style={{ border: "1px solid var(--border)", color: "var(--text-2)", background: "transparent", cursor: "pointer" }}
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* ── LEFT: Filter sidebar ───────────────────────── */}
                <aside
                    id="filters-aside"
                    aria-label="Product filters"
                    className={[
                        "flex flex-col overflow-hidden",
                        "fixed top-0 left-0 h-screen z-[500] w-[min(320px,85vw)]",
                        filtersOpen ? "translate-x-0" : "-translate-x-full",
                        "lg:sticky lg:top-24 lg:h-[calc(100vh-112px)] lg:w-auto lg:z-auto lg:translate-x-0 lg:col-span-3 lg:rounded",
                    ].join(" ")}
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", transition: "transform var(--duration-mid) var(--ease-out-quart)" }}
                    onKeyDown={(e) => { if (e.key === "Escape") setFiltersOpen(false); }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ background: "var(--surface-high)", borderBottom: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-2">
                            <HiAdjustments aria-hidden="true" size={14} style={{ color: "var(--text-3)" }} />
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text)" }}>Buying Filters</span>
                        </div>
                        <button onClick={() => setFiltersOpen(false)} className="lg:hidden w-7 h-7 flex items-center justify-center rounded" aria-label="Close filters" style={{ color: "var(--text-3)", border: "1px solid var(--border)", background: "none", cursor: "pointer" }}>
                            <HiX aria-hidden="true" size={13} />
                        </button>
                    </div>

                    {/* Scrollable body */}
                    <div className="flex-grow overflow-y-auto p-4 space-y-5" style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" }}>

                        {/* Category */}
                        <div>
                            <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "8px" }}>
                                Category
                            </p>
                            <div className="space-y-0.5">
                                <label
                                    className="flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer"
                                    style={{ color: categoryId === "" ? "var(--text)" : "var(--text-2)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    <input type="checkbox" checked={categoryId === ""} onChange={() => setCategoryId("")} style={{ accentColor: "var(--accent)" }} />
                                    All Categories
                                </label>
                                {categories.map((cat) => (
                                    <label
                                        key={cat.categoryId}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer"
                                        style={{ color: categoryId === String(cat.categoryId) ? "var(--text)" : "var(--text-2)" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <input type="checkbox" checked={categoryId === String(cat.categoryId)} onChange={() => handleCategoryToggle(cat.categoryId)} style={{ accentColor: "var(--accent)" }} />
                                        {cat.categoryName}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price range */}
                        <div style={{ paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <label htmlFor="price-range" style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)" }}>
                                    Price Range (USD)
                                </label>
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--accent)" }}>
                                    {fmtCurrency(priceMax)}+
                                </span>
                            </div>
                            <input
                                id="price-range"
                                type="range"
                                min={0}
                                max={100000}
                                value={priceMax}
                                onChange={(e) => setPriceMax(Number(e.target.value))}
                                aria-valuetext={`Up to ${fmtCurrency(priceMax)}`}
                                className="w-full h-1 cursor-pointer"
                                style={{ accentColor: "var(--accent)", background: "var(--border-mid)" }}
                            />
                            <div className="flex justify-between mt-1" style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-4)" }}>
                                <span>$0</span>
                                <span>$100K</span>
                            </div>
                        </div>

                        {/* Availability */}
                        <div style={{ paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
                            <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "10px" }}>
                                Availability
                            </p>
                            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                                <div
                                    role="switch"
                                    aria-checked={inStockOnly}
                                    onClick={() => setInStockOnly((v) => !v)}
                                    style={{ width: "36px", height: "20px", borderRadius: "var(--r-pill)", background: inStockOnly ? "var(--accent)" : "var(--surface-high)", border: "1px solid", borderColor: inStockOnly ? "var(--accent)" : "var(--border)", position: "relative", cursor: "pointer", transition: "background var(--duration-fast)", flexShrink: 0 }}
                                >
                                    <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#fff", position: "absolute", top: "2px", left: inStockOnly ? "18px" : "2px", transition: "left var(--duration-fast)" }} />
                                </div>
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-2)", letterSpacing: "0.04em" }}>In Stock Only</span>
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-2 p-4 flex-shrink-0" style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
                        <button
                            onClick={() => { setPageNumber(0); fetchProducts(keyword, categoryId, priceMax, 0, inStockOnly); setFiltersOpen(false); }}
                            className="flex-1 py-2.5 rounded font-bold text-xs min-h-[44px]"
                            style={{ background: "var(--accent)", color: "var(--text)", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={() => { handleReset(); setFiltersOpen(false); }}
                            className="px-4 py-2.5 rounded font-bold text-xs min-h-[44px]"
                            style={{ border: "1px solid var(--border)", color: "var(--text-2)", background: "transparent", cursor: "pointer" }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}
                        >
                            Reset
                        </button>
                    </div>
                </aside>

                {/* ── CENTER: Product grid ────────────────────────── */}
                <section className="col-span-12 lg:col-span-6 flex flex-col">
                    {/* Header */}
                    <div className="mb-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                                    Procurement Catalog
                                </h2>
                                <div aria-live="polite" aria-atomic="true" style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-4)", marginTop: "3px" }}>
                                    {hasLoaded && !loading && !productError && `${displayProducts.length} PARTS AVAILABLE`}
                                </div>
                            </div>
                            {hasAnyFilter && (
                                <button
                                    onClick={handleReset}
                                    className="hidden lg:flex items-center gap-1"
                                    style={{ background: "none", border: "none", color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", padding: "4px 0", transition: "color var(--duration-fast)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--error)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
                                >
                                    <HiX size={9} aria-hidden="true" /> Clear filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search + Sort toolbar */}
                    <div className="flex mb-4 rounded overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
                        {/* Search field */}
                        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                            <HiSearch
                                aria-hidden="true"
                                size={13}
                                style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }}
                            />
                            <input
                                type="text"
                                placeholder="Search parts, SKU, model…"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="w-full focus:outline-none"
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "var(--text)",
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "12px",
                                    padding: "9px 28px 9px 32px",
                                    height: "38px",
                                }}
                            />
                            {keyword && (
                                <button
                                    aria-label="Clear search"
                                    onClick={() => setKeyword("")}
                                    style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", display: "flex", alignItems: "center" }}
                                >
                                    <HiX aria-hidden="true" size={12} />
                                </button>
                            )}
                        </div>
                        {/* Divider */}
                        <div style={{ width: "1px", background: "var(--border)", flexShrink: 0, alignSelf: "stretch", margin: "6px 0" }} />
                        {/* Sort select */}
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            aria-label="Sort products"
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "var(--text-2)",
                                fontFamily: "var(--font-mono)",
                                fontSize: "11px",
                                padding: "9px 28px 9px 10px",
                                cursor: "pointer",
                                outline: "none",
                                flexShrink: 0,
                                minWidth: "130px",
                                appearance: "none",
                                backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6'><path d='M 0 0 L 5 6 L 10 0' fill='none' stroke='%2394A3B8' stroke-width='1.5'/></svg>")`,
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "right 10px center",
                            }}
                        >
                            <option value="default">Relevance</option>
                            <option value="price-asc">Price: Low → High</option>
                            <option value="price-desc">Price: High → Low</option>
                            <option value="name-asc">Name A–Z</option>
                        </select>
                    </div>

                    {loading || !hasLoaded ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : productError ? (
                        <div className="py-20 text-center">
                            <p className="mb-4" style={{ color: "var(--error)" }}>{productError}</p>
                            <button onClick={() => fetchProducts()} className="px-5 py-2 rounded text-sm font-bold min-h-[44px]" style={{ background: "var(--accent)", color: "var(--text)", border: "none", cursor: "pointer" }}>
                                Try again
                            </button>
                        </div>
                    ) : displayProducts.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-lg mb-2" style={{ color: "var(--text-2)" }}>No products found</p>
                            <p className="text-sm" style={{ color: "var(--text-3)" }}>Try adjusting your filters</p>
                        </div>
                    ) : (
                        <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {displayProducts.map((product) => (
                                <article
                                    key={product.productId}
                                    className="rounded overflow-hidden flex flex-col group"
                                    style={{
                                        background: "var(--surface)",
                                        border: "1px solid var(--border)",
                                        transition: `border-color var(--duration-mid) var(--ease-out-quart)`,
                                        height: "100%",
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-border)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                                >
                                    {/* ── Image zone ── */}
                                    <div
                                        className="relative overflow-hidden flex-shrink-0"
                                        style={{ height: "168px", background: "#ffffff", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                                        onClick={(e) => openQuickView(e, product)}
                                    >
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.productName}
                                                loading="lazy"
                                                className="w-full h-full object-contain transition-transform duration-[220ms] motion-reduce:transition-none group-hover:scale-[1.04]"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-4)" }} aria-hidden="true">
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                                                    <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                                                </svg>
                                            </div>
                                        )}

                                        {/* Badge row */}
                                        <div className="absolute top-0 left-0 right-0 flex justify-between items-start z-10" style={{ padding: "6px" }}>
                                            <span style={{
                                                fontFamily: "var(--font-mono)",
                                                fontSize: "9px",
                                                fontWeight: 700,
                                                letterSpacing: "0.05em",
                                                background: "oklch(0.12 0.03 252 / 0.70)",
                                                backdropFilter: "blur(6px)",
                                                WebkitBackdropFilter: "blur(6px)",
                                                color: "rgba(255,255,255,0.92)",
                                                borderRadius: "var(--r-xs)",
                                                padding: "2px 6px",
                                                lineHeight: "1.4",
                                            }}>
                                                {product.modelNumber || "PART"}
                                            </span>
                                            {product.quantity > 0 ? (
                                                <span style={{
                                                    fontFamily: "var(--font-mono)",
                                                    fontSize: "9px",
                                                    fontWeight: 700,
                                                    letterSpacing: "0.04em",
                                                    background: "var(--success-subtle)",
                                                    color: "var(--success)",
                                                    border: "1px solid var(--success)",
                                                    borderRadius: "var(--r-xs)",
                                                    padding: "2px 6px",
                                                    lineHeight: "1.4",
                                                }}>IN STOCK</span>
                                            ) : (
                                                <span style={{
                                                    fontFamily: "var(--font-mono)",
                                                    fontSize: "9px",
                                                    fontWeight: 700,
                                                    letterSpacing: "0.04em",
                                                    background: "var(--error-subtle)",
                                                    color: "var(--error)",
                                                    border: "1px solid var(--error)",
                                                    borderRadius: "var(--r-xs)",
                                                    padding: "2px 6px",
                                                    lineHeight: "1.4",
                                                }}>OUT</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* ── Info zone ── */}
                                    <div className="flex flex-col flex-grow" style={{ padding: "10px 11px 11px" }}>

                                        {/* Product name */}
                                        <h3 className="line-clamp-2" style={{
                                            fontFamily: "var(--font-display)",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: "var(--text)",
                                            margin: "0 0 5px",
                                            lineHeight: 1.35,
                                            letterSpacing: "-0.01em",
                                        }}>
                                            <Link
                                                to={`/products/${product.productId}`}
                                                style={{ color: "var(--text)", textDecoration: "none", transition: "color var(--duration-fast)" }}
                                                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text)")}
                                            >
                                                {product.productName}
                                            </Link>
                                        </h3>

                                        {/* Part number — inline mono label */}
                                        {product.partNumber ? (
                                            <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "10px", lineHeight: 1.3, color: "var(--text-4)" }}>
                                                <span style={{ fontWeight: 700, letterSpacing: "0.06em", fontSize: "8.5px", textTransform: "uppercase" }}>Part #&thinsp;</span>
                                                <span style={{ color: "var(--text-3)", letterSpacing: "0.02em" }}>{product.partNumber}</span>
                                            </p>
                                        ) : (
                                            <p style={{ margin: 0, height: "13px" }} /> /* height stub keeps layout consistent */
                                        )}

                                        {/* Spacer — pushes price block to card bottom */}
                                        <div style={{ flex: 1, minHeight: "8px" }} />

                                        {/* Price + CTA */}
                                        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
                                            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "7px" }}>
                                                <span style={{
                                                    fontFamily: "var(--font-mono)",
                                                    fontSize: "8.5px",
                                                    fontWeight: 700,
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.08em",
                                                    color: "var(--text-4)",
                                                }}>Unit Price</span>
                                                <span style={{
                                                    fontFamily: "var(--font-mono)",
                                                    fontSize: "14px",
                                                    fontWeight: 700,
                                                    color: "var(--text)",
                                                    letterSpacing: "-0.02em",
                                                }}>
                                                    {fmtCurrency(product.price)}
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", gap: "5px" }}>
                                                {/* Wishlist */}
                                                <button
                                                    onClick={() => handleWishlistToggle(product)}
                                                    title={wishlistedIds.has(product.productId) ? "Remove from wishlist" : "Add to wishlist"}
                                                    aria-label={wishlistedIds.has(product.productId) ? "Remove from wishlist" : "Add to wishlist"}
                                                    style={{
                                                        flex: 1,
                                                        minHeight: "32px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        background: "var(--surface-mid)",
                                                        border: `1px solid ${wishlistedIds.has(product.productId) ? "var(--error)" : "var(--border)"}`,
                                                        borderRadius: "var(--r-md)",
                                                        color: wishlistedIds.has(product.productId) ? "var(--error)" : "var(--text-3)",
                                                        cursor: "pointer",
                                                        transition: "border-color var(--duration-fast), color var(--duration-fast)",
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--error)"; e.currentTarget.style.color = "var(--error)"; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = wishlistedIds.has(product.productId) ? "var(--error)" : "var(--border)"; e.currentTarget.style.color = wishlistedIds.has(product.productId) ? "var(--error)" : "var(--text-3)"; }}
                                                >
                                                    {wishlistedIds.has(product.productId) ? <FaHeart size={11} /> : <FaRegHeart size={11} />}
                                                </button>

                                                {/* Quick View */}
                                                <button
                                                    onClick={(e) => openQuickView(e, product)}
                                                    title="Quick view"
                                                    aria-label="Quick view"
                                                    style={{
                                                        flex: 1,
                                                        minHeight: "32px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        background: "var(--surface-mid)",
                                                        border: "1px solid var(--border)",
                                                        borderRadius: "var(--r-md)",
                                                        color: "var(--text-3)",
                                                        cursor: "pointer",
                                                        transition: "border-color var(--duration-fast), color var(--duration-fast)",
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.color = "var(--accent)"; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-3)"; }}
                                                >
                                                    <FaEye size={11} />
                                                </button>

                                                {/* Add to Cart */}
                                                <button
                                                    disabled={product.quantity === 0 || cartBusy}
                                                    onClick={() => handleAddToCart(product.productId)}
                                                    title={product.quantity === 0 ? "Out of stock" : "Add to cart"}
                                                    aria-label="Add to cart"
                                                    className="disabled:opacity-40"
                                                    style={{
                                                        flex: 2,
                                                        minHeight: "32px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        gap: "5px",
                                                        background: product.quantity === 0 ? "var(--surface-high)" : "var(--accent)",
                                                        color: product.quantity === 0 ? "var(--text-3)" : "oklch(0.15 0.02 63)",
                                                        border: "none",
                                                        borderRadius: "var(--r-md)",
                                                        fontFamily: "var(--font-mono)",
                                                        fontSize: "10px",
                                                        fontWeight: 700,
                                                        letterSpacing: "0.06em",
                                                        textTransform: "uppercase",
                                                        cursor: product.quantity === 0 ? "not-allowed" : "pointer",
                                                        transition: "opacity var(--duration-fast)",
                                                    }}
                                                    onMouseEnter={(e) => { if (product.quantity > 0) e.currentTarget.style.opacity = "0.88"; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                                                >
                                                    <FaShoppingCart aria-hidden="true" size={9} />
                                                    {product.quantity === 0 ? "Out" : "Add"}
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
                                <button
                                    onClick={() => handlePageChange(pageNumber - 1)}
                                    disabled={pageNumber === 0 || loading}
                                    style={{ padding: "8px 16px", background: "var(--surface-mid)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", color: pageNumber === 0 ? "var(--text-4)" : "var(--text-2)", fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 600, cursor: pageNumber === 0 ? "not-allowed" : "pointer", transition: "border-color var(--duration-fast)" }}
                                    onMouseEnter={(e) => { if (pageNumber > 0) e.currentTarget.style.borderColor = "var(--accent)"; }}
                                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                                >
                                    ← Prev
                                </button>
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-3)" }}>
                                    {pageNumber + 1} / {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pageNumber + 1)}
                                    disabled={pageNumber >= totalPages - 1 || loading}
                                    style={{ padding: "8px 16px", background: "var(--surface-mid)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", color: pageNumber >= totalPages - 1 ? "var(--text-4)" : "var(--text-2)", fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 600, cursor: pageNumber >= totalPages - 1 ? "not-allowed" : "pointer", transition: "border-color var(--duration-fast)" }}
                                    onMouseEnter={(e) => { if (pageNumber < totalPages - 1) e.currentTarget.style.borderColor = "var(--accent)"; }}
                                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                        </>
                    )}
                </section>

                {/* ── RIGHT: Mini-cart ────────────────────────────── */}
                <aside className="col-span-12 lg:col-span-3">
                    <div
                        className="rounded overflow-hidden flex flex-col lg:sticky lg:top-24 lg:max-h-[calc(100vh-112px)]"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ background: "var(--surface-high)", borderBottom: "1px solid var(--border)" }}>
                            <div className="flex items-center gap-2">
                                <FaShoppingCart aria-hidden="true" size={13} style={{ color: "var(--text-3)" }} />
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text)" }}>Current Order</span>
                            </div>
                            {itemCount > 0 && (
                                <span
                                    aria-live="polite"
                                    style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--accent)", background: "var(--accent-subtle)", padding: "2px 8px", borderRadius: "var(--r-pill)", border: "1px solid var(--accent-border)" }}
                                >
                                    {itemCount} {itemCount === 1 ? "ITEM" : "ITEMS"}
                                </span>
                            )}
                        </div>

                        {/* Items */}
                        <div className="flex-grow overflow-y-auto p-3 space-y-3" style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" }}>
                            {!user ? (
                                <p className="text-sm text-center py-10" style={{ color: "var(--text-3)" }}>Login to view your cart</p>
                            ) : cartItems.length === 0 ? (
                                <div className="text-center py-10">
                                    <FaShoppingCart aria-hidden="true" size={26} className="mx-auto mb-3" style={{ color: "var(--text-4)" }} />
                                    <p className="text-sm mb-1" style={{ color: "var(--text-2)" }}>No items yet</p>
                                    <p className="text-xs" style={{ color: "var(--text-3)" }}>Add products to get started</p>
                                </div>
                            ) : (
                                cartItems.map((item) => (
                                    <div key={item.productId} className="flex gap-2 p-2 rounded relative" style={{ background: "var(--surface-mid)", border: "1px solid var(--border)" }}>
                                        <div className="w-11 h-11 rounded flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ background: "var(--surface-high)", border: "1px solid var(--border)" }}>
                                            {item.imageUrl
                                                ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-contain" />
                                                : <span aria-hidden="true" className="text-lg" style={{ color: "var(--text-4)" }}>&#128230;</span>
                                            }
                                        </div>
                                        <div className="flex-grow min-w-0 pr-7">
                                            <h4 className="text-[11px] font-bold truncate" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>{item.productName}</h4>
                                            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-3)" }}>Qty: {item.quantity}</p>
                                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 600, color: "var(--text-2)" }}>
                                                {fmtPrice(item.price)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFromCart(item.productId)}
                                            aria-label={`Remove ${item.productName} from cart`}
                                            className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded"
                                            style={{ color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", transition: "color var(--duration-fast)" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--error)")}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
                                        >
                                            <HiX aria-hidden="true" size={11} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Summary + checkout */}
                        {user && cartItems.length > 0 && (
                            <div className="p-4 space-y-2.5 flex-shrink-0" style={{ borderTop: "1px solid var(--border)", background: "var(--surface-high)" }}>
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: "var(--text-2)" }}>Subtotal</span>
                                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--text)", fontWeight: 600 }}>
                                        {fmtPrice(cartTotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: "var(--text-3)" }}>Est. Shipping (Freight)</span>
                                    <span style={{ color: "var(--text-3)" }}>TBD</span>
                                </div>
                                <div className="flex justify-between pt-2.5" style={{ borderTop: "1px solid var(--border)" }}>
                                    <span className="text-sm font-bold" style={{ color: "var(--text)" }}>Total</span>
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>
                                        {fmtPrice(cartTotal)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => navigate("/checkout")}
                                    className="w-full py-3 rounded font-bold text-xs mt-1 hover:opacity-90 transition-opacity motion-reduce:transition-none min-h-[44px]"
                                    style={{ background: "var(--accent)", color: "var(--text)", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}
                                >
                                    Checkout →
                                </button>
                            </div>
                        )}
                    </div>
                </aside>
            </main>

            {/* Mobile filter backdrop */}
            {filtersOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-[400]"
                    style={{ background: "rgba(0,0,0,0.55)" }}
                    onClick={() => setFiltersOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* ══════════════════════════════════════════
                TRUST INDICATORS BAR
            ══════════════════════════════════════════ */}
            <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-4 divide-x-0 lg:divide-x" style={{ borderColor: "var(--border)" }}>
                    {TRUST_PILLARS.map((p, i) => (
                        <div
                            key={i}
                            className="py-8 px-6"
                            style={{ borderRight: i < 3 ? "1px solid var(--border)" : "none" }}
                        >
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "20px", color: "var(--accent)", marginBottom: "10px" }}>{p.symbol}</div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text)", marginBottom: "6px" }}>{p.label}</div>
                            <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--text-3)", lineHeight: 1.55, margin: 0 }}>{p.copy}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════
                TRUSTED SUPPLIERS
            ══════════════════════════════════════════ */}
            <section style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", textAlign: "center", marginBottom: "28px" }}>
                        TRUSTED SUPPLIERS
                    </p>
                    <div className="grid grid-cols-3 lg:grid-cols-6" style={{ gap: "1px", background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
                        {SUPPLIERS.map((brand, i) => (
                            <div key={i} style={{ background: "var(--surface)", padding: "22px 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.01em", textTransform: "uppercase", textAlign: "center" }}>
                                    {brand}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ══════════════════════════════════════════
                QUICK VIEW MODAL
            ══════════════════════════════════════════ */}
            {quickViewProduct && (
                <div
                    className="fixed inset-0 flex items-center justify-center px-4 py-8"
                    style={{ background: "oklch(0 0 0 / 0.78)", zIndex: "var(--z-modal-bg)" }}
                    onClick={closeQuickView}
                >
                    <div
                        ref={modalRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="qv-title"
                        className="relative w-full max-w-sm flex flex-col"
                        style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border-mid)",
                            borderRadius: "var(--r-lg)",
                            boxShadow: "0 8px 40px oklch(0 0 0 / 0.55)",
                            zIndex: "var(--z-modal)",
                            maxHeight: "85vh",
                            overflow: "hidden",
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={handleModalKeyDown}
                    >
                        {/* Image area */}
                        <div className="relative flex-shrink-0" style={{ height: "150px", background: "#ffffff" }}>
                            {quickViewProduct.imageUrl ? (
                                <img
                                    src={quickViewProduct.imageUrl}
                                    alt={quickViewProduct.productName}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl" style={{ color: "var(--text-4)" }} aria-hidden="true">&#128230;</div>
                            )}
                            {/* Close button */}
                            <button
                                onClick={closeQuickView}
                                aria-label="Close Quick View"
                                className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center"
                                style={{
                                    background: "oklch(0 0 0 / 0.45)",
                                    backdropFilter: "blur(6px)",
                                    WebkitBackdropFilter: "blur(6px)",
                                    color: "#fff",
                                    border: "1px solid oklch(1 0 0 / 0.18)",
                                    borderRadius: "var(--r-md)",
                                    cursor: "pointer",
                                    transition: "background var(--duration-fast)",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "oklch(0 0 0 / 0.7)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "oklch(0 0 0 / 0.45)")}
                            >
                                <HiX aria-hidden="true" size={12} />
                            </button>
                            {/* Stock badge */}
                            <div className="absolute top-2 left-2">
                                <span
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm"
                                    style={quickViewProduct.quantity > 0
                                        ? { background: "var(--success-subtle)", color: "var(--success)", border: "1px solid var(--success)", fontFamily: "var(--font-mono)" }
                                        : { background: "var(--error-subtle)", color: "var(--error)", border: "1px solid var(--error)", fontFamily: "var(--font-mono)" }
                                    }
                                >
                                    {quickViewProduct.quantity > 0 ? `IN STOCK · ${quickViewProduct.quantity}` : "OUT OF STOCK"}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-grow overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" }}>
                            <div className="px-4 pb-4 space-y-2.5" style={{ paddingTop: "2px" }}>
                                {/* Model tag + part number on one line */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-sm" style={{ background: "var(--surface-mid)", color: "var(--text-3)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
                                        {quickViewProduct.modelNumber || "PART"}
                                    </span>
                                    {quickViewProduct.partNumber && (
                                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-4)" }}>
                                            <span style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>PN </span>
                                            <span style={{ color: "var(--text-3)" }}>{quickViewProduct.partNumber}</span>
                                        </span>
                                    )}
                                </div>

                                {/* Product name */}
                                <h2 id="qv-title" style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", textWrap: "balance", margin: 0, lineHeight: 1.25 }}>
                                    {quickViewProduct.productName}
                                </h2>

                                {/* Description */}
                                <div style={{ maxHeight: "72px", overflowY: "auto", overflowX: "hidden", scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" }}>
                                    <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--text-2)", lineHeight: 1.6, margin: 0, wordBreak: "break-word", overflowWrap: "break-word" }}>
                                        {quickViewProduct.description || "No description available."}
                                    </p>
                                </div>

                                {/* Price + Add to cart */}
                                <div className="flex items-center justify-between pt-2.5" style={{ borderTop: "1px solid var(--border)" }}>
                                    <div>
                                        <span className="block" style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-4)" }}>Unit Price</span>
                                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.15rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
                                            {fmtPrice(quickViewProduct.price)}
                                        </span>
                                    </div>
                                    <button
                                        disabled={quickViewProduct.quantity === 0 || cartBusy}
                                        onClick={() => { handleAddToCart(quickViewProduct.productId); closeQuickView(); }}
                                        className="px-4 py-2 text-[11px] font-bold flex items-center gap-1.5 disabled:opacity-40 min-h-[36px]"
                                        style={{
                                            background: quickViewProduct.quantity === 0 ? "var(--surface-high)" : "var(--accent)",
                                            color: quickViewProduct.quantity === 0 ? "var(--text-3)" : "oklch(0.15 0.02 63)",
                                            border: "none",
                                            borderRadius: "var(--r-md)",
                                            cursor: quickViewProduct.quantity === 0 ? "not-allowed" : "pointer",
                                            fontFamily: "var(--font-mono)",
                                            letterSpacing: "0.06em",
                                            textTransform: "uppercase",
                                            transition: "opacity var(--duration-fast)",
                                        }}
                                        onMouseEnter={(e) => { if (quickViewProduct.quantity > 0) e.currentTarget.style.opacity = "0.85"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                                    >
                                        <FaShoppingCart aria-hidden="true" size={10} />
                                        {quickViewProduct.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                                    </button>
                                </div>

                                {/* View Full Details */}
                                <Link
                                    to={`/products/${quickViewProduct.productId}`}
                                    onClick={closeQuickView}
                                    className="flex items-center justify-center gap-1.5 w-full py-2 text-[11px] font-bold min-h-[36px]"
                                    style={{
                                        background: "transparent",
                                        border: "1px solid var(--border)",
                                        borderRadius: "var(--r-md)",
                                        color: "var(--text-2)",
                                        fontFamily: "var(--font-mono)",
                                        letterSpacing: "0.06em",
                                        textTransform: "uppercase",
                                        textDecoration: "none",
                                        transition: "border-color var(--duration-fast), color var(--duration-fast)",
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.color = "var(--accent)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}
                                >
                                    View Full Details →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
