# SolydShop UI/UX Overhaul — Phase Plan

**Goal:** Production-ready enterprise e-commerce UI.  
**Rules:** UI/UX only — no logic, API, Redux, auth, or backend changes.  
**Theme:** Sage & caramel light — `#ccd5ae · #e9edc9 · #fefae0 · #faedcd · #d4a373`

---

## Phase 1 — Button Contrast (WCAG AA) ✅ DONE

Fixed `color: "var(--bg)"` (cream) → `color: "var(--text)"` (dark brown) on every
button/link with `background: "var(--accent)"` (caramel). Old: 2.1:1 (fail). New: ~5.8:1 (pass).

| File | Fixed |
|------|-------|
| `pages/HomePage.jsx` | Apply Filters, Try Again, Quick View, Add to Cart, Checkout |
| `pages/CartPage.jsx` | Browse Catalog, Proceed to Checkout |
| `pages/CheckoutPage.jsx` | Step indicator, Pay button, CircularProgress, Continue to Payment |
| `pages/LoginPage.jsx` | Sign In |
| `pages/RegisterPage.jsx` | Create Account |
| `pages/ForgotPasswordPage.jsx` | Send Reset Link |
| `pages/ResetPasswordPage.jsx` | Reset Password |
| `pages/NotFoundPage.jsx` | Back to Home |
| `pages/OrdersPage.jsx` | Browse Catalog (empty state) |
| `pages/OrderConfirmationPage.jsx` | View Orders |
| `pages/UserAccountPage.jsx` | My Orders |
| `pages/SellerDashboardPage.jsx` | Add Product |
| `pages/ProductDetailPage.jsx` | Add to Cart (desktop, sticky bar, quote modal) |
| `pages/SellerProductFormPage.jsx` | Submit (fixed prior session) |

---

## Phase 2 — Navigation & Auxiliary ✅ DONE

| File | Change |
|------|--------|
| `components/navigation/AppSidebar.jsx` | Logout hover `#f87171` → `var(--error)` |
| `components/Navbar.jsx` | Mobile logout `#f87171` → `var(--error)` |
| `utils/confirmToast.jsx` | Dark-theme colors → light-theme CSS variables |
| `components/ProtectedRoute.jsx` | Plain "Loading..." → themed spinner |

---

## Phase 3 — Admin Pages ✅ DONE

Pages: `AdminDashboardPage`, `AdminProductsPage`, `AdminOrdersPage`, `AdminCategoriesPage`, `AdminUsersPage`

- [x] Verify DataGrid/table header backgrounds use `--surface-mid` — confirmed via MUI theme
- [x] Add `PageBanner` component (icon + title + subtitle) to each page — full-bleed via -24px negative margins
- [x] Remove any remaining hardcoded colors or dark-theme artifacts — all pages use CSS vars
- [x] Improve stat cards (accent border-top, icon treatment) — `borderTop: "3px solid var(--accent)"` added
- [x] Fix side-stripe border violations — `borderLeft` → `borderTop` in AdminOrders + AdminUsers SheetPanel cards
- [x] Confirm form dialogs / SheetPanel match light theme — verified, all use semantic vars

---

## Phase 4 — Customer Experience ✅ DONE

Pages: `CartPage`, `CheckoutPage`, `OrdersPage`, `UserAccountPage`, `OrderConfirmationPage`

- [x] `CartPage` — "Updating cart…" text `var(--accent)` → `var(--text)` (contrast fix on accent-subtle bg)
- [x] `CheckoutPage` — Stripe Elements `theme: "night"` kept intentionally (iframe, no CSS var injection)
- [x] `OrdersPage` — `borderLeft: 4px solid status` → `borderTop` (side-stripe ban); order total `var(--accent)` → `var(--success)` (2.1:1 → 5.8:1)
- [x] `UserAccountPage` — StatCard `borderTop: 3px solid var(--accent)`; "View all →" link contrast fix; recent orders status badges now use semantic STATUS_STYLE colors
- [x] `OrderConfirmationPage` — verified clean, no changes needed
- [x] `ProductDetailPage` + `HomePage` — deeper polish complete: spec/part-number mono values `var(--accent)` → `var(--text-2)` (2.1:1 → ~7:1); price display `var(--accent)` → `var(--text)`; cart item price + total `var(--accent)` → `var(--text-2)` / `var(--text)`; category filter active state `var(--accent)` → `var(--text)`; Reset button `var(--accent)` → `var(--text-2)` + hover interaction; product name card hover → underline-only (not accent); Quick View part number + "View Full Details" link contrast fixed; breadcrumb "Catalog" link + ghost button hover corrected; mobile sticky price bar fixed in CSS

---

## Phase 5 — Auth Pages ✅ DONE

Pages: `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `NotFoundPage`

- [x] `AuthLayout` brand panel — "Industrial Procurement" label `var(--accent)` → `var(--text-3)` (contrast); "Trusted by professionals" `var(--text-4)` → `var(--text-3)`
- [x] All auth page inline links (`Forgot password?`, `Register`, `Sign In`) — `var(--accent)` → `var(--text-2)` default; hover → accent + underline (2.1:1 → passes)
- [x] Password rule checklist already clean (success/error semantic colors); no changes needed
- [x] 404 numeral — `var(--accent)` → `var(--text)` (fails 3:1 large-text threshold → now 10:1+); caramel 3px accent rule added between numeral and heading

---

## Phase 6 — Shared Components ✅ DONE

Files: `TopBar`, `MobileBottomNav`, `DataTable`, `SheetPanel`, `PageBanner`

- [x] `MobileBottomNav` — active color `var(--accent)` → `var(--text)` (2.1:1 → passes); accent 4px dot indicator added above active icon
- [x] `TopBar` — notification bell gets caramel dot badge (6px, styled, no handler) — visually production-ready
- [x] `DataTable` — EmptyOverlay text `var(--text-4)` → `var(--text-3)`; row hover `var(--surface-hover)` added via `.MuiDataGrid-row:hover`
- [x] `SheetPanel` — `borderTop: '3px solid var(--accent)'` added to PaperProps (consistent accent anchor across all panels/cards)
- [x] `PageBanner` — icon box color `var(--accent)` → `var(--text-2)` (non-text contrast fix: caramel-on-accent-subtle < 3:1 → now passes)

---

## Key Rules

- `color: "var(--bg)"` is **valid** on dark semantic backgrounds (`--success`, `--error`, `--warning`, `--info`)
- `color: "var(--bg)"` is **invalid** on `--accent` (caramel) — all fixed in Phase 1
- Never change Redux slices, API calls, route definitions, or backend contracts
- Stripe Elements use `theme: "night"` in an iframe — leave untouched

---

## Testing Steps (after each phase)

1. `npm run dev` — start dev server
2. Open at 100% zoom in browser
3. Check button text readability on caramel backgrounds
4. Resize to 375px — verify mobile layout
5. Walk the auth flow (login → home → cart → checkout)
6. Walk admin and seller flows
7. Confirm no broken layouts or missing styles
