# SolydShop Complete UI/UX Redesign Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign SolydShop from a generic AI-looking CRUD interface into a premium, trust-building industrial procurement platform for fleet managers, mechanics, and construction companies — calibrated to Caterpillar/Komatsu visual authority.

**Architecture:** Unified dark industrial design system using OKLCH color tokens, IBM Plex Sans/Mono + Space Grotesk typography, persistent sidebar navigation for admin/seller, and a new product detail page. Eliminate the current three-way conflict between Tailwind, MUI inline styles, and hardcoded tokens by introducing a shared CSS custom properties layer that MUI and Tailwind both consume.

**Tech Stack:** React 19, Vite, Redux Toolkit, MUI v9 (theme-overridden), Tailwind CSS v4, React Router DOM v7, Stripe, Cloudinary, Axios — plus Google Fonts (Space Grotesk + IBM Plex Sans + IBM Plex Mono).

---

## SECTION 1 — FULL UI/UX AUDIT

### 1.1 Critical Bugs (P0 — Breaks Functionality)

| # | Location | Issue | Impact |
|---|----------|-------|--------|
| 1 | `HomePage.jsx:297–312` | Price range slider renders but is not passed to the `fetchProducts()` API call — zero functional effect | Users adjust slider, nothing changes — destroys trust immediately |
| 2 | `CartPage.jsx:277–305` | Cart items render a generic `<InventoryOutlinedIcon>` instead of `product.imageUrl` — product images never appear in cart | Feels broken; B2B buyers cannot confirm they added the right part |
| 3 | `AdminDashboardPage.jsx:776` | "Users: 0" is hardcoded — the Users stat card never fetches from `/api/admin/users` | Admin dashboard looks broken on first load |
| 4 | `OrdersPage.jsx:397` | `order.items.map(item => ... item.productId)` used as key but OrderItem DTO likely has no `productId` field — potential key collision | React warnings, possible rendering glitches |
| 5 | `CheckoutPage.jsx` | No shipping address form exists — backend hardcodes `"Address not provided"` on every order | Every order ever placed shows "Address not provided" — catastrophically unprofessional for B2B |
| 6 | `App.jsx` | No product detail page (`/products/:id`) route exists anywhere | No way to view full product specs — a dealbreaker for $5,000+ machinery parts |

### 1.2 Major UX Failures (P1 — Hurts Trust & Conversion)

| # | Location | Issue |
|---|----------|-------|
| 7 | Global | Four completely different visual languages: dark navy (homepage/auth), white MUI (cart/checkout/orders), gray Tailwind (admin dashboard), white/green MUI (seller). Feels like 4 apps built by 4 teams. |
| 8 | Global | No design token layer — 47+ hardcoded hex values across files (`#1a237e`, `#283593`, `#3949ab`, `"#0D1B2A"`, `C.bg`, `C.surface`...) with zero consistency |
| 9 | Global | Three styling systems in active conflict: Tailwind utility classes + MUI component props + inline style objects — impossible to maintain |
| 10 | Admin/Seller | No persistent sidebar navigation — admin must navigate via URL or buttons inside pages. No breadcrumbs. No way to know where you are. |
| 11 | `AdminDashboardPage.jsx` | Admin dashboard duplicates product/category management UI that already has dedicated `/admin/products` and `/admin/categories` pages — creates confusion about which is canonical |
| 12 | `HomePage.jsx` | Product cards have no link to a detail page — Quick View is the only option, but it has no model/part number display and truncates description |
| 13 | Global | No 404 page, no error boundary, no empty states on admin pages that fail silently |
| 14 | `CheckoutPage.jsx` | After payment, redirects to `/orders` with `window.location.href` (full page reload, loses Redux state) instead of `navigate()` |
| 15 | `OrdersPage.jsx` | Order items show no product images — order history is text-only |

### 1.3 Responsiveness Issues (P2)

| # | Location | Issue |
|---|----------|-------|
| 16 | `AdminProductsPage.jsx:510` | DataGrid at fixed `height: 620px` on desktop — content clips on large screen, wastes space on 34" ultrawide |
| 17 | `HomePage.jsx:212` | `max-w-[1440px]` — the 3-column grid works on 1440px but on a 2560px ultrawide the content area floats in a vast void with no response to extra space |
| 18 | `Navbar.jsx` | Mobile menu does not close on outside click — only closes via the X button or link click |
| 19 | `CartPage.jsx:246` | Two-column grid switches at `lg` breakpoint (1024px) — on tablets (768–1023px) a single-column layout wastes all the horizontal space |
| 20 | `SellerDashboardPage.jsx:679–684` | Product grid: `xs: 3 cols, md: 4 cols, lg: 5 cols, xl: 6 cols` — at xs (mobile) 3 tiny cards side-by-side are unreadable |
| 21 | Global | No bottom navigation bar on mobile — the hamburger menu requires two taps to reach Cart or Orders |

### 1.4 Information Hierarchy Problems

| # | Issue |
|---|-------|
| 22 | Product cards show `productName` in `text-xs font-bold` — the most important info is rendered smaller than the SKU badge |
| 23 | Price is shown with same visual weight as description text on homepage cards |
| 24 | Admin user list shows userId as first column — this is internal data that should be deprioritized |
| 25 | Order status chips are the same visual weight as customer email in admin order table |
| 26 | Homepage "Featured Products" section header has no visual hierarchy above the grid |
| 27 | Cart page shows "Order Summary" header in the same font size as line items |

### 1.5 Generic AI-Looking UI Patterns to Eliminate

| Pattern | Where | Replacement |
|---------|-------|-------------|
| Identical blue gradient banner (`linear-gradient(135deg, #1a237e → #3949ab)`) | Cart, Checkout, Orders, AdminProducts — 5 pages | Unique page headers with industrial identity |
| `background-clip: text` gradient text | Not present — but MUI colored Typography is similar | Solid accent color only |
| Identical stat cards with icon + number | AdminDashboard | Custom gauge/readout components |
| Generic MUI DataGrid with default styling | All admin pages | Themed DataGrid with brand density and custom cells |
| MUI Dialog boxes with default gray | All CRUD pages | Themed panel drawers (right-side) instead of center dialogs |
| Blue loading spinner (ColorRing) | All pages | Skeleton states matched to each content type |
| Identical `rounded-xl shadow` white cards | CartPage, OrdersPage | Differentiated surface hierarchy |

### 1.6 What Currently Works (Keep)

- JWT auth flow with cookie refresh — solid security model
- Quick View with focus trap and keyboard navigation — accessibility-conscious
- Password rules checklist on register/reset — excellent UX pattern
- `confirmToast` for destructive actions — good pattern, just needs styling
- `api.js` error sanitization and CSRF handling — production-quality
- Redux `isInitialized` guard in ProtectedRoute — prevents flash of wrong content
- Rate limiting feedback (minutes until reset) — user-friendly error message
- Stepper on Orders page — strong UX pattern, keep and enhance
- Responsive image upload with Cloudinary — working infrastructure

---

## SECTION 2 — DESIGN SYSTEM PROPOSAL

### 2.1 Physical Scene (Grounds Design Decisions)

> Marcus is a fleet manager for a mid-size construction company. He's on a 34" ultrawide at 3440×1440 in a site office with cool-white fluorescent overhead lighting, switching between this parts catalog, a fleet spreadsheet, and email. He places 8–15 orders per week, each involving hydraulic components, engine parts, and undercarriage assemblies worth $800–$12,000. He needs to identify parts by model number, verify stock, and place orders without ambiguity. He uses this for 3–4 hours a day.

**Answer forced:** Dark theme (reduces eye strain under fluorescent light, excellent for extended data-heavy use), high information density, monospace for all numeric data.

### 2.2 Color Strategy: Committed Dark Industrial

Not dark-blue SaaS. Not black terminal. Not yellow construction. Not navy-gold enterprise.

**The anchor:** Machined copper/brass — the color of hydraulic fittings, bearing housings, industrial bronze components. Warm without being orange. Metallic without being chrome. This is specific to the subject matter.

```css
/* ═══ SolydShop Design Tokens ═══════════════════════════════════════════ */
/* Color system in OKLCH — warm-shifted graphite + copper accent           */

:root {
  /* ── Background scale ─────────────────────────────── */
  --bg:             oklch(0.10 0.012 58);   /* deep machined graphite */
  --surface:        oklch(0.15 0.014 58);   /* panel surface */
  --surface-mid:    oklch(0.20 0.016 58);   /* raised panel */
  --surface-high:   oklch(0.26 0.018 58);   /* card / input bg */
  --surface-hover:  oklch(0.30 0.018 58);   /* hover state on cards */

  /* ── Border scale ─────────────────────────────────── */
  --border-subtle:  oklch(0.24 0.016 58);   /* hairline, barely visible */
  --border:         oklch(0.32 0.018 58);   /* standard border */
  --border-mid:     oklch(0.40 0.020 58);   /* visible dividers */
  --border-strong:  oklch(0.50 0.022 58);   /* emphasis borders */

  /* ── Text scale ───────────────────────────────────── */
  --text:           oklch(0.94 0.008 58);   /* primary — warm near-white */
  --text-2:         oklch(0.72 0.012 58);   /* secondary */
  --text-3:         oklch(0.52 0.010 58);   /* tertiary / disabled */
  --text-4:         oklch(0.38 0.008 58);   /* placeholder */

  /* ── Brand accent — Copper/Brass ─────────────────── */
  --accent:         oklch(0.67 0.115 55);   /* copper — primary brand */
  --accent-hi:      oklch(0.74 0.130 55);   /* hover */
  --accent-lo:      oklch(0.54 0.095 55);   /* pressed / deep */
  --accent-subtle:  oklch(0.20 0.030 55);   /* tinted bg for accent areas */
  --accent-border:  oklch(0.40 0.060 55);   /* accent-tinted border */

  /* ── Semantic ─────────────────────────────────────── */
  --success:        oklch(0.63 0.10 160);   /* teal-green — in stock */
  --success-subtle: oklch(0.18 0.04 160);
  --warning:        oklch(0.72 0.10 78);    /* amber — low stock */
  --warning-subtle: oklch(0.18 0.04 78);
  --error:          oklch(0.54 0.14 28);    /* deep red */
  --error-subtle:   oklch(0.18 0.05 28);
  --info:           oklch(0.62 0.09 230);   /* cool blue — status info */
  --info-subtle:    oklch(0.18 0.04 230);

  /* ── Typography ───────────────────────────────────── */
  --font-display:  'Space Grotesk', system-ui, sans-serif;
  --font-body:     'IBM Plex Sans', system-ui, sans-serif;
  --font-mono:     'IBM Plex Mono', 'Cascadia Code', monospace;

  /* ── Type scale ───────────────────────────────────── */
  --text-2xs:  0.625rem;   /* 10px — micro labels */
  --text-xs:   0.75rem;    /* 12px — captions, meta */
  --text-sm:   0.875rem;   /* 14px — secondary body */
  --text-base: 1rem;       /* 16px — primary body */
  --text-lg:   1.125rem;   /* 18px */
  --text-xl:   1.25rem;    /* 20px */
  --text-2xl:  1.5rem;     /* 24px */
  --text-3xl:  1.875rem;   /* 30px */
  --text-4xl:  clamp(2rem, 3vw, 2.5rem);
  --text-5xl:  clamp(2.5rem, 4vw, 3.5rem);
  --text-display: clamp(3rem, 5vw, 5rem);  /* max 80px */

  /* ── Spacing ──────────────────────────────────────── */
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-10:  40px;
  --space-12:  48px;
  --space-16:  64px;
  --space-20:  80px;
  --space-24:  96px;

  /* ── Border radius ────────────────────────────────── */
  --r-none: 0;
  --r-xs:   2px;    /* micro badges */
  --r-sm:   3px;    /* inputs, small tags */
  --r-md:   4px;    /* cards, panels */
  --r-lg:   6px;    /* large cards, dialogs */
  --r-pill: 9999px; /* badges, pills only */

  /* ── Shadows ──────────────────────────────────────── */
  --shadow-1: 0 1px 2px oklch(0 0 0 / 0.5);
  --shadow-2: 0 2px 8px oklch(0 0 0 / 0.6);
  --shadow-3: 0 4px 16px oklch(0 0 0 / 0.7);
  --shadow-accent: 0 0 16px oklch(0.67 0.115 55 / 0.25);

  /* ── Z-index scale ────────────────────────────────── */
  --z-dropdown:    100;
  --z-sticky:      200;
  --z-overlay:     300;
  --z-modal-bg:    400;
  --z-modal:       500;
  --z-toast:       600;
  --z-tooltip:     700;

  /* ── Layout ───────────────────────────────────────── */
  --sidebar-width: 240px;
  --topbar-height: 56px;
  --content-max:   1440px;
  --content-wide:  1920px;  /* ultrawide */

  /* ── Motion ───────────────────────────────────────── */
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast:  120ms;
  --duration-mid:   220ms;
  --duration-slow:  380ms;
}
```

### 2.3 Typography System

**Display face:** Space Grotesk — geometric, technical authority, slightly condensed feel. Used for headings, product names, page titles. Weights: 700 (display), 600 (heading).

**Body face:** IBM Plex Sans — designed for technical documentation and data interfaces. Excellent legibility at 14px. Weights: 400 (body), 500 (emphasis), 600 (subheadings).

**Mono face:** IBM Plex Mono — used exclusively for: part numbers, model numbers, order IDs, prices, quantities, SKUs. This is the signature treatment. Weights: 400 (data), 500 (emphasis).

**The Spec Sheet signature:** Every price, part number, model number, and quantity rendered in `IBM Plex Mono` with precise character spacing — like reading a technical spec sheet or a machinist's drawing. This creates an immediately recognizable visual language specific to the industrial procurement domain.

**Font loading:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### 2.4 Design Signature: "The Spec Sheet"

The one element this redesign is remembered by:

All numeric data (prices, quantities, order IDs, part numbers) is rendered in `IBM Plex Mono` at a slightly smaller optical size than surrounding text, with a warm `--text-3` color for the unit prefix (`$`, `#`, `QTY`) and `--text` for the value itself. Product cards read like a spec sheet excerpt rather than an e-commerce tile.

Additionally: a subtle `1px` left border in `--accent-border` on product spec rows — not a "side stripe" decoration but a genuine data-table rule indicating "this row contains machine-readable data."

---

## SECTION 3 — COMPONENT LIBRARY PROPOSAL

### 3.1 Atoms

```
<Token /> — Part number / model number / SKU in mono badge
<PriceTag /> — Currency prefix + mono value + unit (per unit / per set)
<StockBadge /> — "IN STOCK · 24" / "LOW STOCK · 3" / "OUT OF STOCK"
<StatusBadge /> — Order status chip (PENDING/PROCESSING/SHIPPED/DELIVERED/CANCELLED)
<RoleBadge /> — User role chip (USER/SELLER/ADMIN) with copper/teal/error color
<IconButton /> — Ghost icon button with focus ring
<CopperButton /> — Primary CTA button in --accent
<GhostButton /> — Outlined secondary button
<DangerButton /> — Delete / destructive action
<Input /> — Themed text input with focus --accent border
<SearchInput /> — Search with inline icon, clear button
<Select /> — Themed dropdown
<Checkbox /> / <Radio /> — Themed with --accent
<Spinner /> — Thin ring in --accent color
```

### 3.2 Molecules

```
<ProductCard /> — Image + name + token + price + stock + CTA
<ProductCardSkeleton /> — Matched skeleton for loading state
<CartLineItem /> — Product image + name + mono price + qty controls + remove
<OrderItem /> — Product image + name + qty + price in order context
<OrderCard /> — Full order card with stepper and items
<SpecRow /> — label: value pairs with optional mono value treatment
<StatGauge /> — Dashboard stat: label + large number + delta indicator
<FilterChip /> — Category filter toggle chip
<ConfirmPanel /> — Inline confirm (replaces confirmToast)
<SearchBar /> — Full-width search with keyboard shortcut hint
<BreadcrumbTrail /> — Breadcrumb navigation
<SidebarLink /> — Active-aware sidebar navigation link
<DataRow /> — Table-style labeled row for order/product details
<UploadZone /> — Drag-and-drop image upload with preview
```

### 3.3 Organisms

```
<AppSidebar /> — 240px persistent left nav (Admin/Seller)
<TopBar /> — 56px fixed top bar (logo, search, cart, user)
<MobileBottomNav /> — 5-tab bottom navigation (mobile only)
<ProductGrid /> — Responsive product grid with skeleton states
<MiniCart /> — Right panel mini cart (homepage only)
<FilterSidebar /> — Left filter panel (categories, price, availability)
<DataTable /> — Branded DataGrid wrapper with consistent column patterns
<SheetPanel /> — Right-slide panel replacing center Dialogs for CRUD
<OrderTimeline /> — Visual stepper + status history
<ProductForm /> — Full product create/edit form
<CheckoutStepper /> — Multi-step checkout (Shipping → Payment → Confirm)
<EmptyState /> — Illustrated empty states per context
<PageBanner /> — Consistent page header with breadcrumb + actions
```

### 3.4 Layout Components

```
<AppLayout /> — Root layout: sidebar + topbar + main content
<CustomerLayout /> — Top nav + main + footer
<AdminLayout /> — Sidebar + topbar + page content
<SellerLayout /> — Sidebar + topbar + page content
<PageContainer /> — Max-width container with padding
<TwoCol /> — 2/3 + 1/3 split for product detail, checkout
<ThreeCol /> — filters | content | sidebar (homepage)
```

---

## SECTION 4 — LAYOUT STRATEGY

### 4.1 Breakpoint System

```
xs:   320px   — smallest supported mobile
sm:   480px   — large mobile / small phone landscape
md:   768px   — tablet portrait
lg:   1024px  — tablet landscape / small laptop
xl:   1280px  — standard desktop
2xl:  1440px  — large desktop (primary target)
3xl:  1920px  — ultrawide (secondary target)
4xl:  2560px  — 34" ultrawide (constrained to 1920px content)
```

Tailwind CSS v4 custom breakpoints in `tailwind.config.js`.

### 4.2 Grid System

**Customer-facing pages:**
- Mobile: Single column, full-width
- Tablet: 2-column content, collapsible filter overlay
- Desktop: 3-column — `240px filters | 1fr content | 320px mini-cart`
- Ultrawide: 3-column — `280px filters | 1fr content | 360px mini-cart`, max-width 1920px

**Admin / Seller pages:**
- Mobile: Full-width, sidebar as overlay drawer
- Tablet: Full-width, sidebar as overlay drawer
- Desktop: `240px sidebar | 1fr content`
- Ultrawide: `240px sidebar | 1fr content`, max-width 1920px

**Product Detail page:**
- Mobile: Single column (image → specs → CTA)
- Tablet: 2-column `1fr image | 1fr specs`
- Desktop: 2-column `5fr image | 7fr specs` with sticky CTA panel
- Ultrawide: Same 2-column with wider specs area

### 4.3 Navigation Architecture

**Customer navigation:**
```
Desktop: Fixed top bar (56px) — Logo | Search | [Home, Catalog, Orders] | Cart | Avatar
Mobile:  Fixed top bar (56px) — Logo | Search icon | Cart badge
         Fixed bottom nav (64px) — Home | Catalog | Cart | Orders | Account
```

**Admin navigation:**
```
Desktop: Fixed sidebar (240px) + Fixed top bar (56px)
  Sidebar groups:
    OVERVIEW
      Dashboard
    CATALOG
      Products
      Categories
    OPERATIONS
      Orders
      Users
    ACCOUNT
      Settings (future)
      Logout
Mobile: Overlay sidebar (controlled by hamburger in top bar)
```

**Seller navigation:**
```
Desktop: Fixed sidebar (240px) + Fixed top bar (56px)
  Sidebar groups:
    MY STORE
      Dashboard
      My Products
      Add Product
    ACTIVITY
      Sales
    ACCOUNT
      Logout
Mobile: Overlay sidebar
```

### 4.4 Ultrawide Strategy (34" / 2560px)

Content area capped at 1920px, centered, with the deep graphite background visible at edges (this is fine — the dark bg looks intentional, not empty). Within the 1920px container:
- Sidebar: 280px (slightly wider than standard)
- Content grid: 4–6 columns for product catalog
- Admin DataGrid: uses full available width, shows more columns
- Product detail: wider image panel

---

## SECTION 5 — SCREEN-BY-SCREEN REDESIGN PLAN

### 5.1 Homepage (`/`)

**Current state:** Dark blue 3-column. Price slider broken. No product detail links.

**Redesign:**
```
┌────────────────────────────────────────────────────────────────────────┐
│  TOPBAR: Logo | Search (full-width) | Cart badge | Avatar              │
├──────────┬─────────────────────────────────────────┬───────────────────┤
│ FILTERS  │  PRODUCT CATALOG                        │  MINI CART        │
│ 240px    │  2 or 3 col grid (breakpoint-responsive) │  320px           │
│          │                                         │                   │
│ ─────    │  [Sort bar] [Result count]              │  Cart items list  │
│ Category │                                         │  with images      │
│ checkboxes│  ┌──────┐ ┌──────┐ ┌──────┐           │                   │
│          │  │ Card │ │ Card │ │ Card │           │  Subtotal         │
│ ─────    │  └──────┘ └──────┘ └──────┘           │  Checkout CTA     │
│ Price    │                                         │                   │
│ range    │  [Load more / pagination]               │                   │
│ (wired!) │                                         │                   │
│          │                                         │                   │
│ ─────    │                                         │                   │
│ In Stock │                                         │                   │
│ toggle   │                                         │                   │
│          │                                         │                   │
│ [Apply]  │                                         │                   │
│ [Reset]  │                                         │                   │
└──────────┴─────────────────────────────────────────┴───────────────────┘
```

**Product Card redesign:**
```
┌─────────────────────────────────┐
│  ┌───────────────────────────┐  │  ← surface-high bg, 4px radius
│  │   Product image (4:3)     │  │
│  │   [IN STOCK] badge TL     │  │  ← success tinted
│  │   [CAT 320D] badge BL     │  │  ← mono, surface-mid bg
│  └───────────────────────────┘  │
│  HYDRAULIC PUMP ASSEMBLY        │  ← Space Grotesk 600, text-base
│  Fits Caterpillar 320D/E series │  ← IBM Plex Sans 400, text-sm, text-3
│                                 │
│  PART NO.                       │  ← text-2xs uppercase tracking, text-3
│  3066T-8821-HX          │  ← IBM Plex Mono 500, text-sm, accent
│                                 │
│  UNIT PRICE                     │  ← text-2xs uppercase
│  $2,847.00                      │  ← IBM Plex Mono 600, text-xl, text
│                                 │
│  [+ Add to Cart ─────────────]  │  ← copper button, full width
└─────────────────────────────────┘
```

**Key changes:**
- Price slider wired to API
- "In Stock" filter wired to API (backend needs `inStock` param — add to roadmap)
- Product cards link to `/products/:id` on name click
- Mini-cart shows actual product thumbnails
- Sort bar added (by price asc/desc, newest, name)
- Pagination or "Load more" (currently loads all — needs pagination)

---

### 5.2 Product Detail Page (`/products/:id`) — NEW PAGE

**Current state:** Does not exist. This is the highest-priority missing page.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  TOPBAR                                                                  │
├──────────────────────────────────────────────────────────────────────────┤
│  Catalog > Hydraulic Systems > Hydraulic Pump Assembly   ← breadcrumb    │
├──────────────────────────────┬───────────────────────────────────────────┤
│                              │  HYDRAULIC PUMP ASSEMBLY                  │
│  Large product image         │  Caterpillar 320D/E Series                │
│  (5:4 ratio, object-contain) │                                           │
│                              │  ┌──────────────────────────────┐        │
│  [Thumbnail gallery]         │  │  UNIT PRICE                  │        │
│                              │  │  $2,847.00              USD  │        │
│                              │  │                              │        │
│                              │  │  AVAILABILITY                │        │
│                              │  │  ● IN STOCK · 24 units       │        │
│                              │  └──────────────────────────────┘        │
│                              │                                           │
│                              │  SPECIFICATIONS                           │
│                              │  ─────────────────────────────────────── │
│                              │  Part Number      3066T-8821-HX          │
│                              │  Model Number     CAT 320D                │
│                              │  Category         Hydraulic Systems       │
│                              │  ─────────────────────────────────────── │
│                              │                                           │
│                              │  QTY [  1  ] [─] [+]                     │
│                              │                                           │
│                              │  [● Add to Cart ──────────────────────]  │
│                              │  [   Request Quote ──────────────────]  │
│                              │                                           │
│                              │  DESCRIPTION                             │
│                              │  OEM-spec hydraulic pump assembly...     │
└──────────────────────────────┴───────────────────────────────────────────┘
```

**Required backend changes:** None — `/api/public/products/:id` already exists.

**New frontend route:** `/products/:id` → `ProductDetailPage.jsx`

---

### 5.3 Cart (`/cart`)

**Current state:** White/light MUI theme. No product images. Inconsistent with homepage.

**Redesign:** Dark industrial theme matching homepage. Product images shown. Quantity controls inline.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  TOPBAR                                                                  │
├──────────────────────────────────────────────────────────────────────────┤
│  MY CART                                           [← Continue shopping] │
│  3 items · $8,541.00                                                     │
├─────────────────────────────────────────┬────────────────────────────────┤
│  CART ITEMS                             │  ORDER SUMMARY                 │
│                                         │  (sticky)                      │
│  ┌──────────────────────────────────┐   │                                │
│  │ [img 64px] Hydraulic Pump 320D  │   │  Subtotal (3)    $8,541.00     │
│  │             3066T-8821-HX        │   │  Shipping        TBD (freight) │
│  │             $2,847.00 ea        │   │  ─────────────────────────     │
│  │             [─][  1  ][+] [✕]   │   │  Total           $8,541.00     │
│  └──────────────────────────────────┘   │                                │
│                                         │  [Proceed to Checkout ──────]  │
│  ┌──────────────────────────────────┐   │                                │
│  │ [img] ...                        │   │                                │
│  └──────────────────────────────────┘   │                                │
└─────────────────────────────────────────┴────────────────────────────────┘
```

**Key changes:**
- Product images fetched and shown (currently shows icon)
- Dark industrial theme
- Sticky order summary sidebar

---

### 5.4 Checkout (`/checkout`) — MAJOR REDESIGN

**Current state:** No shipping form. Collects payment only. Every order shows "Address not provided."

**Redesign — Multi-step:**

```
Step 1: Shipping Address
  Company Name ___________  Contact Name ___________
  Address Line 1 ___________________________________
  City ________________  State ____  ZIP ___________
  Country _________________________________________
  Phone Number ____________________________________
  [Continue to Payment →]

Step 2: Payment
  Order Summary (read-only)
  Stripe PaymentElement
  [Place Order →]

Step 3: Confirmation
  Order #1234 placed successfully!
  [View My Orders]
```

**Required backend changes:**
- `OrderServiceImpl.checkout()` needs to accept `shippingAddress` from request body (currently hardcoded)
- `POST /api/order/{userId}/checkout` needs `shippingAddress` field in request body

---

### 5.5 Orders (`/orders`)

**Current state:** White/light MUI. No product images. Stepper is good pattern.

**Redesign:** Dark industrial theme. Product images in order items. Better empty state.

Keep the Stepper (it's excellent UX). Add:
- Product image thumbnails per order item
- Download invoice button (future)
- Reorder button (future, low priority)
- Dark theme throughout

---

### 5.6 Login & Register (`/login`, `/register`)

**Current state:** Dark blue, reasonably clean. Register has password rules checklist (keep).

**Redesign:**
- Replace generic dark card with industrial panel feel
- Add SolydShop logo + tagline to left panel (split layout on desktop)
- Left: Brand illustration / tagline ("The parts catalog built for the job site")
- Right: Auth form
- Keep all validation logic unchanged

---

### 5.7 Admin Layout — New Persistent Sidebar

All admin pages share `<AdminLayout>` with:
```
┌──────────┬───────────────────────────────────────────────────────────────┐
│          │  TOPBAR: [☰] SolydShop Admin  [search]  [notifications] [av] │
│ SIDEBAR  ├───────────────────────────────────────────────────────────────┤
│ 240px    │                                                               │
│          │  PAGE CONTENT                                                 │
│ OVERVIEW │                                                               │
│ Dashboard│                                                               │
│          │                                                               │
│ CATALOG  │                                                               │
│ Products │                                                               │
│ Categories│                                                               │
│          │                                                               │
│ OPERATIONS│                                                              │
│ Orders   │                                                               │
│ Users    │                                                               │
│          │                                                               │
│ ────     │                                                               │
│ [logout] │                                                               │
└──────────┴───────────────────────────────────────────────────────────────┘
```

---

### 5.8 Admin Dashboard (`/admin/dashboard`)

**Current state:** Stats + product/category tables (duplicated). "Users: 0" hardcoded.

**Redesign:** Stats only (remove duplicate tables). Quick-action buttons to dedicated pages.

Stats to show (all fetched from real API):
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Products │ │ Orders   │ │ Revenue  │ │ Users    │
│   142    │ │   38     │ │$124,800  │ │   67     │  ← all real data
│ +12 this │ │ 5 pending│ │ this mo  │ │ 3 sellers│
│  month   │ │          │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

Recent Orders (last 10, not the full table — that's on /admin/orders)
```

Revenue calculation: sum of all order `totalAmount` values from `/api/order/admin`. This is computable from existing data.

---

### 5.9 Admin Products (`/admin/products`)

**Current state:** Best existing page. Keep the banner + stats + DataGrid structure.

**Redesign:**
- Apply dark industrial theme
- Replace blue gradient banner with industrial page header
- Add inline search/filter above DataGrid (by name, category, stock status)
- Migrate create/edit from center Dialog to right SheetPanel (slide in from right)
- Show model number and part number as mono tags in DataGrid rows

---

### 5.10 Admin Orders (`/admin/orders`)

**Current state:** DataGrid + view dialog. Functional but visually generic.

**Redesign:**
- Dark industrial theme
- Status tabs above table (ALL | PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED) for quick filtering
- View dialog → right SheetPanel with full order detail + inline status update
- Show `createdAt` timestamp (needs backend addition — currently missing from Order DTO)

---

### 5.11 Admin Users (`/admin/users`)

**Current state:** DataGrid + role dialog. Functional.

**Redesign:**
- Dark industrial theme
- Role filter tabs (ALL | USERS | SELLERS | ADMINS)
- SheetPanel for user detail + role management + unlock account option visible

---

### 5.12 Admin Categories (`/admin/categories`)

**Current state:** DataGrid + dialogs. Simple and mostly fine.

**Redesign:**
- Dark industrial theme
- Category cards instead of DataGrid (categories are small in number, cards work better)
- Edit/Delete inline on card hover

---

### 5.13 Seller Dashboard (`/seller/dashboard`)

**Current state:** Green banner + product form + card grid. Inconsistent with everything else.

**Redesign:**
- Apply `<SellerLayout>` with persistent sidebar
- Move product form to a dedicated `/seller/products/new` and `/seller/products/:id/edit`
- Replace product grid with DataGrid (sellers may have many products)
- Keep Quick View but redesign as SheetPanel
- Stats: Total products, In stock, Total catalog value

---

## SECTION 6 — STITCH MCP PROMPTS

### Design System Block (include in every Stitch prompt)

```
**DESIGN SYSTEM (REQUIRED — include in every prompt):**

Color mode: DARK
Primary color: oklch(0.67 0.115 55) — a warm copper/brass, like hydraulic fittings
Background: oklch(0.10 0.012 58) — deep warm graphite
Surface: oklch(0.15 0.014 58) — dark industrial panel
Cards: oklch(0.26 0.018 58) — raised surface
Text: oklch(0.94 0.008 58) — warm near-white primary
Text secondary: oklch(0.72 0.012 58)
Borders: 1px oklch(0.32 0.018 58)
Success: oklch(0.63 0.10 160) — teal-green
Error: oklch(0.54 0.14 28) — deep red

Fonts:
  Display/Headings: Space Grotesk 600/700 — geometric, technical authority
  Body: IBM Plex Sans 400/500 — technical documentation clarity
  Mono (prices, part numbers, SKUs): IBM Plex Mono — engineering spec sheet feel

Radius: 4px on cards and inputs. 2px on small tags. 9999px for pill badges only.
No rounded-2xl or larger on cards or containers.
No gradient text.
No glass/blur decorative effects.
No numbered section markers.
No side-stripe borders on cards.

Visual identity: Industrial procurement platform. Dense, data-forward, precision.
Think: machinist's spec sheet, technical parts manual, Caterpillar parts catalog — not generic SaaS.
Prices and part numbers always in IBM Plex Mono.
All stat numbers large, monospaced, left-aligned.
```

---

### Stitch Prompt 1 — Homepage

```
---
page: homepage
---
SolydShop industrial parts catalog homepage for fleet managers and mechanics.

{{DESIGN_SYSTEM_BLOCK}}

Page layout: Three columns.
- Left (240px fixed): Filter sidebar
- Center (flex): Product catalog grid
- Right (320px fixed): Mini cart

TOP BAR (56px fixed):
Logo "SolydShop" in Space Grotesk 700, copper accent color. Center: large search input with magnifying glass icon and placeholder "Search by part name, model, or number...". Right: shopping cart icon with badge count, user avatar with initials.

FILTER SIDEBAR:
Dark panel background. Sticky. Groups:
1. "CATEGORY" label in text-2xs uppercase tracking-widest, then a list of checkbox filters (Hydraulic Systems, Undercarriage, Engine Components, Electrical).
2. "PRICE RANGE" with a dual-handle range slider, values shown in IBM Plex Mono below.
3. "AVAILABILITY" — toggle switch "In Stock Only".
Two buttons at bottom: copper "Apply Filters" + ghost "Reset".

PRODUCT CATALOG CENTER:
Header row: "Featured Parts" in Space Grotesk 700 24px + result count "142 results" right-aligned + sort dropdown.
3-column product grid:

Each product card (dark card bg, 4px radius, 1px border):
  - Product image (4:3 ratio, object-contain, dark bg)
  - Top-left badge: model number in IBM Plex Mono, very small, dark surface badge
  - Top-right badge: "IN STOCK" in teal or "OUT" in red, very small
  - Product name in Space Grotesk 600 14px
  - Short description in IBM Plex Sans 400 12px, text-3 color, 2 lines max
  - "PART NO." label in 10px uppercase tracked, then part number in IBM Plex Mono accent color
  - "UNIT PRICE" label in 10px uppercase tracked, then price in IBM Plex Mono 600 18px warm-white
  - Full-width copper "Add to Cart" button at bottom

MINI CART RIGHT (320px):
Dark panel. Header: cart icon + "Your Cart" + item count badge.
Scrollable item list: each item shows thumbnail + name + mono price + qty.
Sticky footer: subtotal in mono, "Proceed to Checkout →" copper button.

Overall feel: engineering catalog, not retail store. Data-dense, professional, built for repeat B2B buyers.
```

---

### Stitch Prompt 2 — Product Detail Page

```
---
page: product-detail
---
SolydShop product detail page for a hydraulic pump assembly.

{{DESIGN_SYSTEM_BLOCK}}

TOP BAR: same as homepage.

BREADCRUMB: "Catalog > Hydraulic Systems > Hydraulic Pump Assembly" — small, text-3, IBM Plex Sans.

PAGE LAYOUT (desktop): Two columns.
Left column (45%): Large product image in dark bg panel. Below: 4 smaller thumbnail images in a row.

Right column (55%): Vertical stack.
  - "HYDRAULIC PUMP ASSEMBLY" — Space Grotesk 700, 28px, warm white
  - "Caterpillar 320D/E Series" — IBM Plex Sans 400, 16px, text-3
  
  Specs box (surface-mid bg, 4px radius, 1px border):
    "UNIT PRICE" label 10px uppercase tracked, then "$2,847.00" in IBM Plex Mono 700 32px accent color, "USD · per unit" in text-3 12px
    Horizontal divider
    "AVAILABILITY" label, then green teal dot + "IN STOCK · 24 units available" in IBM Plex Mono

  SPECIFICATIONS table (no background, just hairline rows):
    Part Number    | 3066T-8821-HX    (mono)
    Model Number   | CAT 320D         (mono)
    Category       | Hydraulic Systems
    Seller         | Industrial Parts Co.
    
  Quantity selector: "QTY" label + [-] [2] [+] row + "24 available" hint
  
  CTA buttons stacked:
    - Full-width copper "Add to Cart" primary button
    - Full-width ghost "Request Quote" secondary button

  "DESCRIPTION" section below buttons with IBM Plex Sans body text.

Overall: feels like a parts catalog page from a premium supplier, not a generic ecommerce product page.
```

---

### Stitch Prompt 3 — Cart Page

```
---
page: cart
---
SolydShop shopping cart page. Industrial dark theme.

{{DESIGN_SYSTEM_BLOCK}}

TOP BAR: standard.

PAGE HEADER (below top bar): "MY CART" in Space Grotesk 700 32px. Subtitle: "3 items · $8,541.00" in IBM Plex Mono 400 text-3.

TWO COLUMN LAYOUT:
Left (65%): Cart items list.
Right (35%): Sticky order summary.

CART ITEM ROW (dark card, 4px radius, 1px border, 16px padding):
  Left: 80×80px product image (dark bg, 4px radius)
  Middle: product name Space Grotesk 600 15px, part number in IBM Plex Mono text-3 12px, "per unit $2,847.00" in IBM Plex Mono 14px
  Right: quantity controls [-][1][+] in a border pill, line total in IBM Plex Mono 600 18px accent color, ✕ remove icon.

Divider line between items, no cards inside cards.

ORDER SUMMARY PANEL (surface-mid bg, 4px radius, sticky):
  "ORDER SUMMARY" header Space Grotesk 600 16px.
  Line items: "3 items" → "$8,541.00" in mono, "Est. Shipping" → "TBD (Freight)" in text-3.
  Divider.
  "TOTAL" bold → "$8,541.00" in IBM Plex Mono 700 24px teal-ish accent.
  Copper "Proceed to Checkout" full-width button.
  Ghost "Continue Shopping" text link.

Overall: feels like a professional procurement cart, not a consumer retail cart.
```

---

### Stitch Prompt 4 — Checkout (Shipping Step)

```
---
page: checkout-shipping
---
SolydShop checkout step 1: shipping address. Two-column layout. Dark industrial theme.

{{DESIGN_SYSTEM_BLOCK}}

TOP BAR: standard with "Secure Checkout" badge.

PROGRESS STEPS (top of content, horizontal): [1. Shipping] → [2. Payment] → [3. Confirm]
Current step "1. Shipping" highlighted in accent copper.

TWO COLUMN LAYOUT:
Left (60%): Shipping address form.
  "SHIPPING DETAILS" header Space Grotesk 600 20px.
  Form fields (dark surface-high inputs, 3px radius, 1px border-subtle, accent focus border):
    Company Name (full width)
    Contact Name (full width)
    Address Line 1 (full width)
    Address Line 2 (full width, optional)
    City (50%) + State (20%) + ZIP (30%) — 3-column row
    Country (full width)
    Phone Number (full width)
  
  "Continue to Payment →" copper button full width.
  "← Back to Cart" ghost link.

Right (40%): Order summary read-only.
  "YOUR ORDER" header.
  List of cart items: image + name + mono qty + mono price (compact).
  Subtotal total in mono.

Minimal, functional, professional. No decorative elements.
```

---

### Stitch Prompt 5 — Checkout (Payment Step)

```
---
page: checkout-payment
---
SolydShop checkout step 2: payment. Stripe integration. Dark industrial theme.

{{DESIGN_SYSTEM_BLOCK}}

PROGRESS STEPS: [✓ Shipping] → [2. Payment] → [3. Confirm] — step 2 active.

TWO COLUMN LAYOUT:
Left (60%): Payment form.
  "PAYMENT DETAILS" header Space Grotesk 600 20px.
  "Secured by Stripe" badge with Stripe logo in text-3 size.
  Stripe PaymentElement embedded (card input area, dark themed to match).
  
  Review order total: "Order Total: $8,541.00" in IBM Plex Mono 24px above pay button.
  
  "Pay $8,541.00 →" full-width copper button with lock icon.
  "← Back to Shipping" ghost link.

Right (40%): Order summary same as shipping step, now also showing selected shipping address.

Professional, secure-feeling. Emphasize security without being heavy-handed.
```

---

### Stitch Prompt 6 — Orders Page

```
---
page: orders
---
SolydShop order history page. Dark industrial theme. For fleet managers tracking parts procurement.

{{DESIGN_SYSTEM_BLOCK}}

TOP BAR: standard.

PAGE HEADER: "MY ORDERS" Space Grotesk 700 32px. Subtitle: "8 orders · $48,291.00 total" in IBM Plex Mono text-3.

ORDER CARDS (stacked list, dark card bg, 4px radius, 1px border, 4px left accent bar colored by status):

ORDER CARD structure:
  TOP ROW: "ORDER #1042" Space Grotesk 700 16px + status chip (SHIPPED in teal) + "$3,421.00" IBM Plex Mono 600 18px right-aligned
  STEPPER: 4-step horizontal stepper: Order Placed → Processing → Shipped → Delivered (current step filled in accent)
  ITEMS ROW: horizontal strip of product thumbnails + names (3 per order shown, "+2 more" if over)
  BOTTOM: placed date in text-3 + "View Details" ghost button

Empty state: dark panel, centered, "No orders yet" Space Grotesk, link to start shopping.

Industrial feel — this is procurement history, not retail order history.
```

---

### Stitch Prompt 7 — Admin Dashboard

```
---
page: admin-dashboard
---
SolydShop admin dashboard. Dark industrial enterprise theme. Left sidebar navigation.

{{DESIGN_SYSTEM_BLOCK}}

LAYOUT:
  Left sidebar 240px (surface bg): SolydShop logo + "ADMIN" badge. Navigation groups:
    OVERVIEW: • Dashboard (active, accent left border)
    CATALOG: • Products • Categories
    OPERATIONS: • Orders • Users
    ─── Logout at bottom

  Top bar 56px: "Admin Dashboard" page title left + admin avatar right.

CONTENT AREA:
  Page title: "Platform Overview" Space Grotesk 700 28px.
  
  STAT GAUGES (4-column grid, dark card bg with 1px border):
    Products: large "142" IBM Plex Mono 700 48px, label "TOTAL PRODUCTS" 10px tracked, subtitle "+12 this month" text-3
    Orders: "38" mono 48px, "TOTAL ORDERS", "5 pending" in amber
    Revenue: "$124,800" mono 48px, "MTD REVENUE", "▲ 18% vs last month" in teal
    Users: "67" mono 48px, "REGISTERED USERS", "3 sellers" text-3

  QUICK ACTIONS (2-row grid of action buttons):
    [Manage Products] [Manage Categories]
    [Manage Orders]   [Manage Users]
    
  RECENT ORDERS section: compact table — Order ID (mono) + Customer + Total (mono) + Status chip + date.
  "View all orders →" link.

Feels like enterprise operations software, not a generic dashboard template.
```

---

### Stitch Prompt 8 — Admin Products Page

```
---
page: admin-products
---
SolydShop admin product management page. Dark industrial enterprise theme. Left sidebar.

{{DESIGN_SYSTEM_BLOCK}}

LAYOUT: Same sidebar + topbar as admin dashboard. Active: "Products".

CONTENT AREA:
  PAGE BANNER (surface-mid bg, not gradient):
    Left: "PRODUCT MANAGEMENT" Space Grotesk 700 28px + "142 total · 118 in stock · 24 out of stock" text-3
    Right: "+ Create Product" copper button
  
  FILTER BAR below banner:
    Search input (by name, model, part number) + Category dropdown + Stock status dropdown
  
  DATA TABLE (dark bg, 1px border rows, no zebra striping):
    Columns: [Image 48px] [Product Name + part number mono below] [Category] [Model] [Price mono] [Stock chip] [Actions]
    Actions: eye icon, edit icon, delete icon — icon buttons.
    
  Table pagination at bottom.

CREATE/EDIT SLIDE PANEL (from right, 480px wide, dark surface):
  "Create Product" header + close X
  Form fields: Product Name, Price ($), Qty, Category dropdown, Model Number, Part Number, Description textarea
  Image upload zone: dashed border, "Drop image here or click to upload"
  Image preview once uploaded
  "Create Product" copper button + "Cancel" ghost

DELETE CONFIRM: inline dialog within main panel — not a center popup.

Dense, functional admin tool feel.
```

---

### Stitch Prompt 9 — Admin Orders Page

```
---
page: admin-orders
---
SolydShop admin order management page. Dark industrial theme. Left sidebar.

{{DESIGN_SYSTEM_BLOCK}}

LAYOUT: Same sidebar + topbar. Active: "Orders".

CONTENT AREA:
  HEADER: "ORDER MANAGEMENT" Space Grotesk 700 28px + "38 total orders"
  
  STATUS TABS (horizontal tab bar):
    ALL (38) | PENDING (5) | PROCESSING (8) | SHIPPED (12) | DELIVERED (11) | CANCELLED (2)
    Active tab: accent copper underline.
  
  DATA TABLE (dark bg, 1px row borders):
    Columns: [Order ID mono] [Customer Name] [Email] [Total mono] [Status chip] [Date] [View button]
    
  ORDER DETAIL PANEL (slide from right, 520px):
    "ORDER #1042" header + status chip + close X
    Customer info box: name + email + shipping address (formatted)
    Total in IBM Plex Mono 28px
    "Update Status" dropdown (PENDING/PROCESSING/SHIPPED/DELIVERED/CANCELLED) + "Update" button
    Order items list: product name + qty mono + unit price mono + line total mono
    
Practical, fast, status-focused operations tool.
```

---

### Stitch Prompt 10 — Admin Users Page

```
---
page: admin-users
---
SolydShop admin user management page. Dark industrial theme. Left sidebar.

{{DESIGN_SYSTEM_BLOCK}}

LAYOUT: Same sidebar + topbar. Active: "Users".

CONTENT AREA:
  HEADER: "USER MANAGEMENT" Space Grotesk 700 28px + "67 registered users"
  
  ROLE TABS: ALL (67) | USERS (62) | SELLERS (3) | ADMINS (2)
  
  DATA TABLE:
    Columns: [ID mono small] [Name] [Email] [Roles chips] [Actions]
    Role chips: ADMIN in red-tinted badge, SELLER in amber badge, USER in subtle badge.
    Actions: View button, Delete button (desktop only).
  
  USER DETAIL PANEL (slide from right, 460px):
    "USER #12" + role badges + close X
    Name, Email displayed as labeled rows
    "ASSIGN ROLE" select: User / Seller / Admin
    "Update Role" accent button
    "Unlock Account" ghost button (visible when account is locked)
    "Delete User" danger button at bottom with confirm inline

Minimal, administrative, data-focused.
```

---

### Stitch Prompt 11 — Seller Dashboard

```
---
page: seller-dashboard
---
SolydShop seller dashboard. Dark industrial theme. Sidebar navigation.

{{DESIGN_SYSTEM_BLOCK}}

LAYOUT:
  Left sidebar 240px: Logo + "SELLER" badge. Navigation:
    MY STORE: • Dashboard (active) • My Products • Add Product
    ─── Logout
  Top bar: "Seller Dashboard" + avatar

CONTENT AREA:
  STATS ROW (3 cards):
    Total Products: "24" IBM Plex Mono 48px + "TOTAL PRODUCTS" label
    In Stock: "20" teal + "IN STOCK"
    Catalog Value: "$84,200" copper mono + "TOTAL VALUE"

  "MY PRODUCTS" section header + "Add Product +" button right
  
  PRODUCT GRID (4 columns desktop):
    Each card: product image + name Space Grotesk 600 + part number mono + price mono + stock chip + [Edit] [Delete] buttons at bottom.
    Hover: slight surface-hover bg + Quick View button appears on image overlay.

  Empty state if no products: "No products listed yet. Add your first product."

QUICK VIEW PANEL (right slide panel):
  Product image large + name + specs + mono price + stock chip + "Edit Product" button.

Efficient, clean, purpose-built for product management.
```

---

### Stitch Prompt 12 — Login Page

```
---
page: login
---
SolydShop login page. Dark industrial theme. Split layout.

{{DESIGN_SYSTEM_BLOCK}}

LAYOUT: Two columns (desktop only).

LEFT COLUMN (dark bg, 45%, full height):
  Top: "SolydShop" logo Space Grotesk 700 28px copper.
  Center: Large headline "The parts catalog built for the job site." Space Grotesk 700 40px warm white.
  Subtitle: "Industrial procurement for fleet managers, mechanics, and construction teams." IBM Plex Sans 400 16px text-3.
  Below: Three bullet points with teal check icons:
    "Hydraulic systems · Undercarriage · Engine parts"
    "Real-time inventory from verified suppliers"
    "Bulk orders and quote requests"
  Bottom: "Trusted by 200+ construction companies" text-3 12px.

RIGHT COLUMN (surface bg, 55%, centered):
  "Welcome back" Space Grotesk 600 24px.
  "Sign in to your SolydShop account" IBM Plex Sans text-3 14px.
  
  Form:
    "EMAIL ADDRESS" label 10px uppercase tracked
    Email input (surface-high bg, 3px radius, 1px border, accent focus)
    
    "PASSWORD" label with "Forgot password?" link right-aligned
    Password input with show/hide toggle
    
    Copper "Sign In →" full-width button
    
    Divider "or"
    
    "Don't have an account? Register" link

Mobile: single column, right column content only (no left panel).

Professional, trustworthy, not trying to be consumer-friendly — built for business users.
```

---

## SECTION 7 — PRIORITIZED IMPLEMENTATION ROADMAP

Ordered by business impact and user trust. Do not start Phase 2 until Phase 1 is complete.

---

### PHASE 1 — Fix Broken Things (Week 1)

These are bugs that make the app look broken right now. Zero design work required.

| Priority | Task | File | Impact |
|----------|------|------|--------|
| P0.1 | Wire price range slider to API | `HomePage.jsx` | Filter works for first time |
| P0.2 | Fix cart item images (show product imageUrl) | `CartPage.jsx` | Cart looks real |
| P0.3 | Fetch real user count in admin dashboard | `AdminDashboardPage.jsx` | Stats not broken |
| P0.4 | Add shipping address form to checkout | `CheckoutPage.jsx` + backend `OrderServiceImpl` | Orders have real addresses |
| P0.5 | Fix "Address not provided" in orders | `OrderServiceImpl.java` | Trust-critical |
| P0.6 | Add `createdAt` field to Order DTO | Backend `OrderResponse` DTO | Enables order date display |

---

### PHASE 2 — Design System Foundation (Week 1–2)

Before touching any page, establish the token layer everything else will consume.

| Priority | Task | Files |
|----------|------|-------|
| P1.1 | Create `src/styles/tokens.css` with all OKLCH tokens | New file |
| P1.2 | Create `src/styles/typography.css` with Space Grotesk + IBM Plex loading | New file |
| P1.3 | Configure MUI theme override consuming CSS custom properties | `src/app/theme.js` (new) |
| P1.4 | Update `main.jsx` to use MUI `ThemeProvider` | `src/main.jsx` |
| P1.5 | Create shared layout components: `AppLayout`, `AdminLayout`, `SellerLayout`, `CustomerLayout` | `src/components/layouts/` |
| P1.6 | Build shared `<TopBar>` and `<AppSidebar>` | `src/components/navigation/` |
| P1.7 | Build shared `<PageBanner>` replacing all blue gradient banners | `src/components/shared/PageBanner.jsx` |
| P1.8 | Build `<SheetPanel>` (right-slide panel replacing all center Dialogs) | `src/components/shared/SheetPanel.jsx` |
| P1.9 | Build shared `<DataTable>` wrapper around MUI DataGrid | `src/components/shared/DataTable.jsx` |

---

### PHASE 3 — New Product Detail Page (Week 2)

Highest conversion-impact missing feature.

| Priority | Task | Files |
|----------|------|-------|
| P2.1 | Create `ProductDetailPage.jsx` | `src/pages/ProductDetailPage.jsx` |
| P2.2 | Add `/products/:id` route to `App.jsx` | `src/App.jsx` |
| P2.3 | Wire `GET /api/public/products/:id` in the page | `src/pages/ProductDetailPage.jsx` |
| P2.4 | Add product name as clickable link in `HomePage.jsx` product cards | `src/pages/HomePage.jsx` |
| P2.5 | Add product link in `QuickView` modal — "View Full Details →" | `src/pages/HomePage.jsx` |

---

### PHASE 4 — Admin Redesign (Week 2–3)

Admin spends the most time in the app. Fixing this has the most day-to-day impact.

| Priority | Task |
|----------|------|
| P3.1 | Wrap all admin pages in `<AdminLayout>` with sidebar |
| P3.2 | Redesign `AdminDashboardPage` — real stats, remove duplicated tables |
| P3.3 | Redesign `AdminProductsPage` — dark theme, search/filter bar, SheetPanel CRUD |
| P3.4 | Redesign `AdminOrdersPage` — status tabs, SheetPanel detail, dark theme |
| P3.5 | Redesign `AdminUsersPage` — role tabs, SheetPanel detail, dark theme |
| P3.6 | Redesign `AdminCategoriesPage` — card grid instead of DataGrid |

---

### PHASE 5 — Customer Experience Redesign (Week 3)

Homepage, cart, checkout, orders — the buyer journey.

| Priority | Task |
|----------|------|
| P4.1 | Redesign `HomePage.jsx` — dark industrial token-based, wired filters, product cards with spec-sheet treatment |
| P4.2 | Redesign `CartPage.jsx` — dark theme, product images, consistent layout |
| P4.3 | Redesign `CheckoutPage.jsx` — multi-step with shipping address |
| P4.4 | Redesign `OrdersPage.jsx` — dark theme, product images in order items, better stepper |
| P4.5 | Add mobile bottom navigation bar |

---

### PHASE 6 — Seller Redesign (Week 4)

| Priority | Task |
|----------|------|
| P5.1 | Wrap `SellerDashboardPage` in `<SellerLayout>` with sidebar |
| P5.2 | Split seller product form into `/seller/products/new` and `/seller/products/:id/edit` |
| P5.3 | Convert product grid to `<DataTable>` |
| P5.4 | Add seller stats: total products, catalog value, in-stock count |

---

### PHASE 7 — Auth & Polish (Week 4)

| Priority | Task |
|----------|------|
| P6.1 | Redesign `LoginPage` — split layout with brand left panel |
| P6.2 | Redesign `RegisterPage` — consistent with login |
| P6.3 | Redesign `ForgotPasswordPage` + `ResetPasswordPage` |
| P6.4 | Add 404 page |
| P6.5 | Add error boundary to catch crashes |
| P6.6 | Standardize all loading states to skeleton screens (remove generic spinner) |
| P6.7 | Add `@media (prefers-reduced-motion: reduce)` to all transitions |

---

### PHASE 8 — Enhancements (Month 2)

| Priority | Feature | Notes |
|----------|---------|-------|
| E1 | User account page | Profile, order history, addresses |
| E2 | Server-side pagination on homepage | Currently loads all products |
| E3 | In-stock filter wired to API | Needs backend `inStock` param |
| E4 | Order confirmation page | `/orders/confirmation/:id` |
| E5 | Revenue calculation on admin dashboard | Sum order totals client-side |
| E6 | Reorder from order history | Adds all items back to cart |
| E7 | Quote request flow | Form email to seller |
| E8 | Product image gallery | Multiple images per product (needs backend) |

---

## APPENDIX A — Google Fonts Import

Add to `index.html` `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
```

## APPENDIX B — MUI Theme Override Skeleton

```js
// src/app/theme.js
import { createTheme } from '@mui/material/styles';

export const solydTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: 'oklch(0.10 0.012 58)',
      paper: 'oklch(0.15 0.014 58)',
    },
    primary: {
      main: 'oklch(0.67 0.115 55)',
      dark: 'oklch(0.54 0.095 55)',
      light: 'oklch(0.74 0.130 55)',
    },
    success: { main: 'oklch(0.63 0.10 160)' },
    error:   { main: 'oklch(0.54 0.14 28)' },
    warning: { main: 'oklch(0.72 0.10 78)' },
    text: {
      primary:   'oklch(0.94 0.008 58)',
      secondary: 'oklch(0.72 0.012 58)',
      disabled:  'oklch(0.52 0.010 58)',
    },
    divider: 'oklch(0.32 0.018 58)',
  },
  typography: {
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    h1: { fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 700 },
    h2: { fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 700 },
    h3: { fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 600 },
    h4: { fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 600 },
    h5: { fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 600 },
  },
  shape: { borderRadius: 4 },
  components: {
    MuiDataGrid: {
      styleOverrides: {
        root: { border: 'none', backgroundColor: 'transparent' },
        columnHeaderTitle: { fontFamily: "'IBM Plex Sans'", fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { fontFamily: "'IBM Plex Sans'", fontWeight: 600, textTransform: 'none', borderRadius: '4px' },
      }
    },
    MuiChip: {
      styleOverrides: {
        root: { fontFamily: "'IBM Plex Mono'", fontSize: '0.7rem', fontWeight: 500 },
      }
    },
  }
});
```

---

*Plan complete. Estimated total implementation: 4 weeks for Phases 1–7. Phase 8 is month 2+.*
