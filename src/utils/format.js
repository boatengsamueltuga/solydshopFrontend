/**
 * Compact number formatter — attaches K / M suffix for display in
 * space-constrained contexts (stat cards, list/grid columns).
 * Use fmtPrice for full-precision contexts (checkout, detail panels).
 */
export function fmtCompact(n) {
    const num = Number(n);
    if (isNaN(num)) return String(n);
    const abs = Math.abs(num);
    if (abs >= 1_000_000) return `${+(num / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000)     return `${+(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Compact currency — prefixes fmtCompact with $ */
export function fmtCurrency(n) {
    return `$${fmtCompact(n)}`;
}

/** Full-precision currency — for checkout, cart totals, detail panels */
export function fmtPrice(n) {
    return `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
