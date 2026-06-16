# SolydShop Design System

## 1. Brand Identity
**SolydShop** — Industrial B2B e-commerce marketplace for heavy machinery parts (ECM modules, hydraulic systems, track motors, excavator components). Professional, technical, trustworthy.

## 2. Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#0D1B2A` | Page background |
| Surface | `#1B2A3D` | Cards, panels, navbar |
| Surface High | `#243447` | Inputs, elevated surfaces |
| Border | `#2D4263` | All borders, dividers |
| Text | `#dee3e8` | Primary text |
| Text Muted | `#bdc8d1` | Secondary text, labels |
| Text Dim | `#87929a` | Placeholders, captions |
| Primary | `#8ed5ff` | Headings, links, accents, active states |
| Button BG | `#38bdf8` | CTA buttons background |
| Button Text | `#003a57` | CTA button text |
| Error | `#ffb4ab` | Errors, destructive actions |
| Footer | `#091522` | Footer background |

## 3. Typography
- **Font:** Inter (sans-serif)
- **Headings:** Bold, Primary color (`#8ed5ff`)
- **Body:** Regular, Text color (`#dee3e8`)
- **Captions:** Small, Text Dim (`#87929a`)

## 4. Component Patterns
- **Cards:** `background: #1B2A3D`, `border: 1px solid #2D4263`, `border-radius: 8px`
- **Inputs:** `background: #243447`, `border: 1px solid #2D4263`, rounded-lg, focus border → `#8ed5ff`
- **Primary Buttons:** `background: #38bdf8`, `color: #003a57`, bold, rounded-lg
- **Ghost Buttons:** `background: #243447`, `border: 1px solid #2D4263`, text muted
- **Badges:** Semi-transparent colored backgrounds with matching text
- **Tables/DataGrids:** Dark surface rows, primary color headers
- **Navbar:** `background: #1B2A3D`, fixed top, height 80px

## 5. Roles & Access
- **ROLE_USER** — Browse products, cart, checkout, orders
- **ROLE_SELLER** — Manage own products (CRUD), seller dashboard
- **ROLE_ADMIN** — Full access: users, all products, categories, all orders, analytics

## 6. Design System Notes for Stitch Generation (REQUIRED BLOCK)
```
Dark industrial e-commerce theme. Background: #0D1B2A. Cards/panels: #1B2A3D with #2D4263 borders. 
Primary accent: #8ed5ff (light blue). CTA buttons: #38bdf8 background with #003a57 dark text. 
Font: Inter. All text on dark backgrounds. Cards have subtle border and slight shadow on hover.
Professional B2B industrial parts marketplace aesthetic. Dense, data-rich layouts.
Navigation: fixed dark navbar with logo "SolydShop" in primary blue.
```
