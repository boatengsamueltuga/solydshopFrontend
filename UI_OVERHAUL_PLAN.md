# SolydShop UI/UX Overhaul Plan

**Goal:** Transform into a production-ready enterprise-grade e-commerce platform.  
**Rules:** UI/UX improvements only — no business logic, no API, no Redux, no auth changes.  
**Palette:** Sage & caramel light theme — `#ccd5ae · #e9edc9 · #fefae0 · #faedcd · #d4a373`

---

## ✅ COMPLETED

### Color System (tokens.css + theme.js)
- Full light theme palette: OKLCH sage/caramel tokens
- MUI theme.js rewritten: sRGB hex values, semantic colors
- Font stack: Space Grotesk (display), IBM Plex Sans (body), IBM Plex Mono (mono)

### Phase 1 — Button Contrast (WCAG AA) ✅
Fixed `color: "var(--bg)"` → `color: "var(--text)"` on all accent-background buttons.  
Affects: `var(--accent)` = caramel (#d4a373), `var(--bg)` = cream (#fefae0) → 2.1:1 contrast (FAIL).  
Fixed ratio: dark brown (#3a2010) on caramel = ~5.8:1 (PASS).

Files fixed:
- `src/pages/HomePage.jsx` — Apply Filters, Try Again, Quick View overlay, Add to Cart (card + QV modal), Checkout
- `src/pages/CartPage.jsx` — Browse Catalog, Proceed to Checkout
- `src/pages/CheckoutPage.jsx` — Step indicator done color, Pay button, CircularProgress, Continue to Payment
- `src/pages/LoginPage.jsx` — Sign In button
- `src/pages/RegisterPage.jsx` — Create Account button
- `src/pages/ForgotPasswordPage.jsx` — Send Reset Link button
- `src/pages/ResetPasswordPage.jsx` — Reset Password button
- `src/pages/NotFoundPage.jsx` — Back to Home link
- `src/pages/OrdersPage.jsx` — Browse Catalog button (empty state)
- `src/pages/OrderConfirmationPage.jsx` — View Orders link
- `src/pages/UserAccountPage.jsx` — My Orders link
- `src/pages/SellerDashboardPage.jsx` — Add Product button
- `src/pages/ProductDetailPage.jsx` — Add to Cart (desktop CTA, sticky bar, Quote modal submit)
- `src/pages/SellerProductFormPage.jsx` — Submit button (fixed in previous session)

### Phase 2 — Navigation & Auxiliary ✅
- `src/components/navigation/AppSidebar.jsx` — Logout hover: `#f87171` → `var(--error)`
- `src/components/Navbar.jsx` — Mobile logout: `#f87171` → `var(--error)`
- `src/utils/confirmToast.jsx` — Light-theme colors (border, `var(--text)`, `var(--error)`)
- `src/components/ProtectedRoute.jsx` — Loading state: Tailwind classes → design-token spinner

---

## 🔲 PENDING

### Phase 3 — Admin Pages Polish
Files to improve: `AdminDashboardPage.jsx`, `AdminProductsPage.jsx`, `AdminOrdersPage.jsx`, `AdminCategoriesPage.jsx`, `AdminUsersPage.jsx`

Possible improvements:
- Ensure all DataGrid/table headers are properly styled with `--surface-mid` background
- Add page banners with icon + title using the `PageBanner` shared component
- Check for any remaining hardcoded colors or dark-theme artifacts
- Improve stat cards with subtle accent borders or icons
- Verify form dialogs/sheet panels match the light theme

### Phase 4 — Customer Experience Polish
Files: `ProductDetailPage.jsx`, `CartPage.jsx`, `CheckoutPage.jsx`, `OrdersPage.jsx`, `UserAccountPage.jsx`, `OrderConfirmationPage.jsx`

Possible improvements:
- `ProductDetailPage.jsx` — Review breadcrumb, image gallery, related products section
- `CartPage.jsx` — Improve empty state illustration/icon treatment
- `CheckoutPage.jsx` — Stripe Elements appearance matches light theme (currently uses 'night' theme)
- `OrdersPage.jsx` — Order card styling: left-border colors per status
- `HomePage.jsx` — Filter sidebar, mini-cart, product cards — review spacing and typography

### Phase 5 — Auth & Misc Pages
Files: `LoginPage.jsx`, `RegisterPage.jsx`, `ForgotPasswordPage.jsx`, `ResetPasswordPage.jsx`, `NotFoundPage.jsx`

Possible improvements:
- AuthLayout brand panel visual polish
- 404 page accent treatment

### Phase 6 — Shared Components
Files: `TopBar.jsx`, `MobileBottomNav.jsx`, `DataTable.jsx`, `SheetPanel.jsx`, `PageBanner.jsx`

Possible improvements:
- `MobileBottomNav.jsx` — Currently CSS-hidden at >767px; review tab label visibility and active state
- `TopBar.jsx` — Bell notification placeholder treatment
- `DataTable.jsx` — Empty overlay, toolbar alignment

---

## Testing Checklist (per phase)

After each change:
1. Start dev server: `npm run dev`
2. Check each page in browser at 100% zoom
3. Verify button text is readable (dark text on caramel)
4. Verify no white-on-white or cream-on-cream text
5. Check mobile layout (resize to 375px)
6. Verify admin and seller flows still work
7. Verify auth flows (login, register, forgot password)

---

## Git Commit Convention

Always use:
```
git add src/...
git commit -m "..."
```

---

## Notes

- `color: "var(--bg)"` is VALID on dark semantic backgrounds (`--success`, `--error`, `--warning`, `--info`) — these are dark colors where cream text passes contrast
- `color: "var(--bg)"` is INVALID on `--accent` (caramel) — fixed in Phase 1
- Do NOT change any Redux slices, API calls, route definitions, or backend contracts
- The Stripe Elements in CheckoutPage use `theme: "night"` — leave as-is (Stripe renders in iframe, can't use CSS vars)
