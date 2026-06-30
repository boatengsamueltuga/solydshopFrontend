import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import api from "../../api/api";
import toast from "react-hot-toast";

/* ── Star display (read-only) ─────────────────────────────────── */
function Stars({ rating, size = 16 }) {
    const full    = Math.floor(rating);
    const partial = rating - full;
    return (
        <span style={{ display: "inline-flex", gap: "2px", alignItems: "center" }} aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map(n => {
                const fill = n <= full ? 1 : n === full + 1 && partial > 0 ? partial : 0;
                return (
                    <svg key={n} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
                        <defs>
                            <linearGradient id={`sf-${n}-${size}`}>
                                <stop offset={`${fill * 100}%`} stopColor="var(--accent)" />
                                <stop offset={`${fill * 100}%`} stopColor="var(--border)" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M10 1l2.39 5.26L18 7.27l-4 3.9.94 5.5L10 14.1 5.06 16.67 6 11.17 2 7.27l5.61-.99z"
                            fill={`url(#sf-${n}-${size})`}
                        />
                    </svg>
                );
            })}
        </span>
    );
}

/* ── Star input (interactive) ─────────────────────────────────── */
function StarInput({ value, onChange }) {
    const [hover, setHover] = useState(0);
    return (
        <span style={{ display: "inline-flex", gap: "4px" }} role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map(n => (
                <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={value === n}
                    aria-label={`${n} star${n !== 1 ? "s" : ""}`}
                    onClick={() => onChange(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", lineHeight: 0 }}
                >
                    <svg width={28} height={28} viewBox="0 0 20 20" aria-hidden="true">
                        <path
                            d="M10 1l2.39 5.26L18 7.27l-4 3.9.94 5.5L10 14.1 5.06 16.67 6 11.17 2 7.27l5.61-.99z"
                            fill={n <= (hover || value) ? "var(--accent)" : "var(--border)"}
                            style={{ transition: "fill 0.1s" }}
                        />
                    </svg>
                </button>
            ))}
        </span>
    );
}

/* ── Rating distribution bar ──────────────────────────────────── */
function DistBar({ label, count, total, onClick, active }) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "none", border: "none", padding: "2px 0",
                cursor: "pointer", width: "100%", textAlign: "left",
            }}
        >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: active ? "var(--accent)" : "var(--text-3)", minWidth: "10px", fontWeight: active ? 700 : 400 }}>
                {label}
            </span>
            <div style={{ flex: 1, height: "6px", borderRadius: "999px", background: "var(--surface-high)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: active ? "var(--accent)" : "var(--border-mid)", borderRadius: "999px", transition: "width 0.3s" }} />
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-3)", minWidth: "20px", textAlign: "right" }}>
                {count}
            </span>
        </button>
    );
}

/* ── Review card ──────────────────────────────────────────────── */
function ReviewCard({ review }) {
    const date = review.createdAt
        ? new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : null;
    return (
        <div style={{ padding: "var(--space-4) 0", borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-3)", flexWrap: "wrap", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        background: "var(--surface-high)", border: "1px solid var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "12px", color: "var(--text-3)", flexShrink: 0,
                    }}>
                        {(review.userName ?? "U")[0].toUpperCase()}
                    </div>
                    <div>
                        <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "13px", color: "var(--text)", margin: 0 }}>
                            {review.userName ?? "Anonymous"}
                        </p>
                        {review.verifiedPurchase && (
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--success)", fontWeight: 600, letterSpacing: "0.04em" }}>
                                ✓ VERIFIED PURCHASE
                            </span>
                        )}
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                    <Stars rating={review.rating} size={13} />
                    {date && <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-4)" }}>{date}</span>}
                </div>
            </div>
            {review.comment && (
                <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-2)", lineHeight: 1.6, margin: 0 }}>
                    {review.comment}
                </p>
            )}
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   ReviewsSection
   ════════════════════════════════════════════════════════════════ */
const PAGE_SIZE = 5;

export default function ReviewsSection({ productId }) {
    const { isAuthenticated, user } = useSelector(s => s.auth);

    const [reviews,     setReviews]     = useState([]);
    const [avgRating,   setAvgRating]   = useState(0);
    const [loading,     setLoading]     = useState(true);
    const [filterStar,  setFilterStar]  = useState(0);
    const [page,        setPage]        = useState(0);

    const [formRating,  setFormRating]  = useState(0);
    const [formComment, setFormComment] = useState("");
    const [submitting,  setSubmitting]  = useState(false);
    const [submitted,   setSubmitted]   = useState(false);
    const [formError,   setFormError]   = useState("");

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/public/reviews/product/${productId}`, { silent: true });
            const list = Array.isArray(data) ? data : (data.reviews ?? []);
            setReviews(list);
            if (list.length > 0) {
                setAvgRating(
                    data.averageRating
                        ?? (list.reduce((s, r) => s + r.rating, 0) / list.length)
                );
            }
        } catch {
            /* reviews not critical — fail silently */
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    /* Check if current user already reviewed */
    const alreadyReviewed = reviews.some(r => r.userId === user?.userId);

    /* Filtered + paged */
    const filtered   = filterStar === 0 ? reviews : reviews.filter(r => r.rating === filterStar);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paged      = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    /* Distribution counts */
    const dist = [5, 4, 3, 2, 1].map(n => ({
        n, count: reviews.filter(r => r.rating === n).length,
    }));

    const handleFilterStar = (n) => {
        setFilterStar(prev => prev === n ? 0 : n);
        setPage(0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        if (formRating === 0) { setFormError("Please select a star rating."); return; }
        setSubmitting(true);
        try {
            await api.post("/reviews", {
                productId,
                rating:  formRating,
                comment: formComment.trim() || null,
            }, { silent: true });
            toast.success("Review submitted — thank you!");
            setSubmitted(true);
            setFormRating(0);
            setFormComment("");
            await fetchReviews();
        } catch (err) {
            const msg = err?.response?.data?.message ?? "Failed to submit review. Please try again.";
            setFormError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section style={{ marginTop: "var(--space-10)", borderTop: "1px solid var(--border)", paddingTop: "var(--space-8)" }}>

            {/* Section heading */}
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-xl)", color: "var(--text)", margin: "0 0 var(--space-6)", letterSpacing: "-0.01em" }}>
                Customer Reviews
            </h2>

            {loading ? (
                <p style={{ color: "var(--text-3)", fontFamily: "var(--font-body)", fontSize: "14px" }}>Loading reviews…</p>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "var(--space-8)" }}>

                    {/* ── Summary + distribution ── */}
                    {reviews.length > 0 && (
                        <div style={{ display: "flex", gap: "var(--space-8)", flexWrap: "wrap", alignItems: "flex-start" }}>
                            {/* Average score */}
                            <div style={{ textAlign: "center", minWidth: "100px" }}>
                                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "48px", color: "var(--text)", lineHeight: 1 }}>
                                    {avgRating.toFixed(1)}
                                </div>
                                <Stars rating={avgRating} size={18} />
                                <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-3)", margin: "4px 0 0", letterSpacing: "0.04em" }}>
                                    {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                                </p>
                            </div>

                            {/* Distribution bars */}
                            <div style={{ flex: 1, minWidth: "180px", display: "flex", flexDirection: "column", gap: "4px", justifyContent: "center" }}>
                                {dist.map(({ n, count }) => (
                                    <DistBar
                                        key={n}
                                        label={`${n}★`}
                                        count={count}
                                        total={reviews.length}
                                        active={filterStar === n}
                                        onClick={() => handleFilterStar(n)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Write a review ── */}
                    {isAuthenticated && !alreadyReviewed && !submitted && (
                        <div style={{ background: "var(--surface-mid)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "var(--space-5)" }}>
                            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", margin: "0 0 var(--space-4)" }}>
                                Write a Review
                            </p>
                            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                                <div>
                                    <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-2)", margin: "0 0 var(--space-2)" }}>Your rating</p>
                                    <StarInput value={formRating} onChange={setFormRating} />
                                </div>
                                <div>
                                    <label style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-2)", display: "block", marginBottom: "var(--space-2)" }}>
                                        Your review <span style={{ color: "var(--text-4)" }}>(optional)</span>
                                    </label>
                                    <textarea
                                        value={formComment}
                                        onChange={e => setFormComment(e.target.value)}
                                        rows={3}
                                        placeholder="Share your experience with this product…"
                                        maxLength={1000}
                                        style={{
                                            width: "100%", boxSizing: "border-box",
                                            background: "var(--surface)", border: "1px solid var(--border)",
                                            borderRadius: "var(--r-sm)", padding: "10px 12px",
                                            color: "var(--text)", fontFamily: "var(--font-body)", fontSize: "13px",
                                            lineHeight: 1.6, resize: "vertical", outline: "none",
                                            transition: "border-color var(--duration-fast)",
                                        }}
                                        onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
                                        onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
                                    />
                                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-4)", margin: "4px 0 0", textAlign: "right" }}>
                                        {formComment.length}/1000
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{
                                        alignSelf: "flex-start",
                                        padding: "var(--space-3) var(--space-6)",
                                        background: submitting ? "var(--border)" : "var(--accent)",
                                        color: "var(--text)", border: "none",
                                        borderRadius: "var(--r-md)",
                                        fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "13px",
                                        cursor: submitting ? "not-allowed" : "pointer",
                                        transition: "background var(--duration-fast)",
                                    }}
                                >
                                    {submitting ? "Submitting…" : "Submit Review"}
                                </button>
                                {formError && (
                                    <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--error)", margin: "var(--space-2) 0 0" }}>{formError}</p>
                                )}
                            </form>
                        </div>
                    )}

                    {submitted && (
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--success)", fontWeight: 600 }}>
                            ✓ Your review has been submitted.
                        </p>
                    )}

                    {alreadyReviewed && !submitted && (
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-3)" }}>
                            You have already reviewed this product.
                        </p>
                    )}

                    {!isAuthenticated && (
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-3)" }}>
                            <a href="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>Sign in</a> to leave a review.
                        </p>
                    )}

                    {/* ── Reviews list ── */}
                    <div>
                        {filterStar > 0 && (
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-3)" }}>
                                    Showing {filterStar}★ reviews ({filtered.length})
                                </span>
                                <button
                                    onClick={() => { setFilterStar(0); setPage(0); }}
                                    style={{ background: "none", border: "none", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--accent)", cursor: "pointer", padding: 0, fontWeight: 600 }}
                                >
                                    Clear filter ×
                                </button>
                            </div>
                        )}

                        {filtered.length === 0 ? (
                            <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-3)" }}>
                                {reviews.length === 0 ? "No reviews yet. Be the first to review this product." : "No reviews for this star rating."}
                            </p>
                        ) : (
                            <>
                                {paged.map((r, i) => <ReviewCard key={r.reviewId ?? i} review={r} />)}

                                {totalPages > 1 && (
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "var(--space-4)", marginTop: "var(--space-2)" }}>
                                        <button
                                            onClick={() => setPage(p => Math.max(0, p - 1))}
                                            disabled={page === 0}
                                            style={{ background: "none", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "6px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 600, color: page === 0 ? "var(--text-4)" : "var(--text-2)", cursor: page === 0 ? "not-allowed" : "pointer" }}
                                        >
                                            ← Prev
                                        </button>
                                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-3)" }}>
                                            {page + 1} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                            disabled={page >= totalPages - 1}
                                            style={{ background: "none", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "6px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 600, color: page >= totalPages - 1 ? "var(--text-4)" : "var(--text-2)", cursor: page >= totalPages - 1 ? "not-allowed" : "pointer" }}
                                        >
                                            Next →
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                </div>
            )}
        </section>
    );
}
