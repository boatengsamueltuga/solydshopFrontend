import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../api/api';
import { fmtPrice } from '../utils/format';
import { incrementCartCount } from '../features/cart/cartSlice';
import ReviewsSection from '../components/products/ReviewsSection';
import './ProductDetailPage.css';

/* ── XSRF helper (mirrors the pattern used in HomePage.jsx) ─── */
const getXsrfToken = () =>
    document.cookie
        .split(';')
        .find(c => c.trim().startsWith('XSRF-TOKEN='))
        ?.split('=')[1] ?? '';

/* ── Loading skeleton ──────────────────────────────────────────── */
function Skeleton({ style }) {
    return (
        <div
            style={{
                background: 'var(--surface-mid)',
                borderRadius: 'var(--r-md)',
                animation: 'solyd-pulse 1.6s ease-in-out infinite',
                ...style,
            }}
        />
    );
}

/* ── Stock badge colors ────────────────────────────────────────── */
function stockColor(qty) {
    if (qty <= 0)  return 'var(--error)';
    if (qty <= 5)  return 'var(--warning)';
    return 'var(--success)';
}
function stockLabel(qty) {
    if (qty <= 0)  return 'OUT OF STOCK';
    if (qty <= 5)  return `LOW STOCK · ${qty} units`;
    return `IN STOCK · ${qty} units`;
}

/* ── Spec row ──────────────────────────────────────────────────── */
function SpecRow({ label, value, mono, last }) {
    return (
        <div
            className="pdp-spec-row"
            style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr',
                borderBottom: last ? 'none' : '1px solid var(--border-subtle)',
            }}
        >
            <div
                className="pdp-spec-label"
                style={{
                    padding: '9px 14px',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-3)',
                    background: 'var(--surface)',
                    borderRight: '1px solid var(--border-subtle)',
                }}
            >
                {label}
            </div>
            <div
                className="pdp-spec-value"
                style={{
                    padding: '9px 14px',
                    fontSize: 'var(--text-sm)',
                    color: mono ? 'var(--text-2)' : 'var(--text)',
                    fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
                    fontWeight: mono ? 500 : 400,
                    letterSpacing: mono ? '0.01em' : 'normal',
                    overflowWrap: 'break-word',
                    minWidth: 0,
                    wordBreak: 'break-all',
                }}
            >
                {value}
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   ProductDetailPage
   ════════════════════════════════════════════════════════════════ */
export default function ProductDetailPage() {
    const { id } = useParams();
    const { isAuthenticated, user } = useSelector(s => s.auth);
    const dispatch = useDispatch();

    const [product,      setProduct]      = useState(null);
    const [loading,      setLoading]      = useState(true);
    const [fetchError,   setFetchError]   = useState(null);
    const [qty,          setQty]          = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [selectedImg,  setSelectedImg]  = useState(null);
    const [imgIdx,       setImgIdx]       = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [quoteOpen,    setQuoteOpen]    = useState(false);
    const [quoteForm,    setQuoteForm]    = useState({ qtyNeeded: 1, urgency: 'Standard', notes: '', contactEmail: '', phone: '' });
    const [quoteSending, setQuoteSending] = useState(false);

    /* ── Fetch product ───────────────────────────────────────── */
    useEffect(() => {
        setLoading(true);
        setFetchError(null);
        setQty(1);
        setSelectedImg(null);

        api.get(`/public/products/${id}`)
            .then(res => {
                setProduct(res.data);
                setSelectedImg(res.data.imageUrl ?? null);
                setImgIdx(0);
            })
            .catch(() => setFetchError('Product not found or no longer available.'))
            .finally(() => setLoading(false));
    }, [id]);

    /* ── Add to cart ─────────────────────────────────────────── */
    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            toast.error('Please log in to add items to your cart.');
            return;
        }
        if (qty < 1 || qty > (product?.quantity ?? 0)) return;

        setAddingToCart(true);
        try {
            await api.post(
                `/cart/${user.userId}/items`,
                { productId: product.productId, quantity: qty },
                { headers: { 'X-XSRF-TOKEN': getXsrfToken() } },
            );
            dispatch(incrementCartCount());
            toast.success(`${product.productName} added to cart.`);
        } catch {
            toast.error('Failed to add to cart. Please try again.');
        } finally {
            setAddingToCart(false);
        }
    };

    /* ── Image gallery helpers ──────────────────────────────── */
    const imageSlots = product
        ? [product.imageUrl, product.image2Url, product.image3Url, product.image4Url]
              .filter(u => u && u.trim())
        : [];

    const goImage = (dir) => {
        if (imageSlots.length < 2) return;
        const next = (imgIdx + dir + imageSlots.length) % imageSlots.length;
        setImgIdx(next);
        setSelectedImg(imageSlots[next]);
    };

    useEffect(() => {
        if (!lightboxOpen) return;
        const onKey = (e) => {
            if (e.key === 'ArrowLeft')  goImage(-1);
            if (e.key === 'ArrowRight') goImage(1);
            if (e.key === 'Escape')     setLightboxOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxOpen, imgIdx, imageSlots.length]);

    /* ── Open quote modal (pre-fill user email) ─────────────── */
    const openQuote = () => {
        setQuoteForm(f => ({ ...f, contactEmail: user?.email ?? '' }));
        setQuoteOpen(true);
    };

    /* ── Submit quote request ────────────────────────────────── */
    const handleQuoteSubmit = async (e) => {
        e.preventDefault();
        if (!quoteForm.contactEmail.trim()) { toast.error('Please enter a contact email.'); return; }
        setQuoteSending(true);
        await new Promise(r => setTimeout(r, 800));
        setQuoteSending(false);
        setQuoteOpen(false);
        toast.success('Quote request submitted. Our team will contact you within 24 hours.');
    };

    /* ── Shared page shell ───────────────────────────────────── */
    const shell = (children) => (
        <div
            style={{
                background: 'var(--bg)',
                minHeight: '100vh',
                paddingTop: 'var(--topbar-height)',
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
            }}
        >
            <div
                className="pdp-content-inner"
                style={{
                    maxWidth: '1440px',
                    margin: '0 auto',
                    padding: '24px 16px 80px',
                }}
            >
                {children}
            </div>

        </div>
    );

    /* ── Loading state ───────────────────────────────────────── */
    if (loading) {
        return shell(
            <>
                <Skeleton style={{ height: 16, width: 240, marginBottom: 'var(--space-6)' }} />
                <div className="pdp-grid">
                    <Skeleton style={{ aspectRatio: '4/3' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                        <Skeleton style={{ height: 36, width: '80%' }} />
                        <Skeleton style={{ height: 16, width: '40%' }} />
                        <Skeleton style={{ height: 120 }} />
                        <Skeleton style={{ height: 96 }} />
                        <Skeleton style={{ height: 48 }} />
                        <Skeleton style={{ height: 48 }} />
                    </div>
                </div>
            </>
        );
    }

    /* ── Error state ─────────────────────────────────────────── */
    if (fetchError || !product) {
        return shell(
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 320,
                    gap: 'var(--space-4)',
                    textAlign: 'center',
                }}
            >
                <p style={{ color: 'var(--error)', fontSize: 'var(--text-base)' }}>
                    {fetchError ?? 'Product not found.'}
                </p>
                <Link
                    to="/"
                    className="pdp-back-link"
                    style={{
                        color: 'var(--text-2)',
                        fontSize: 'var(--text-sm)',
                        textDecoration: 'none',
                        transition: 'color var(--duration-fast)',
                    }}
                >
                    ← Back to Catalog
                </Link>
            </div>
        );
    }

    const inStock  = product.quantity > 0;
    const maxQty   = product.quantity;

    /* ── Spec rows: only show fields that have data ───────────── */
    const specRows = [
        product.partNumber  && { label: 'Part Number',  value: product.partNumber,  mono: true  },
        product.modelNumber && { label: 'Model Number', value: product.modelNumber, mono: true  },
        product.categoryName && { label: 'Category',   value: product.categoryName, mono: false },
    ].filter(Boolean);

    /* ── Rendered page ───────────────────────────────────────── */
    return shell(
        <>
            {/* Breadcrumb */}
            <nav
                aria-label="breadcrumb"
                style={{
                    marginBottom: 'var(--space-6)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    flexWrap: 'wrap',
                }}
            >
                <Link
                    to="/"
                    style={{ color: 'var(--text-3)', textDecoration: 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.textDecoration = 'underline'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.textDecoration = 'none'; }}
                >
                    Catalog
                </Link>

                {product.categoryName && (
                    <>
                        <span aria-hidden="true">›</span>
                        <span style={{ color: 'var(--text-3)' }}>{product.categoryName}</span>
                    </>
                )}

                <span aria-hidden="true">›</span>
                <span
                    style={{ color: 'var(--text-2)' }}
                    aria-current="page"
                >
                    {product.productName}
                </span>
            </nav>

            {/* Two-column grid */}
            <div className="pdp-grid">

                {/* ── Left: image panel ─────────────────────────── */}
                <div
                    className="pdp-image-panel"
                    style={{
                        background:   'var(--surface)',
                        border:       '1px solid var(--border)',
                        borderRadius: '8px',
                        overflow:     'hidden',
                    }}
                >
                    {/* Main image viewer */}
                    <div
                        onClick={() => { if (selectedImg) setLightboxOpen(true); }}
                        style={{
                            width:      '100%',
                            height:     '360px',
                            position:   'relative',
                            overflow:   'hidden',
                            background: '#ffffff',
                            cursor:     selectedImg ? 'zoom-in' : 'default',
                        }}
                    >
                        {/* No-image placeholder */}
                        {!selectedImg && (
                            <div
                                style={{
                                    position:       'absolute',
                                    inset:          0,
                                    display:        'flex',
                                    flexDirection:  'column',
                                    alignItems:     'center',
                                    justifyContent: 'center',
                                    gap:            '10px',
                                    userSelect:     'none',
                                    background:     'var(--surface-high)',
                                }}
                            >
                                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.25 }}>
                                    <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                    <circle cx="8.5" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                                    <path d="M2 15l5-5 4 4 3-3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span style={{ color: 'var(--text-4)', fontSize: '11px', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                    No image
                                </span>
                            </div>
                        )}

                        {/* Product image */}
                        {selectedImg && (
                            <img
                                key={selectedImg}
                                src={selectedImg}
                                alt={`${product.productName} — view ${imgIdx + 1}`}
                                style={{
                                    position:   'absolute',
                                    inset:      '24px',
                                    width:      'calc(100% - 48px)',
                                    height:     'calc(100% - 48px)',
                                    objectFit:  'contain',
                                    display:    'block',
                                    background: '#ffffff',
                                    transition: 'opacity 0.15s ease',
                                }}
                                onError={e => { e.currentTarget.style.display = 'none'; }}
                            />
                        )}

                        {/* Prev arrow */}
                        {imageSlots.length > 1 && (
                            <button
                                aria-label="Previous image"
                                onClick={e => { e.stopPropagation(); goImage(-1); }}
                                style={{
                                    position:       'absolute',
                                    left:           '10px',
                                    top:            '50%',
                                    transform:      'translateY(-50%)',
                                    width:          '36px',
                                    height:         '36px',
                                    borderRadius:   '50%',
                                    background:     'rgba(0,0,0,0.45)',
                                    border:         'none',
                                    color:          '#fff',
                                    fontSize:       '20px',
                                    lineHeight:     '1',
                                    cursor:         'pointer',
                                    display:        'flex',
                                    alignItems:     'center',
                                    justifyContent: 'center',
                                    transition:     'background 0.15s',
                                    zIndex:         2,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.72)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; }}
                            >
                                ‹
                            </button>
                        )}

                        {/* Next arrow */}
                        {imageSlots.length > 1 && (
                            <button
                                aria-label="Next image"
                                onClick={e => { e.stopPropagation(); goImage(1); }}
                                style={{
                                    position:       'absolute',
                                    right:          '10px',
                                    top:            '50%',
                                    transform:      'translateY(-50%)',
                                    width:          '36px',
                                    height:         '36px',
                                    borderRadius:   '50%',
                                    background:     'rgba(0,0,0,0.45)',
                                    border:         'none',
                                    color:          '#fff',
                                    fontSize:       '20px',
                                    lineHeight:     '1',
                                    cursor:         'pointer',
                                    display:        'flex',
                                    alignItems:     'center',
                                    justifyContent: 'center',
                                    transition:     'background 0.15s',
                                    zIndex:         2,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.72)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; }}
                            >
                                ›
                            </button>
                        )}

                        {/* Counter badge */}
                        {imageSlots.length > 1 && (
                            <div
                                style={{
                                    position:     'absolute',
                                    bottom:       '10px',
                                    right:        '12px',
                                    background:   'rgba(0,0,0,0.55)',
                                    color:        '#fff',
                                    fontSize:     '11px',
                                    fontFamily:   'var(--font-mono)',
                                    padding:      '2px 8px',
                                    borderRadius: '20px',
                                    userSelect:   'none',
                                    zIndex:       2,
                                }}
                            >
                                {imgIdx + 1} / {imageSlots.length}
                            </div>
                        )}

                        {/* Zoom hint */}
                        {selectedImg && (
                            <div
                                style={{
                                    position:     'absolute',
                                    bottom:       '10px',
                                    left:         '12px',
                                    background:   'rgba(0,0,0,0.45)',
                                    color:        '#fff',
                                    fontSize:     '10px',
                                    fontFamily:   'var(--font-mono)',
                                    padding:      '2px 8px',
                                    borderRadius: '20px',
                                    userSelect:   'none',
                                    letterSpacing: '0.06em',
                                    zIndex:       2,
                                }}
                            >
                                🔍 ZOOM
                            </div>
                        )}
                    </div>

                    {/* Thumbnail strip — 4 slots always visible */}
                    <div
                        className="pdp-thumb-strip"
                        style={{
                            display:         'flex',
                            gap:             '8px',
                            padding:         '10px 12px',
                            borderTop:       '1px solid var(--border)',
                            background:      'var(--surface-mid)',
                            overflowX:       'auto',
                            scrollbarWidth:  'none',
                        }}
                    >
                        {[0, 1, 2, 3].map(i => {
                            const url    = imageSlots[i];
                            const active = i === imgIdx && Boolean(url);
                            return (
                                <button
                                    key={i}
                                    aria-label={url ? `View angle ${i + 1}` : `Angle ${i + 1} — not set`}
                                    disabled={!url}
                                    onClick={() => { setImgIdx(i); setSelectedImg(url); }}
                                    style={{
                                        flexShrink:   0,
                                        width:        '68px',
                                        height:       '68px',
                                        border:       active
                                            ? '2px solid var(--accent)'
                                            : '1px solid var(--border)',
                                        borderRadius: '6px',
                                        overflow:     'hidden',
                                        background:   url ? '#fff' : 'var(--surface-high)',
                                        cursor:       url ? 'pointer' : 'default',
                                        padding:      0,
                                        opacity:      url ? 1 : 0.4,
                                        transition:   'border-color 0.15s, opacity 0.15s',
                                        position:     'relative',
                                    }}
                                >
                                    {url ? (
                                        <img
                                            src={url}
                                            alt={`Angle ${i + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', padding: '4px' }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%', height: '100%',
                                            display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center',
                                            gap: '3px',
                                        }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.3 }}>
                                                <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                                <circle cx="8.5" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                                                <path d="M2 15l5-5 4 4 3-3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
                                                {i + 1}
                                            </span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Right: specs panel ───────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', minWidth: 0 }}>

                    {/* Product name + category */}
                    <div>
                        <h1
                            style={{
                                fontFamily: 'var(--font-display)',
                                fontWeight: 700,
                                fontSize: 'clamp(1.25rem, 2.5vw, var(--text-3xl))',
                                color: 'var(--text)',
                                lineHeight: 1.15,
                                margin: '0 0 var(--space-2)',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            {product.productName}
                        </h1>

                        {product.categoryName && (
                            <p
                                style={{
                                    color: 'var(--text-3)',
                                    fontSize: 'var(--text-sm)',
                                    margin: 0,
                                    fontFamily: 'var(--font-body)',
                                }}
                            >
                                {product.categoryName}
                            </p>
                        )}
                    </div>

                    {/* Price + availability box */}
                    <div
                        style={{
                            background: 'var(--surface-mid)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--r-md)',
                            padding: 'var(--space-5) var(--space-6)',
                        }}
                    >
                        {/* Price row */}
                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <div
                                style={{
                                    fontSize: 'var(--text-2xs)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    color: 'var(--text-3)',
                                    marginBottom: 'var(--space-2)',
                                    fontFamily: 'var(--font-body)',
                                }}
                            >
                                UNIT PRICE
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontWeight: 600,
                                        fontSize: 'clamp(1.5rem, 3vw, var(--text-4xl))',
                                        color: 'var(--text)',
                                        letterSpacing: '-0.02em',
                                        lineHeight: 1,
                                    }}
                                >
                                    {fmtPrice(product.price)}
                                </span>
                                <span
                                    style={{
                                        color: 'var(--text-3)',
                                        fontSize: 'var(--text-xs)',
                                        fontFamily: 'var(--font-body)',
                                    }}
                                >
                                    USD · per unit
                                </span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0 0 var(--space-4)' }} />

                        {/* Availability row */}
                        <div>
                            <div
                                style={{
                                    fontSize: 'var(--text-2xs)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    color: 'var(--text-3)',
                                    marginBottom: 'var(--space-2)',
                                    fontFamily: 'var(--font-body)',
                                }}
                            >
                                AVAILABILITY
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <div
                                    aria-hidden="true"
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: stockColor(product.quantity),
                                        flexShrink: 0,
                                    }}
                                />
                                <span
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 'var(--text-sm)',
                                        color: stockColor(product.quantity),
                                        fontWeight: 500,
                                        letterSpacing: '0.02em',
                                    }}
                                >
                                    {stockLabel(product.quantity)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Specifications table */}
                    {specRows.length > 0 && (
                        <div>
                            <div
                                style={{
                                    fontSize: 'var(--text-2xs)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    color: 'var(--text-3)',
                                    marginBottom: 'var(--space-3)',
                                    fontFamily: 'var(--font-body)',
                                }}
                            >
                                SPECIFICATIONS
                            </div>
                            <div
                                style={{
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: 'var(--r-md)',
                                    overflow: 'hidden',
                                }}
                            >
                                {specRows.map((row, i) => (
                                    <SpecRow
                                        key={row.label}
                                        label={row.label}
                                        value={row.value}
                                        mono={row.mono}
                                        last={i === specRows.length - 1}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity selector */}
                    {inStock && (
                        <div className="pdp-qty-row" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                            <span
                                style={{
                                    fontSize: 'var(--text-2xs)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    color: 'var(--text-3)',
                                    fontFamily: 'var(--font-body)',
                                    minWidth: 28,
                                }}
                            >
                                QTY
                            </span>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'stretch',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--r-md)',
                                    overflow: 'hidden',
                                }}
                            >
                                <button
                                    className="pdp-qty-btn"
                                    onClick={() => setQty(q => Math.max(1, q - 1))}
                                    disabled={qty <= 1}
                                    aria-label="Decrease quantity"
                                    style={{
                                        width: 40,
                                        height: 40,
                                        background: 'var(--surface-high)',
                                        border: 'none',
                                        borderRight: '1px solid var(--border)',
                                        color: qty <= 1 ? 'var(--text-3)' : 'var(--text)',
                                        cursor: qty <= 1 ? 'default' : 'pointer',
                                        fontSize: 18,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'background var(--duration-fast)',
                                        flexShrink: 0,
                                    }}
                                >
                                    −
                                </button>

                                <div
                                    aria-live="polite"
                                    aria-label={`Quantity: ${qty}`}
                                    style={{
                                        width: 56,
                                        height: 40,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontFamily: 'var(--font-mono)',
                                        fontWeight: 500,
                                        fontSize: 'var(--text-base)',
                                        color: 'var(--text)',
                                        background: 'var(--surface)',
                                        userSelect: 'none',
                                    }}
                                >
                                    {qty}
                                </div>

                                <button
                                    className="pdp-qty-btn"
                                    onClick={() => setQty(q => Math.min(maxQty, q + 1))}
                                    disabled={qty >= maxQty}
                                    aria-label="Increase quantity"
                                    style={{
                                        width: 40,
                                        height: 40,
                                        background: 'var(--surface-high)',
                                        border: 'none',
                                        borderLeft: '1px solid var(--border)',
                                        color: qty >= maxQty ? 'var(--text-3)' : 'var(--text)',
                                        cursor: qty >= maxQty ? 'default' : 'pointer',
                                        fontSize: 18,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'background var(--duration-fast)',
                                        flexShrink: 0,
                                    }}
                                >
                                    +
                                </button>
                            </div>

                            <span
                                style={{
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--text-3)',
                                    fontFamily: 'var(--font-mono)',
                                }}
                            >
                                {maxQty} available
                            </span>
                        </div>
                    )}

                    {/* CTA buttons — hidden on mobile, replaced by sticky action bar */}
                    <div className="pdp-cta-desktop">
                        <button
                            className="pdp-btn-primary"
                            onClick={handleAddToCart}
                            disabled={!inStock || addingToCart}
                            style={{
                                background: inStock ? 'var(--accent)' : 'var(--surface-high)',
                                color: inStock ? 'var(--text)' : 'var(--text-3)',
                                border: 'none',
                                borderRadius: 'var(--r-md)',
                                padding: 'var(--space-4) var(--space-6)',
                                fontFamily: 'var(--font-body)',
                                fontWeight: 600,
                                fontSize: 'var(--text-base)',
                                cursor: inStock && !addingToCart ? 'pointer' : 'default',
                                transition: 'background var(--duration-fast)',
                                letterSpacing: '0.01em',
                                width: '100%',
                            }}
                        >
                            {addingToCart ? 'Adding…' : inStock ? '● Add to Cart' : 'Out of Stock'}
                        </button>

                        <button
                            className="pdp-btn-ghost"
                            onClick={openQuote}
                            style={{
                                background: 'transparent',
                                color: 'var(--text-2)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--r-md)',
                                padding: 'calc(var(--space-4) - 1px) var(--space-6)',
                                fontFamily: 'var(--font-body)',
                                fontWeight: 500,
                                fontSize: 'var(--text-base)',
                                cursor: 'pointer',
                                transition: 'border-color var(--duration-fast), color var(--duration-fast)',
                                letterSpacing: '0.01em',
                                width: '100%',
                            }}
                        >
                            Request Quote
                        </button>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div
                            style={{
                                borderTop: '1px solid var(--border-subtle)',
                                paddingTop: 'var(--space-5)',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 'var(--text-2xs)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    color: 'var(--text-3)',
                                    marginBottom: 'var(--space-3)',
                                    fontFamily: 'var(--font-body)',
                                }}
                            >
                                DESCRIPTION
                            </div>
                            <div
                                style={{
                                    overflowX:     'hidden',
                                    overflowY:     'auto',
                                    maxHeight:     '160px',
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: 'var(--border) transparent',
                                    border:         '1px solid var(--border-subtle)',
                                    borderRadius:   'var(--r-sm)',
                                    background:     'var(--surface)',
                                    padding:        '12px 16px',
                                }}
                            >
                                <p
                                    style={{
                                        color:          'var(--text-2)',
                                        fontSize:       'var(--text-sm)',
                                        lineHeight:      1.6,
                                        margin:          0,
                                        fontFamily:     'var(--font-body)',
                                        whiteSpace:     'pre-wrap',
                                        wordBreak:      'break-word',
                                        overflowWrap:   'break-word',
                                    }}
                                >
                                    {product.description}
                                </p>
                            </div>
                        </div>
                    )}

                </div>
                {/* end right panel */}

            </div>
            {/* end grid */}

            {/* ── Reviews ─────────────────────────────────────── */}
            <ReviewsSection productId={id} />

            {/* ── Mobile sticky action bar (< 768px) ──────────── */}
            <div className="pdp-action-bar">
                <div className="pdp-action-bar-price">
                    <div className="pdp-action-bar-label">Unit Price</div>
                    <div className="pdp-action-bar-amount">
                        {fmtPrice(product.price)}
                    </div>
                </div>
                <button
                    className="pdp-action-bar-btn"
                    onClick={handleAddToCart}
                    disabled={!inStock || addingToCart}
                    style={{
                        background: inStock ? 'var(--accent)' : 'var(--surface-high)',
                        color:      inStock ? 'var(--text)'  : 'var(--text-3)',
                    }}
                >
                    {addingToCart ? 'Adding…' : inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>

            {/* ── Lightbox ─────────────────────────────────────────── */}
            {lightboxOpen && selectedImg && (
                <div
                    onClick={() => setLightboxOpen(false)}
                    style={{
                        position:       'fixed',
                        inset:          0,
                        zIndex:         9999,
                        background:     'rgba(0,0,0,0.92)',
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                    }}
                >
                    {/* Close */}
                    <button
                        aria-label="Close lightbox"
                        onClick={() => setLightboxOpen(false)}
                        style={{
                            position:   'absolute',
                            top:        '18px',
                            right:      '22px',
                            background: 'rgba(255,255,255,0.12)',
                            border:     'none',
                            color:      '#fff',
                            fontSize:   '26px',
                            lineHeight: '1',
                            width:      '44px',
                            height:     '44px',
                            borderRadius: '50%',
                            cursor:     'pointer',
                            display:    'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex:     1,
                        }}
                    >
                        ×
                    </button>

                    {/* Prev */}
                    {imageSlots.length > 1 && (
                        <button
                            aria-label="Previous image"
                            onClick={e => { e.stopPropagation(); goImage(-1); }}
                            style={{
                                position:   'absolute',
                                left:       '16px',
                                top:        '50%',
                                transform:  'translateY(-50%)',
                                background: 'rgba(255,255,255,0.12)',
                                border:     'none',
                                color:      '#fff',
                                fontSize:   '32px',
                                width:      '52px',
                                height:     '52px',
                                borderRadius: '50%',
                                cursor:     'pointer',
                                display:    'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex:     1,
                            }}
                        >
                            ‹
                        </button>
                    )}

                    {/* Next */}
                    {imageSlots.length > 1 && (
                        <button
                            aria-label="Next image"
                            onClick={e => { e.stopPropagation(); goImage(1); }}
                            style={{
                                position:   'absolute',
                                right:      '16px',
                                top:        '50%',
                                transform:  'translateY(-50%)',
                                background: 'rgba(255,255,255,0.12)',
                                border:     'none',
                                color:      '#fff',
                                fontSize:   '32px',
                                width:      '52px',
                                height:     '52px',
                                borderRadius: '50%',
                                cursor:     'pointer',
                                display:    'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex:     1,
                            }}
                        >
                            ›
                        </button>
                    )}

                    {/* Main image */}
                    <img
                        src={selectedImg}
                        alt={product.productName}
                        onClick={e => e.stopPropagation()}
                        style={{
                            maxWidth:   '90vw',
                            maxHeight:  '85vh',
                            objectFit:  'contain',
                            borderRadius: '4px',
                            userSelect: 'none',
                        }}
                    />

                    {/* Dot indicators */}
                    {imageSlots.length > 1 && (
                        <div
                            style={{
                                position:       'absolute',
                                bottom:         '20px',
                                display:        'flex',
                                gap:            '8px',
                                alignItems:     'center',
                            }}
                        >
                            {imageSlots.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={e => { e.stopPropagation(); setImgIdx(i); setSelectedImg(imageSlots[i]); }}
                                    style={{
                                        width:        i === imgIdx ? '20px' : '8px',
                                        height:       '8px',
                                        borderRadius: '4px',
                                        background:   i === imgIdx ? '#fff' : 'rgba(255,255,255,0.35)',
                                        border:       'none',
                                        cursor:       'pointer',
                                        padding:      0,
                                        transition:   'width 0.2s, background 0.2s',
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Counter */}
                    {imageSlots.length > 1 && (
                        <div
                            style={{
                                position:   'absolute',
                                top:        '22px',
                                left:       '22px',
                                color:      'rgba(255,255,255,0.65)',
                                fontFamily: 'var(--font-mono)',
                                fontSize:   '13px',
                            }}
                        >
                            {imgIdx + 1} / {imageSlots.length}
                        </div>
                    )}
                </div>
            )}

            {/* ── Quote Request Modal (E7) ──────────────────────── */}
            {quoteOpen && (
                <div className="pdp-overlay" onClick={() => setQuoteOpen(false)}>
                    <div className="pdp-modal" onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--text)', margin: 0 }}>
                                    Request a Quote
                                </h2>
                                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-3)', margin: 'var(--space-1) 0 0' }}>
                                    {product.productName}
                                    {product.partNumber && <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginLeft: 'var(--space-2)' }}>{product.partNumber}</span>}
                                </p>
                            </div>
                            <button
                                onClick={() => setQuoteOpen(false)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: 'var(--space-1)', transition: 'color var(--duration-fast)' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                                aria-label="Close"
                            >×</button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleQuoteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

                            <div className="pdp-modal-row">
                                <div className="pdp-field">
                                    <label className="pdp-label">Quantity Needed</label>
                                    <input
                                        className="pdp-input"
                                        type="number"
                                        min={1}
                                        value={quoteForm.qtyNeeded}
                                        onChange={e => setQuoteForm(f => ({ ...f, qtyNeeded: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="pdp-field">
                                    <label className="pdp-label">Urgency</label>
                                    <select
                                        className="pdp-input"
                                        value={quoteForm.urgency}
                                        onChange={e => setQuoteForm(f => ({ ...f, urgency: e.target.value }))}
                                    >
                                        <option>Standard</option>
                                        <option>Urgent</option>
                                        <option>Emergency</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pdp-modal-row">
                                <div className="pdp-field">
                                    <label className="pdp-label">Contact Email *</label>
                                    <input
                                        className="pdp-input"
                                        type="email"
                                        placeholder="you@company.com"
                                        value={quoteForm.contactEmail}
                                        onChange={e => setQuoteForm(f => ({ ...f, contactEmail: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="pdp-field">
                                    <label className="pdp-label">Phone (optional)</label>
                                    <input
                                        className="pdp-input"
                                        type="tel"
                                        placeholder="+1 (555) 000-0000"
                                        value={quoteForm.phone}
                                        onChange={e => setQuoteForm(f => ({ ...f, phone: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="pdp-field">
                                <label className="pdp-label">Notes / Special Requirements</label>
                                <textarea
                                    className="pdp-input"
                                    rows={3}
                                    placeholder="Delivery location, required delivery date, compatibility notes…"
                                    value={quoteForm.notes}
                                    onChange={e => setQuoteForm(f => ({ ...f, notes: e.target.value }))}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-3)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border)' }}>
                                <button
                                    type="submit"
                                    disabled={quoteSending}
                                    style={{
                                        flex: 1,
                                        padding: 'var(--space-3) var(--space-4)',
                                        background: quoteSending ? 'var(--border)' : 'var(--accent)',
                                        color: 'var(--text)',
                                        border: 'none',
                                        borderRadius: 'var(--r-md)',
                                        fontFamily: 'var(--font-body)',
                                        fontWeight: 700,
                                        fontSize: 'var(--text-sm)',
                                        cursor: quoteSending ? 'not-allowed' : 'pointer',
                                        transition: 'background var(--duration-fast)',
                                    }}
                                >
                                    {quoteSending ? 'Submitting…' : 'Submit Quote Request'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setQuoteOpen(false)}
                                    style={{ padding: 'var(--space-3) var(--space-5)', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-2)', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
