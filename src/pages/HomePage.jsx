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
import SolydLogo from "../components/SolydLogo";

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
        <svg viewBox="0 0 560 450" fill="none" xmlns="http://www.w3.org/2000/svg"
             aria-hidden="true" style={{ width: "100%", maxHeight: "450px" }}>

            <defs>
                <pattern id="bgGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" stroke="#ccd5ae" strokeWidth="0.3" fill="none"/>
                </pattern>
                <pattern id="metalHatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="5" stroke="#7a9055" strokeWidth="0.7" opacity="0.4"/>
                </pattern>
                <radialGradient id="ballShine" cx="32%" cy="28%" r="68%">
                    <stop offset="0%"   stopColor="#f8f4e8"/>
                    <stop offset="55%"  stopColor="#ddd0a0"/>
                    <stop offset="100%" stopColor="#a89060"/>
                </radialGradient>
            </defs>

            {/* Background */}
            <rect width="560" height="450" fill="#f5f0e0"/>
            <rect width="560" height="450" fill="url(#bgGrid)" opacity="0.75"/>

            {/* Outer drawing frame */}
            <rect x="4"   y="4"  width="552" height="442" stroke="#8a9d6a" strokeWidth="2.5" fill="none"/>
            {/* Left panel — bearing */}
            <rect x="10"  y="10" width="267" height="375" stroke="#8a9d6a" strokeWidth="0.8" fill="none"/>
            {/* Right panel — gear */}
            <rect x="283" y="10" width="271" height="375" stroke="#8a9d6a" strokeWidth="0.8" fill="none"/>
            {/* Title block separator */}
            <line x1="4" y1="391" x2="556" y2="391" stroke="#8a9d6a" strokeWidth="1.5"/>

            {/* ════════════════════════════════════
                LEFT PANEL · DGBB (scale ~0.68×)
                Center (148, 200)
            ════════════════════════════════════ */}

            {/* Center lines */}
            <line x1="148" y1="13"  x2="148" y2="383" stroke="#bccf98" strokeWidth="0.9" strokeDasharray="14 4 2 4"/>
            <line x1="13"  y1="200" x2="275" y2="200" stroke="#bccf98" strokeWidth="0.9" strokeDasharray="14 4 2 4"/>

            {/* Outer race (r 82–94) */}
            <circle cx={bCX} cy={bCY} r="94" fill="#ddd8b8" stroke="#7a9055" strokeWidth="2"/>
            <circle cx={bCX} cy={bCY} r="94" fill="url(#metalHatch)"/>
            <circle cx={bCX} cy={bCY} r="82" fill="#f5f0e0" stroke="#8a9d6a" strokeWidth="0.8"/>
            <circle cx={bCX} cy={bCY} r="81" stroke="#8a9d6a" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.4"/>

            {/* Cage rings */}
            <circle cx={bCX} cy={bCY} r="76" stroke="#b8a060" strokeWidth="1" strokeDasharray="5 3" opacity="0.65"/>
            <circle cx={bCX} cy={bCY} r="68" stroke="#b8a060" strokeWidth="1" strokeDasharray="5 3" opacity="0.65"/>

            {/* 12 balls */}
            {bearingBalls.map((b, i) => (
                <g key={i}>
                    <circle cx={b.cx} cy={b.cy} r="9" fill="url(#ballShine)" stroke="#7a9055" strokeWidth="1.2"/>
                    <circle cx={b.cx - 3} cy={b.cy - 3} r="2.5" fill="white" opacity="0.3"/>
                </g>
            ))}

            {/* Inner race (r 28–63) */}
            <circle cx={bCX} cy={bCY} r="63" fill="#ddd8b8" stroke="#7a9055" strokeWidth="1.5"/>
            <circle cx={bCX} cy={bCY} r="63" fill="url(#metalHatch)"/>
            <circle cx={bCX} cy={bCY} r="28" fill="#ede8d2" stroke="#8a9d6a" strokeWidth="1.5"/>

            {/* Bore center mark */}
            <line x1="140" y1="200" x2="156" y2="200" stroke="#8a9d6a" strokeWidth="1.3"/>
            <line x1="148" y1="192" x2="148" y2="208" stroke="#8a9d6a" strokeWidth="1.3"/>

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
            <line x1="224" y1="152" x2="247" y2="128" stroke="#8a9d6a" strokeWidth="0.9"/>
            <circle cx="253" cy="122" r="8" fill="#e8e3cc" stroke="#8a9d6a" strokeWidth="1.2"/>
            <text x="253" y="126" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="8" fill="#3a4a1a" fontWeight="700">1</text>

            <line x1="218" y1="170" x2="244" y2="148" stroke="#8a9d6a" strokeWidth="0.9"/>
            <circle cx="250" cy="142" r="8" fill="#e8e3cc" stroke="#8a9d6a" strokeWidth="1.2"/>
            <text x="250" y="146" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="8" fill="#3a4a1a" fontWeight="700">2</text>

            <line x1="220" y1="200" x2="247" y2="228" stroke="#8a9d6a" strokeWidth="0.9"/>
            <circle cx="253" cy="234" r="8" fill="#e8e3cc" stroke="#8a9d6a" strokeWidth="1.2"/>
            <text x="253" y="238" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="8" fill="#3a4a1a" fontWeight="700">3</text>

            <line x1="186" y1="200" x2="247" y2="263" stroke="#8a9d6a" strokeWidth="0.9"/>
            <circle cx="253" cy="269" r="8" fill="#e8e3cc" stroke="#8a9d6a" strokeWidth="1.2"/>
            <text x="253" y="273" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="8" fill="#3a4a1a" fontWeight="700">4</text>

            {/* IN STOCK badge */}
            <rect x="14" y="356" width="78" height="22" rx="11" fill="#d4ead4" stroke="#4a8a4a" strokeWidth="1.2"/>
            <text x="53" y="371" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="8.5" fill="#2a5a2a" fontWeight="700">IN STOCK</text>

            {/* ════════════════════════════════════
                RIGHT PANEL · SPUR GEAR M7 Z24 PA20°
                Center (415, 200)
            ════════════════════════════════════ */}

            {/* Center lines */}
            <line x1="415" y1="13"  x2="415" y2="383" stroke="#bccf98" strokeWidth="0.9" strokeDasharray="14 4 2 4"/>
            <line x1="286" y1="200" x2="552" y2="200" stroke="#bccf98" strokeWidth="0.9" strokeDasharray="14 4 2 4"/>

            {/* Gear body (full disc with teeth) */}
            <path d={gearPath} fill="#ddd8b8" stroke="#7a9055" strokeWidth="1.5"/>
            <path d={gearPath} fill="url(#metalHatch)"/>

            {/* Pitch circle — dashed orange */}
            <circle cx={gCX} cy={gCY} r="84" stroke="#d4a373" strokeWidth="0.8" strokeDasharray="7 3" opacity="0.75"/>

            {/* Hub boundary ring */}
            <circle cx={gCX} cy={gCY} r="38" stroke="#8a9d6a" strokeWidth="1.2" fill="none"/>

            {/* Bore */}
            <circle cx={gCX} cy={gCY} r="21" fill="#ede8d2" stroke="#8a9d6a" strokeWidth="1.5"/>

            {/* Keyway at 12 o'clock */}
            <rect x="409" y="172" width="12" height="8" rx="1" fill="#ede8d2" stroke="#8a9d6a" strokeWidth="0.9"/>

            {/* Bore center mark */}
            <line x1="407" y1="200" x2="423" y2="200" stroke="#8a9d6a" strokeWidth="1.3"/>
            <line x1="415" y1="192" x2="415" y2="208" stroke="#8a9d6a" strokeWidth="1.3"/>

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
            <text x="460" y="87" fontFamily="'IBM Plex Mono',monospace" fontSize="7"   fill="#a0845c">Ø 168 mm</text>

            {/* Gear spec callout */}
            <line x1="500" y1="160" x2="524" y2="140" stroke="#8a9d6a" strokeWidth="0.9"/>
            <rect x="524" y="118" width="30" height="50" rx="2" fill="#f0ead0" stroke="#ccd5ae" strokeWidth="1"/>
            <text x="539" y="131" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="7.5" fill="#7a6030" fontWeight="700">m = 7</text>
            <text x="539" y="143" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="7.5" fill="#3a4a1a" fontWeight="700">z = 24</text>
            <text x="539" y="155" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="7.5" fill="#4a5a2a">PA20°</text>
            <text x="539" y="164" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="6.5" fill="#8a9d6a">DIN3960</text>

            {/* ══ TITLE BLOCK ══ */}
            <rect x="4" y="391" width="552" height="55" fill="#ede8d0"/>
            <line x1="220" y1="391" x2="220" y2="446" stroke="#8a9d6a" strokeWidth="0.8"/>
            <line x1="400" y1="391" x2="400" y2="446" stroke="#8a9d6a" strokeWidth="0.8"/>
            <line x1="460" y1="391" x2="460" y2="446" stroke="#8a9d6a" strokeWidth="0.8"/>
            <line x1="220" y1="418" x2="556" y2="418" stroke="#8a9d6a" strokeWidth="0.5"/>

            {/* Col 1: Bearing info */}
            <text x="112" y="405" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="8"   fill="#3a4a1a" fontWeight="700">DEEP GROOVE BALL BEARING</text>
            <text x="112" y="416" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="7"   fill="#6a7a4a">Ø276 × Ø82 × B48 · CLASS P6</text>
            <text x="112" y="428" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="6.5" fill="#a0845c">SLY-DGBB-276/82-P6</text>
            <text x="112" y="440" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="6"   fill="#8a9d6a">DIN 625 TYPE · AISI 52100 HRC 60</text>

            {/* Col 2: Gear info */}
            <text x="310" y="405" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="8"   fill="#3a4a1a" fontWeight="700">SPUR GEAR M7 Z24 PA20°</text>
            <text x="310" y="416" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="7"   fill="#6a7a4a">OD Ø182 · BORE Ø42 H7 · PCD Ø168</text>
            <text x="310" y="428" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="6.5" fill="#a0845c">SLY-GR-M7-Z24-PA20</text>
            <text x="310" y="440" textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="6"   fill="#8a9d6a">DIN 3960 · 16MnCr5 CASE HARD.</text>

            {/* Col 3: Scale */}
            <text x="404" y="407" fontFamily="'IBM Plex Mono',monospace" fontSize="6.5" fill="#8a9d6a">SCALE</text>
            <text x="404" y="417" fontFamily="'IBM Plex Mono',monospace" fontSize="11"  fill="#3a4a1a" fontWeight="700">1 : 2</text>
            <text x="404" y="429" fontFamily="'IBM Plex Mono',monospace" fontSize="6.5" fill="#8a9d6a">UNIT: mm</text>

            {/* Col 4: Attribution */}
            <text x="465" y="407" fontFamily="'IBM Plex Mono',monospace" fontSize="6.5" fill="#8a9d6a">DRAWN BY</text>
            <text x="465" y="418" fontFamily="'IBM Plex Mono',monospace" fontSize="9"   fill="#3a4a1a" fontWeight="700">SolydShop</text>
            <text x="465" y="429" fontFamily="'IBM Plex Mono',monospace" fontSize="6.5" fill="#a0845c">ENG DEPT.</text>
            <text x="465" y="440" fontFamily="'IBM Plex Mono',monospace" fontSize="6"   fill="#8a9d6a">REV B · 2026-06</text>
        </svg>
    );
};

/* ── Skeleton card ───────────────────────────────────────────────────── */
const SkeletonCard = () => (
    <div className="rounded overflow-hidden animate-pulse" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="h-40 w-full" style={{ background: "var(--surface-high)" }} />
        <div className="p-3 space-y-2">
            <div className="h-2.5 rounded w-4/5" style={{ background: "var(--surface-high)" }} />
            <div className="h-2.5 rounded w-3/5" style={{ background: "var(--surface-high)" }} />
            <div className="h-7 rounded mt-3"    style={{ background: "var(--surface-high)" }} />
        </div>
    </div>
);

/* ── Main component ──────────────────────────────────────────────────── */
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
    const [hasLoaded,        setHasLoaded]        = useState(false);

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

    /* ═══════════════════════════════════════════════════════════════════
       RENDER
    ═══════════════════════════════════════════════════════════════════ */
    return (
        <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)" }}>

            {/* ══════════════════════════════════════════
                HERO — warm sand + blueprint grid
            ══════════════════════════════════════════ */}
            <section className="solyd-hero" style={{ background: "var(--surface)", backgroundImage: HERO_GRID, borderBottom: "1px solid var(--border)" }}>
                <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 lg:py-20 grid grid-cols-1 md:grid-cols-[1fr_380px] gap-10 lg:gap-16 items-center">

                    {/* Left: headline + CTAs + stats */}
                    <div>
                        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.25rem, 4vw, 3.25rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.05, color: "var(--text)", margin: 0, textWrap: "balance" }}>
                            The Global Marketplace<br className="hidden sm:block" /> for Industrial Parts.
                        </h1>

                        <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "var(--text-2)", marginTop: "20px", lineHeight: 1.65, maxWidth: "48ch" }}>
                            Buy and sell heavy machinery components worldwide. Verified sellers, OEM-grade parts, and fast international shipping — all on one platform.
                        </p>

                        <div className="flex flex-wrap gap-3" style={{ marginTop: "28px" }}>
                            <button
                                onClick={() => catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                                style={{ background: "var(--accent)", color: "var(--text)", border: "none", borderRadius: "var(--r-md)", padding: "12px 28px", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", transition: "opacity var(--duration-fast)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                            >
                                Browse Parts
                            </button>
                            <button
                                onClick={() => navigate("/seller/dashboard")}
                                style={{ background: "transparent", color: "var(--text)", border: "1px solid var(--border-strong)", borderRadius: "var(--r-md)", padding: "12px 28px", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", transition: "border-color var(--duration-fast)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
                            >
                                Start Selling
                            </button>
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

                        {/* Search */}
                        <div>
                            <label htmlFor="product-search" style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "8px" }}>
                                Search Parts
                            </label>
                            <div style={{ position: "relative" }}>
                                <HiSearch aria-hidden="true" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} size={13} />
                                <input
                                    id="product-search"
                                    type="text"
                                    placeholder="Part name, SKU, model..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="w-full rounded focus:outline-none"
                                    style={{ background: "var(--surface-high)", border: "1px solid var(--border)", color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: "12px", padding: "8px 28px 8px 30px" }}
                                    onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                                    onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
                                />
                                {keyword && (
                                    <button aria-label="Clear search" onClick={() => setKeyword("")} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", display: "flex", alignItems: "center" }}>
                                        <HiX aria-hidden="true" size={12} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Category */}
                        <div style={{ paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
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
                                    ${Number(priceMax).toLocaleString()}+
                                </span>
                            </div>
                            <input
                                id="price-range"
                                type="range"
                                min={0}
                                max={100000}
                                value={priceMax}
                                onChange={(e) => setPriceMax(Number(e.target.value))}
                                aria-valuetext={`Up to $${Number(priceMax).toLocaleString()}`}
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
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.125rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>
                                Procurement Catalog
                            </h2>
                            <div aria-live="polite" aria-atomic="true" style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-4)", marginTop: "2px" }}>
                                {hasLoaded && !loading && !productError && `${(products ?? []).length} PARTS AVAILABLE`}
                            </div>
                        </div>
                        {hasAnyFilter && (
                            <button
                                onClick={handleReset}
                                className="hidden lg:block text-xs"
                                style={{ background: "none", border: "none", color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", textDecoration: "underline" }}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>

                    {loading || !hasLoaded ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : productError ? (
                        <div className="py-20 text-center">
                            <p className="mb-4" style={{ color: "var(--error)" }}>{productError}</p>
                            <button onClick={() => fetchProducts()} className="px-5 py-2 rounded text-sm font-bold min-h-[44px]" style={{ background: "var(--accent)", color: "var(--text)", border: "none", cursor: "pointer" }}>
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {products.map((product) => (
                                <article
                                    key={product.productId}
                                    className="rounded overflow-hidden flex flex-col"
                                    style={{ background: "var(--surface-mid)", border: "1px solid var(--border)", transition: "border-color var(--duration-fast)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                                >
                                    {/* Image */}
                                    <div
                                        className="h-40 w-full relative overflow-hidden group"
                                        style={{ background: "var(--surface-high)", borderBottom: "1px solid var(--border)" }}
                                    >
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.productName}
                                                loading="lazy"
                                                className="w-full h-full object-contain group-hover:scale-105 transition-transform motion-reduce:transition-none duration-200"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl" style={{ color: "var(--text-4)" }} aria-hidden="true">
                                                &#128230;
                                            </div>
                                        )}
                                        {/* Model badge */}
                                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-sm text-[10px] font-bold z-10" style={{ background: "var(--surface)", color: "var(--text-2)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)" }}>
                                            {product.modelNumber || "PART"}
                                        </div>
                                        {/* Stock badge */}
                                        {product.quantity > 0 ? (
                                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-sm text-[10px] font-bold z-10" style={{ background: "var(--success-subtle)", color: "var(--success)", border: "1px solid var(--success)" }}>IN STOCK</div>
                                        ) : (
                                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-sm text-[10px] font-bold z-10" style={{ background: "var(--error-subtle)", color: "var(--error)", border: "1px solid var(--error)" }}>OUT</div>
                                        )}
                                        {/* Quick View — desktop overlay */}
                                        <div className="absolute inset-0 hidden md:flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity motion-reduce:transition-none duration-200 z-20">
                                            <button
                                                onClick={(e) => openQuickView(e, product)}
                                                className="px-4 py-2 rounded text-xs font-bold min-h-[44px]"
                                                style={{ background: "rgba(255,255,255,0.93)", color: "var(--text)", border: "1px solid var(--border)" }}
                                            >
                                                Quick View
                                            </button>
                                        </div>
                                        {/* Quick View — mobile pill */}
                                        <div className="absolute bottom-2 left-0 right-0 flex justify-center md:hidden z-20">
                                            <button onClick={(e) => openQuickView(e, product)} className="px-4 py-2 rounded-full text-[10px] font-bold min-h-[44px]" style={{ background: "rgba(0,0,0,0.65)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}>
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
                                                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                                                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                                            >
                                                {product.productName}
                                            </Link>
                                        </h3>
                                        <p className="text-[11px] mb-2 line-clamp-2" style={{ color: "var(--text-2)" }}>
                                            {product.description}
                                        </p>
                                        {product.partNumber && (
                                            <div className="mb-2">
                                                <span className="block text-[10px] uppercase tracking-widest font-bold" style={{ color: "var(--text-3)" }}>Part No.</span>
                                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-2)", fontWeight: 500 }}>{product.partNumber}</span>
                                            </div>
                                        )}
                                        <div className="mt-auto flex flex-col gap-2 pt-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                                            <div>
                                                <span className="block text-[10px] uppercase tracking-widest font-bold" style={{ color: "var(--text-3)" }}>Unit Price</span>
                                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>
                                                    ${Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <button
                                                disabled={product.quantity === 0 || cartBusy}
                                                onClick={() => handleAddToCart(product.productId)}
                                                className="w-full py-2 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity motion-reduce:transition-none disabled:opacity-40 min-h-[44px]"
                                                style={{ background: "var(--accent)", color: "var(--text)", border: "none", cursor: product.quantity === 0 ? "not-allowed" : "pointer", fontFamily: "var(--font-body)" }}
                                            >
                                                <FaShoppingCart aria-hidden="true" size={11} />
                                                {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                                            </button>
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
                                                ${Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
                                        ${cartTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: "var(--text-3)" }}>Est. Shipping (Freight)</span>
                                    <span style={{ color: "var(--text-3)" }}>TBD</span>
                                </div>
                                <div className="flex justify-between pt-2.5" style={{ borderTop: "1px solid var(--border)" }}>
                                    <span className="text-sm font-bold" style={{ color: "var(--text)" }}>Total</span>
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>
                                        ${cartTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
                            className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded"
                            style={{ background: "var(--surface-high)", color: "var(--text-2)", border: "1px solid var(--border)", cursor: "pointer" }}
                        >
                            <HiX aria-hidden="true" size={12} />
                        </button>

                        {/* Image */}
                        <div className="h-36 w-full overflow-hidden rounded-t" style={{ background: "var(--surface-high)" }}>
                            {quickViewProduct.imageUrl ? (
                                <img src={quickViewProduct.imageUrl} alt={quickViewProduct.productName} className="w-full h-full object-contain" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl" style={{ color: "var(--text-4)" }} aria-hidden="true">&#128230;</div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-sm" style={{ background: "var(--surface-mid)", color: "var(--text-2)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)" }}>
                                    {quickViewProduct.modelNumber || "PRODUCT"}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm"
                                    style={quickViewProduct.quantity > 0
                                        ? { background: "var(--success-subtle)", color: "var(--success)", border: "1px solid var(--success)" }
                                        : { background: "var(--error-subtle)",   color: "var(--error)",   border: "1px solid var(--error)" }
                                    }
                                >
                                    {quickViewProduct.quantity > 0 ? `In Stock (${quickViewProduct.quantity})` : "Out of Stock"}
                                </span>
                            </div>

                            <h2 id="qv-title" className="text-sm font-bold leading-snug" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>
                                {quickViewProduct.productName}
                            </h2>

                            {quickViewProduct.partNumber && (
                                <div>
                                    <span className="block text-[10px] uppercase tracking-widest font-bold" style={{ color: "var(--text-3)" }}>Part No.</span>
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-2)", fontWeight: 500 }}>
                                        {quickViewProduct.partNumber}
                                    </span>
                                </div>
                            )}

                            <p className="text-sm leading-relaxed max-h-24 overflow-y-auto overflow-x-hidden break-all" style={{ color: "var(--text-2)", scrollbarWidth: "thin" }}>
                                {quickViewProduct.description || "No description available."}
                            </p>

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
                                    style={{ background: "var(--accent)", color: "var(--text)", border: "none", cursor: quickViewProduct.quantity === 0 ? "not-allowed" : "pointer" }}
                                >
                                    <FaShoppingCart aria-hidden="true" size={11} />
                                    {quickViewProduct.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                                </button>
                            </div>

                            <Link
                                to={`/products/${quickViewProduct.productId}`}
                                onClick={closeQuickView}
                                className="block text-center text-xs font-bold py-2 rounded min-h-[44px] flex items-center justify-center"
                                style={{ color: "var(--text-2)", border: "1px solid var(--border)", textDecoration: "none", transition: "border-color var(--duration-fast), color var(--duration-fast)" }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.borderColor = "var(--border)"; }}
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
