---
name: SolydShop
description: Multi-vendor heavy machinery parts marketplace — precise, established, built for procurement professionals.
colors:
  # ── Primary — Blush Rose ──────────────────────────────────────────────────
  accent:         "oklch(0.76 0.055 22)"
  accent-hi:      "oklch(0.83 0.048 22)"
  accent-lo:      "oklch(0.65 0.055 22)"
  accent-subtle:  "oklch(0.21 0.022 325)"
  accent-border:  "oklch(0.44 0.040 10)"
  # ── Neutral — Indigo Depths ───────────────────────────────────────────────
  bg:             "oklch(0.17 0.063 275)"
  surface:        "oklch(0.20 0.058 276)"
  surface-mid:    "oklch(0.24 0.055 277)"
  surface-high:   "oklch(0.36 0.058 278)"
  surface-hover:  "oklch(0.41 0.054 278)"
  border-subtle:  "oklch(0.22 0.056 276)"
  border:         "oklch(0.30 0.055 277)"
  border-mid:     "oklch(0.38 0.054 278)"
  border-strong:  "oklch(0.48 0.046 278)"
  text:           "oklch(0.93 0.014 58)"
  text-2:         "oklch(0.81 0.018 38)"
  text-3:         "oklch(0.63 0.035 325)"
  text-4:         "oklch(0.46 0.025 320)"
  # ── Semantic ──────────────────────────────────────────────────────────────
  success:        "oklch(0.63 0.10 160)"
  success-subtle: "oklch(0.18 0.04 160)"
  warning:        "oklch(0.72 0.10 78)"
  warning-subtle: "oklch(0.18 0.04 78)"
  error:          "oklch(0.54 0.14 28)"
  error-subtle:   "oklch(0.18 0.05 28)"
  info:           "oklch(0.62 0.09 250)"
  info-subtle:    "oklch(0.18 0.04 250)"
typography:
  display:
    fontFamily: "'Space Grotesk', system-ui, sans-serif"
    fontSize: "clamp(3rem, 5vw, 5rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Space Grotesk', system-ui, sans-serif"
    fontSize: "clamp(2rem, 3vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Space Grotesk', system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'IBM Plex Mono', 'Cascadia Code', monospace"
    fontSize: "0.625rem"
    fontWeight: 600
    letterSpacing: "0.08em"
rounded:
  none: "0"
  xs: "2px"
  sm: "3px"
  md: "4px"
  lg: "6px"
  pill: "9999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
  16: "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.bg}"
    rounded: "{rounded.md}"
    padding: "10px 24px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.accent-hi}"
    textColor: "{colors.bg}"
    rounded: "{rounded.md}"
    padding: "10px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-2}"
    rounded: "{rounded.md}"
    padding: "10px 24px"
  button-ghost-hover:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    rounded: "{rounded.md}"
    padding: "10px 24px"
  card:
    backgroundColor: "{colors.surface-mid}"
    rounded: "{rounded.md}"
    padding: "20px"
  input:
    backgroundColor: "{colors.surface-high}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
  chip:
    backgroundColor: "{colors.surface-high}"
    textColor: "{colors.text-3}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
---

# Design System: SolydShop

## 1. Overview

**Creative North Star: "The Parts Vault"**

SolydShop lives where industrial scale meets technical precision. The visual system is built like a vault: deep indigo surfaces form the secure, weighty base — authoritative and opaque, the domain of professionals. Against that base, the blush rose accent reads like a phosphor readout on aged instrumentation: warm, precise, and deliberately rare. Everything is labeled, measured, and in its place. Procurement specialists trust this interface not because it explains itself, but because it never has to.

The system rejects decoration entirely. Monospaced type governs all technical metadata — part numbers, order IDs, stock statuses, role labels — because this text is machine-readable and should look it. Body copy runs in IBM Plex Sans, which is warm enough for human reading but carries the lineage of IBM's engineering culture. Space Grotesk handles display and headings with authority: tight tracking, no excess weight above 700.

This design explicitly refuses: Amazon's promotional density, the rounded-card SaaS visual language, grungy industrial textures, and fashion-store editorial whitespace. Each of those modes has the wrong priority. The Parts Vault's priority is one thing: getting the right part into the right cart in the shortest possible path.

**Key Characteristics:**
- Deep indigo foundation (#22223b) with five-stop tonal layering — depth without shadows
- Blush rose accent (#c9ada7) used at ≤10% surface coverage — rarity is the signal
- IBM Plex Mono for all technical identifiers; IBM Plex Sans for copy
- 3–4px border radius throughout; pill reserved for badges only
- Semantic color used exclusively for status signals — never for decoration

## 2. Colors: The Vault Palette

Five anchors, two families, one governing rule about restraint.

### Primary — Blush Rose
- **Graphite Blush** (`oklch(0.76 0.055 22)` / `#c9ada7`): The primary brand accent. Used on: primary buttons, prices, active nav links, focus borders, accent glows. Deliberately delicate against the deep indigo base — the contrast is what makes it distinctive. Never used decoratively.
- **Lifted Blush** (`oklch(0.83 0.048 22)` / `#dcc0ba`): Hover state for accent-bearing elements. One step lighter, same rose warmth.
- **Deep Blush** (`oklch(0.65 0.055 22)` / `#ae8d87`): Pressed/active state. Used for the edit-mode top border on forms — just enough shift from primary to signal "modifying existing".
- **Rose Tint** (`oklch(0.21 0.022 325)` / `#2f2438`): The accent subtle background — a very dark mauve used behind highlighted rows and selected states. Distinct from the indigo bg by hue, not just lightness.
- **Rose Border** (`oklch(0.44 0.040 10)` / `#7c5254`): The accent-tinted border for outlined accent elements.

### Neutral — Indigo Depths
- **Vault Indigo** (`oklch(0.17 0.063 275)` / `#22223b`): The deepest background. The page canvas for all views including admin, seller, and buyer.
- **Lifted Indigo** (`oklch(0.20 0.058 276)` / `#27243f`): First surface lift. Used for dialog interiors, DataGrid column headers, and the top navigation bar background.
- **Raised Indigo** (`oklch(0.24 0.055 277)` / `#2f2c4d`): Second lift. Used for DataGrid row hover states, menu item hover states, and form panel backgrounds.
- **Storm Slate** (`oklch(0.36 0.058 278)` / `#4a4e69`): The primary card and input background. High enough contrast against vault indigo to clearly define panel boundaries.
- **Storm Hover** (`oklch(0.41 0.054 278)` / `#565a7a`): Card/input hover state, one stop above storm slate.
- **Hairline Border** (`oklch(0.22 0.056 276)` / `#29263d`): The subtlest surface division. Used for DataGrid cell borders and row dividers inside panels.
- **Standard Border** (`oklch(0.30 0.055 277)` / `#3e3c5c`): The default 1px border around all cards, inputs, dialogs, and section dividers.
- **Blueprint Linen** (`oklch(0.93 0.014 58)` / `#f2e9e4`): Primary text. The warm off-white — noticeably warmer than a pure white, which would create a harsh cool/warm clash against the indigo base.
- **Warm Parchment** (`oklch(0.81 0.018 38)` / `#cfbfb6`): Secondary text. Labels, metadata, ghost button text, nav link defaults.
- **Smoked Mauve** (`oklch(0.63 0.035 325)` / `#9a8c98`): Tertiary text. Table headers, eyebrow labels, DataGrid column titles. The hue bridges the indigo surfaces and the blush accent — a chromatic connector.
- **Muted Mauve** (`oklch(0.46 0.025 320)` / `#6e6170`): Placeholder text in inputs.

### Semantic
- **Forge Green** (`oklch(0.63 0.10 160)` / `#2a9e7a`): In-stock status, success confirmations, price totals.
- **Amber Signal** (`oklch(0.72 0.10 78)` / `#c7a020`): Low stock warnings, seller-role badges, warning states.
- **Critical Red** (`oklch(0.54 0.14 28)` / `#bf3628`): Error states, admin-role badges, delete confirmations.
- **Blueprint Blue** (`oklch(0.62 0.09 250)` / `#4a72bf`): Informational status, user-role badges, neutral status indicators.

Each semantic color has a matching subtle variant (15–18% lightness, same hue) for use as the background behind status badges and alert panels.

### Named Rules
**The Blush Discipline Rule.** The blush rose accent (`--accent`) appears on ≤10% of any given screen's surface area. Its rarity is its signal. If more than one element category per screen uses the accent for decoration, one of them is wrong. Buttons, prices, and active nav links are its three legitimate territories.

**The Semantic Exclusivity Rule.** Forge green, amber signal, critical red, and blueprint blue are status colors, not brand colors. They appear only on status badges, stock indicators, alert panels, and role labels — never as stylistic choices.

## 3. Typography

**Display Font:** Space Grotesk (with system-ui, sans-serif fallback)
**Body Font:** IBM Plex Sans (with system-ui, sans-serif fallback)
**Label / Mono Font:** IBM Plex Mono (with Cascadia Code, monospace fallback)

**Character:** Space Grotesk brings optical authority to headings — its slightly wide proportions read confidently at large sizes without feeling aggressive. IBM Plex Sans carries the IBM engineering lineage in a humanist package: warm enough for prose, disciplined enough for a technical interface. IBM Plex Mono in uppercase, tracked wide, is the system's strongest typographic signal: when you see it, you're reading machine-readable data.

### Hierarchy
- **Display** (700 weight, `clamp(3rem, 5vw, 5rem)`, line-height 1.05, letter-spacing -0.02em): Page-level hero headings only. Used on marketing surfaces and the auth pages. Not used inside the app shell.
- **Headline** (700, `clamp(2rem, 3vw, 2.5rem)`, 1.1, -0.01em): Page titles within the app — the h1 on every dashboard, form, and catalog view.
- **Title** (600, `1.5rem`, 1.2, -0.01em): Section headings, dialog titles, panel headers. Space Grotesk, slightly lighter than headline weight.
- **Body** (400, `1rem`, 1.6): All prose, descriptions, and narrative copy. IBM Plex Sans. Max line length 65–75ch on reading-heavy views.
- **Label** (IBM Plex Mono 600, `0.625rem` / 10px, letter-spacing 0.08em, UPPERCASE): All technical metadata — part numbers, order IDs, SKUs, stock status labels, column headers, role badges, section eyebrows. This is the system's most frequently used text style.

### Named Rules
**The Monospace Manifest Rule.** Every piece of text that a machine could generate or parse — part numbers, order IDs, prices in data tables, stock status, role badges — renders in IBM Plex Mono. Copy that a human writes — product names, descriptions, button labels — renders in IBM Plex Sans. This distinction is semantic, not stylistic; it makes the interface scannable at procurement speed.

**The Letter-Spacing Floor Rule.** Display and headline letter-spacing never tighter than -0.02em. Label letter-spacing never looser than 0.06em. These two numbers mark the system's typographic poles; nothing outside them.

## 4. Elevation

SolydShop uses **tonal layering**, not drop shadows, as its primary depth system. Five stops on the indigo scale convey elevation: vault indigo (bg) → lifted indigo (surface) → raised indigo (surface-mid) → storm slate (surface-high) → storm hover. Each stop is a visible step the eye can distinguish; the hierarchy is literal and legible.

Drop shadows exist in the system but have a narrow role: floating overlays only. Dialogs, drawers, and tooltip panels use `--shadow-2` or `--shadow-3` (black at 60–70% opacity) to separate the overlay from the surface beneath it. No cards, no buttons, no inputs carry a drop shadow.

### Shadow Vocabulary
- **Ambient** (`--shadow-1: 0 1px 2px oklch(0 0 0 / 0.50)`): The smallest shadow. Used only for toolbar elements and floating badges that need the lightest separation from their surface.
- **Lifted** (`--shadow-2: 0 2px 8px oklch(0 0 0 / 0.60)`): Standard overlay shadow. Dialogs and drawers.
- **Deep** (`--shadow-3: 0 4px 16px oklch(0 0 0 / 0.70)`): Maximum overlay shadow. Full-screen modals and side sheets.
- **Accent Bloom** (`--shadow-accent: 0 0 16px oklch(0.76 0.055 22 / 0.25)`): A focused glow ring in blush rose. Applied to primary buttons on hover and to the active/selected state of accent-bordered inputs. Not a depth shadow — a radiance signal.

### Named Rules
**The Flat-By-Default Rule.** Cards, inputs, panels, and buttons are completely flat at rest. Depth comes from background color, not shadow. Applying a `box-shadow` to a card or input is prohibited.

## 5. Components

### Buttons
Compact, precise, and immediate. The shape conveys something engineered, not designed.

- **Shape:** Gently squared corners (4px radius / `--r-md`). Never softer.
- **Primary:** Blush rose background (`--accent`), vault indigo text (`--bg`). Uppercase, IBM Plex Mono label weight (700), 0.04em letter-spacing, 10px top/bottom padding, 24px side padding. On hover: opacity 0.88. On active: opacity 0.75.
- **Focus:** `outline: 2px solid var(--accent)` at 2px offset. Always visible; never hidden.
- **Ghost:** Transparent background, `--border` (1px solid), `--text-2` color. On hover: border shifts to `--accent`, text shifts to `--accent`. No background change.
- **Disabled state** (both variants): `--border` background, `--text-3` text, `cursor: not-allowed`. Never a grayed-out version of the primary — a flat neutral surface.

### Chips / Status Badges
The most-used component in the system. Every data table, every user, every order, every product carries at least one.

- **Style:** IBM Plex Mono, 11px, 600 weight, uppercase, 0.04–0.08em letter-spacing, 2px 8px padding, 3px radius (`--r-sm`).
- **Semantic variants:** Background = the `*-subtle` color (very dark, 18% lightness). Text = the semantic main color. No border.
- **Neutral chip:** `--surface-high` background, `--text-2` color. For order statuses that don't map to a semantic signal.
- **Role badges** use semantic colors: ROLE_ADMIN → critical red pair, ROLE_SELLER → amber signal pair, ROLE_USER → blueprint blue pair.

### Cards / Panels
The primary content container across all three roles.

- **Corner Style:** 4px radius (`--r-md`). Never larger.
- **Background:** `--surface-mid` for standard panels; `--surface-high` for inputs embedded within panels.
- **Shadow Strategy:** None. Depth is conveyed by the background color step above `--surface`, not by shadow.
- **Border:** 1px solid `--border`. Always present — the border defines the panel boundary where the background alone is insufficient against the vault indigo base.
- **Hover border:** On interactive cards (product cards), hover shifts border to `--accent`. No other property changes.
- **Accent top border:** 3px solid `--accent` on the top edge of primary form panels (Add Product, Edit Product). Edit-mode uses `--accent-lo` instead to distinguish create from modify.
- **Internal Padding:** 20px (`--space-5`) standard; 24px (`--space-6`) for section-level containers.

### Inputs / Fields
MUI OutlinedInput with custom overrides. Visually consistent with native inputs.

- **Style:** `--surface-high` background, `--border` outline, 3px radius (`--r-sm`).
- **Focus:** Border shifts to `--accent`, with a faint accent bloom ring (`box-shadow: 0 0 0 2px oklch(0.76 0.055 22 / 0.15)`). The InputLabel above also shifts to `--accent` on focus.
- **Placeholder:** `--text-4` (muted mauve). 4.5:1 contrast verified against `--surface-high`.
- **Disabled:** `cursor: not-allowed`, opacity 0.5. The border and background remain; only the text treatment degrades.
- **Error:** Outlined input border shifts to `--error`; label shifts to `--error`.

### Navigation
Two navigation surfaces: the fixed top nav bar and the mobile bottom nav.

- **Top nav:** Fixed, 80px height, `--surface` background (one stop above bg), 1px `--border` bottom. Logo in Space Grotesk 700 24px, `--accent` color. Links in IBM Plex Sans 500 14px, `--text-3` default, `--accent` on active and hover. Active link carries a 2px `--accent` underline.
- **Mobile bottom nav** (below 767px): Fixed bottom, 64px height, `--surface` background, 1px `--border` top. Four icon+label tabs. Icon+label in `--accent` when active, `--text-3` when inactive. Min-height 44px per tab for touch targets.

### DataGrid (Admin / Seller Tables)
The primary interface for admin users and sellers. Designed for data density.

- **Header row:** `--surface` background, `--border` bottom. Column titles in IBM Plex Mono 600 0.75rem UPPERCASE, `--text-2` color.
- **Cells:** `--border-subtle` cell dividers. IBM Plex Sans 14px.
- **Row hover:** `--surface-mid` background. Instant, no transition.
- **Footer:** `--surface` background, `--border` top.
- **No outer border.** The DataGrid inherits the panel's own border — no second border is applied.

### Skeleton / Loading States
`--surface` base, `--surface-high` fill blocks, Tailwind `animate-pulse`. Used in product cards and table rows.

## 6. Do's and Don'ts

### Do:
- **Do** use IBM Plex Mono for every part number, order ID, SKU, stock label, column header, and role badge — regardless of where it appears in the UI.
- **Do** keep the blush rose accent to ≤10% of screen coverage. Its restraint is what makes it readable as a signal.
- **Do** use the five-stop indigo tonal ramp to convey depth. Background → surface → surface-mid → surface-high → surface-hover is the hierarchy; use the correct stop for the correct elevation.
- **Do** put semantic colors (forge green, amber, critical red, blueprint blue) on status signals only. Stock level, order status, user role — these are their territories.
- **Do** keep border-radius at 3–4px for interactive elements (inputs, cards, buttons). 6px (`--r-lg`) for large dialogs. Pill (9999px) for status badges and role chips only.
- **Do** place price figures in IBM Plex Mono, blush rose (`--accent`), 700 weight. Price is the clearest signal of value; it should read instantly.
- **Do** label all technical eyebrows (section identifiers, table labels, form field labels) in IBM Plex Mono UPPERCASE at 0.625rem with 0.08em letter-spacing.
- **Do** respect `prefers-reduced-motion` — zero all `--duration-*` variables at the media query level.

### Don't:
- **Don't** use the blush rose accent for decoration, dividers, background tints, or illustration. It exists for primary actions and price displays. No other uses.
- **Don't** apply drop shadows to cards, panels, inputs, or buttons. Flat-by-default. Shadows are for floating overlays (dialogs, drawers, tooltips) only.
- **Don't** use border-radius greater than 6px on any non-badge element. Rounded corners above 6px read as consumer UI — "insanely rounded" is the codex tell this system is built to avoid.
- **Don't** add promotional UI patterns — deal banners, urgency badges ("🔥 Only 3 left!"), rainbow accent colors, or sticky "BUY NOW" overlays. SolydShop is not Amazon or AliExpress. The platform's restraint is part of its professional signal.
- **Don't** import SaaS visual language: gradient hero sections, glassmorphism panels, hero metric templates (big number + small label + gradient accent), or pill-shaped primary nav items. This is a marketplace, not a B2B software dashboard.
- **Don't** use grungy industrial visual tropes — gear/bolt imagery, dark textures meant to suggest a workshop floor, or halftone/blueprint background patterns. The brand is industrial in its values (precision, reliability), not in its visual metaphors.
- **Don't** use consumer fashion / lifestyle aesthetics — editorial whitespace, product photography as the primary grid element, or luxury-minimalism card treatments. Buyers here are procurement professionals, not lifestyle shoppers.
- **Don't** put any technical text (part numbers, IDs, statuses, prices in tables) in IBM Plex Sans. The Monospace Manifest Rule is a semantic distinction; violating it makes the interface harder to scan.
- **Don't** use color alone to signal status. Every stock status, order status, and role badge must carry a text label alongside its color. "IN STOCK" in forge green — not just a green dot.
- **Don't** pair `border: 1px solid X` with a `box-shadow` blur ≥16px on the same element. Ghost-card syndrome. Pick one: a defined border, or a shadow.
