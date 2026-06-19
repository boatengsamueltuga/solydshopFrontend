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

## Phase 3 — Admin Pages ⬜ TODO

Pages: `AdminDashboardPage`, `AdminProductsPage`, `AdminOrdersPage`, `AdminCategoriesPage`, `AdminUsersPage`

- [ ] Verify DataGrid/table header backgrounds use `--surface-mid`
- [ ] Add `PageBanner` component (icon + title + subtitle) to each page
- [ ] Remove any remaining hardcoded colors or dark-theme artifacts
- [ ] Improve stat cards (accent border-top, icon treatment)
- [ ] Confirm form dialogs / SheetPanel match light theme

---

## Phase 4 — Customer Experience ⬜ TODO

Pages: `ProductDetailPage`, `CartPage`, `CheckoutPage`, `OrdersPage`, `UserAccountPage`, `OrderConfirmationPage`

- [ ] `ProductDetailPage` — breadcrumb, image gallery, related products, sticky bar
- [ ] `CartPage` — empty state, item card hover polish
- [ ] `CheckoutPage` — Stripe Elements appearance (currently `theme: "night"` — keep, can't inject CSS vars into Stripe iframe)
- [ ] `OrdersPage` — status-tinted left borders, timeline stepper spacing
- [ ] `UserAccountPage` — stats grid, recent orders table
- [ ] `OrderConfirmationPage` — success icon treatment, CTA spacing
- [ ] `HomePage` — filter sidebar, product card grid, mini-cart panel

---

## Phase 5 — Auth Pages ⬜ TODO

Pages: `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `NotFoundPage`

- [ ] `AuthLayout` brand panel visual polish (logo treatment, brand copy)
- [ ] Password rule checklist styling
- [ ] 404 page — large 404 numeral, illustration or accent treatment

---

## Phase 6 — Shared Components ⬜ TODO

Files: `TopBar`, `MobileBottomNav`, `DataTable`, `SheetPanel`, `PageBanner`

- [ ] `MobileBottomNav` — active state clarity, icon + label sizing
- [ ] `TopBar` — notification bell treatment (placeholder → styled)
- [ ] `DataTable` — empty overlay, toolbar slot, row hover
- [ ] `SheetPanel` — header, scrollable body, sticky footer polish
- [ ] `PageBanner` — ensure icon box, title scale, stat slots are consistent

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
