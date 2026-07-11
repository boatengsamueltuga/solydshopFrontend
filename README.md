# SolydShop — Frontend (solydshopFrontend)

React frontend for [SolydShop](https://solydshop.vercel.app), a full-stack e-commerce platform
for buyers, sellers, and admins. Talks to the
[solydshop_ecomm](https://github.com/boatengsamueltuga/solydshop_ecomm) Spring Boot API over a
JWT-cookie-authenticated REST API.

**Live site:** [solydshop.vercel.app](https://solydshop.vercel.app)

## Tech Stack

- **Framework:** React 19 + Vite 8
- **State Management:** Redux Toolkit + react-redux (feature slices under `src/features/`)
- **Styling:** Tailwind CSS 4 + Material UI (MUI) 7 + Emotion
- **Routing:** React Router DOM 7
- **HTTP Client:** Axios (`src/api/api.js`)
- **Payments:** Stripe (`@stripe/react-stripe-js`, `@stripe/stripe-js`)
- **Notifications:** React Hot Toast
- **Deployment:** Vercel

## Project Structure

```
src/
├── api/            # Axios instance (CSRF token handling, global error toasts)
├── app/            # Redux store config, MUI theme
├── features/       # Redux Toolkit slices (auth, cart, product, wishlist)
├── pages/          # Route-level pages (home, product, cart, checkout, account,
│                   #   seller dashboard, admin dashboard, etc.)
├── components/     # Layouts, navigation, shared/common UI, product & quote components
├── hooks/          # Custom React hooks
├── utils/          # Formatting and other helpers
├── styles/         # Design tokens, typography
├── App.jsx         # Route definitions
└── main.jsx        # Entry point (Redux Provider, Router, MUI ThemeProvider)
```

## Getting Started

### Prerequisites

- Node.js 18+
- The [backend API](https://github.com/boatengsamueltuga/solydshop_ecomm) running locally (or a
  deployed instance to point at)

### Setup

```bash
npm install
cp .env.example .env   # if present — otherwise create .env with the variables below
npm run dev
```

The app starts on `http://localhost:3000`.

## Environment Variables

Defined in `.env` (must be prefixed `VITE_` to be exposed to the client):

| Variable | Purpose |
|---|---|
| `VITE_BACK_END_URL` | Backend API base URL (e.g. `http://localhost:8080`) |
| `VITE_FRONTEND_URL` | This app's own URL, used for redirect links |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for the checkout flow |

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (port 3000) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Authentication

The app authenticates via an HTTP-only JWT cookie set by the backend. Axios is configured with
`withCredentials: true` so the cookie is sent automatically with every request; protected routes
are gated by role (buyer, seller, admin).

## Roles

| Role | Access |
|---|---|
| `ROLE_USER` | Browse, cart, checkout, orders, reviews, wishlist |
| `ROLE_SELLER` | Everything above + product management, seller dashboard |
| `ROLE_ADMIN` | Full access: user management, product moderation, analytics |

## Deployment

Deployed to Vercel. See [DEPLOYMENT.md](https://github.com/boatengsamueltuga/solydshop_ecomm/blob/main/DEPLOYMENT.md)
in the backend repo for the full production runbook covering both this frontend and the backend.

## Related

- Backend: [solydshop_ecomm](https://github.com/boatengsamueltuga/solydshop_ecomm)
- Live site: [solydshop.vercel.app](https://solydshop.vercel.app)
