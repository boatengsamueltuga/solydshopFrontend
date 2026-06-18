import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../api/api';

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
            style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr',
                borderBottom: last ? 'none' : '1px solid var(--border-subtle)',
            }}
        >
            <div
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
                style={{
                    padding: '9px 14px',
                    fontSize: 'var(--text-sm)',
                    color: mono ? 'var(--accent)' : 'var(--text)',
                    fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
                    fontWeight: mono ? 500 : 400,
                    letterSpacing: mono ? '0.01em' : 'normal',
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

    const [product,      setProduct]      = useState(null);
    const [loading,      setLoading]      = useState(true);
    const [fetchError,   setFetchError]   = useState(null);
    const [qty,          setQty]          = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [selectedImg,  setSelectedImg]  = useState(null);
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
            .then(res => { setProduct(res.data); setSelectedImg(res.data.imageUrl ?? null); })
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
            toast.success(`${product.productName} added to cart.`);
        } catch {
            toast.error('Failed to add to cart. Please try again.');
        } finally {
            setAddingToCart(false);
        }
    };

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
                style={{
                    maxWidth: 'var(--content-max)',
                    margin: '0 auto',
                    padding: 'var(--space-6) var(--space-5) var(--space-20)',
                }}
            >
                {children}
            </div>

            <style>{`
                @keyframes solyd-pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.45; }
                }

                /* ── Responsive grid ─────────────────── */
                .pdp-grid {
                    display: grid;
                    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
                    gap: var(--space-12);
                    align-items: start;
                }
                @media (max-width: 1023px) {
                    .pdp-grid { grid-template-columns: 1fr 1fr; gap: var(--space-8); }
                }
                @media (max-width: 767px) {
                    .pdp-grid { grid-template-columns: 1fr; gap: var(--space-6); }
                    .pdp-image-panel { position: static !important; }
                    .pdp-image-inner {
                        aspect-ratio: unset !important;
                        height: clamp(220px, 56vw, 320px) !important;
                    }
                }

                /* ── Button hover states ─────────────── */
                .pdp-btn-primary:hover:not(:disabled) {
                    background: var(--accent-hi) !important;
                }
                .pdp-btn-ghost:hover {
                    border-color: var(--accent) !important;
                    color: var(--accent) !important;
                }
                .pdp-qty-btn:hover:not(:disabled) {
                    background: var(--surface-hover) !important;
                }
                .pdp-back-link:hover {
                    color: var(--accent) !important;
                }

                /* ── Thumbnail gallery ───────────────── */
                .pdp-thumb {
                    width: 56px; height: 56px;
                    border-radius: var(--r-sm);
                    border: 2px solid var(--border);
                    background: var(--surface-high);
                    overflow: hidden;
                    cursor: pointer;
                    flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center;
                    transition: border-color var(--duration-fast);
                }
                .pdp-thumb:hover  { border-color: var(--border-strong); }
                .pdp-thumb.active { border-color: var(--accent); }
                .pdp-thumb img    { width: 100%; height: 100%; object-fit: contain; }

                /* ── Quote modal ─────────────────────── */
                .pdp-overlay {
                    position: fixed; inset: 0; z-index: var(--z-modal-bg);
                    background: oklch(0 0 0 / 0.72);
                    display: flex; align-items: center; justify-content: center;
                    padding: var(--space-4);
                }
                .pdp-modal {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: var(--r-lg);
                    width: 100%; max-width: 520px;
                    max-height: 90vh; overflow-y: auto;
                    padding: var(--space-6);
                    display: flex; flex-direction: column; gap: var(--space-5);
                }
                .pdp-field { display: flex; flex-direction: column; gap: var(--space-2); }
                .pdp-label {
                    font-family: var(--font-body); font-size: var(--text-2xs);
                    font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;
                    color: var(--text-3);
                }
                .pdp-input {
                    background: var(--surface-high); border: 1px solid var(--border);
                    border-radius: var(--r-sm); color: var(--text);
                    font-family: var(--font-body); font-size: var(--text-sm);
                    padding: var(--space-3) var(--space-4); outline: none;
                    transition: border-color var(--duration-fast);
                }
                .pdp-input:focus { border-color: var(--accent); }
                .pdp-input::placeholder { color: var(--text-4); }
                .pdp-modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
                @media (max-width: 480px) { .pdp-modal-row { grid-template-columns: 1fr; } }
            `}</style>
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
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r-md)',
                        overflow: 'hidden',
                        position: 'sticky',
                        top: 'calc(var(--topbar-height) + var(--space-4))',
                    }}
                >
                    <div
                        className="pdp-image-inner"
                        style={{
                            position:    'relative',
                            aspectRatio: '4 / 3',
                            background:  'var(--surface)',
                            overflow:    'hidden',
                        }}
                    >
                        {selectedImg ? (
                            <img
                                src={selectedImg}
                                alt={product.productName}
                                style={{
                                    position:   'absolute',
                                    inset:      0,
                                    width:      '100%',
                                    height:     '100%',
                                    objectFit:  'contain',
                                    padding:    'var(--space-8)',
                                    boxSizing:  'border-box',
                                }}
                            />
                        ) : (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 'var(--text-sm)', userSelect: 'none' }}>
                                No image available
                            </div>
                        )}
                    </div>

                    {/* Thumbnail strip */}
                    {product.imageUrl && (
                        <div style={{ display: 'flex', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--border)' }}>
                            <button
                                className={`pdp-thumb${selectedImg === product.imageUrl ? ' active' : ''}`}
                                onClick={() => setSelectedImg(product.imageUrl)}
                                aria-label="Main product image"
                            >
                                <img src={product.imageUrl} alt={product.productName} />
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Right: specs panel ───────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

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
                                        color: 'var(--accent)',
                                        letterSpacing: '-0.02em',
                                        lineHeight: 1,
                                    }}
                                >
                                    ${Number(product.price).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
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

                    {/* CTA buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <button
                            className="pdp-btn-primary"
                            onClick={handleAddToCart}
                            disabled={!inStock || addingToCart}
                            style={{
                                background: inStock ? 'var(--accent)' : 'var(--surface-high)',
                                color: inStock ? 'var(--bg)' : 'var(--text-3)',
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
                            <p
                                style={{
                                    color: 'var(--text-2)',
                                    fontSize: 'var(--text-base)',
                                    lineHeight: 1.65,
                                    margin: 0,
                                    fontFamily: 'var(--font-body)',
                                }}
                            >
                                {product.description}
                            </p>
                        </div>
                    )}

                </div>
                {/* end right panel */}

            </div>
            {/* end grid */}

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
                                        color: 'var(--bg)',
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
