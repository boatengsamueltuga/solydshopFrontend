<div align="center">

# SolydShop — Frontend

**A full-stack e-commerce platform for heavy equipment parts & supplies**, built for three
distinct roles — buyers, sellers, and admins — on top of a Spring Boot REST API.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=fff&labelColor=20232a)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=fff)](https://vitejs.dev)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2-764ABC?logo=redux&logoColor=fff)](https://redux-toolkit.js.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=fff)](https://tailwindcss.com)
[![MUI](https://img.shields.io/badge/MUI-7-007FFF?logo=mui&logoColor=fff)](https://mui.com)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=fff)](https://stripe.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?logo=vercel&logoColor=fff)](https://solydshop.vercel.app)

[**Live Demo**](https://solydshop.vercel.app) · [Backend Repo](https://github.com/boatengsamueltuga/solydshop_ecomm) · [Report a Bug](https://github.com/boatengsamueltuga/solydshopFrontend/issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Authentication & Security](#authentication--security)
- [Roles](#roles)
- [Deployment](#deployment)
- [Related](#related)

## Overview

SolydShop is a full-stack e-commerce platform for sourcing heavy equipment parts (excavators,
bulldozers, cranes, and more). This repo is the **frontend**: a React single-page app that talks
to the [solydshop_ecomm](https://github.com/boatengsamueltuga/solydshop_ecomm) Spring Boot API
over a JWT-cookie-authenticated REST interface, with Stripe handling checkout.

It's built around three roles with dedicated flows — **buyers** browse and order parts,
**sellers** list and fulfill them, and **admins** moderate and run the platform — rather than a
single generic storefront.

## Features

**Buyer**
- Product catalog with keyword search, category and price filters, and in-stock filtering
- Product detail pages with image galleries and customer reviews
- Cart, wishlist, and a multi-step Stripe checkout
- Order history and order confirmation tracking
- B2B quote requests for bulk/custom pricing
- Light/dark theme toggle, responsive mobile layout

**Seller**
- Seller onboarding application flow (with admin approval)
- Seller dashboard: manage own product listings, view/fulfill orders, respond to quote requests
- Seller-to-buyer downgrade request flow

**Admin**
- Full product moderation (approve/reject/suspend/reinstate/archive submissions)
- User management (roles, account unlock/lockout)
- Category management
- Order management and status overrides
- Seller application & downgrade approval queues
- Quote request oversight
- Real-time in-app notifications for key events (new orders, moderation actions, approvals)

## Tech Stack

- **Framework:** React 19 + Vite 8
- **State Management:** Redux Toolkit + react-redux (feature slices under `src/features/`)
- **Styling:** Tailwind CSS 4 + Material UI (MUI) 7 + Emotion
- **Routing:** React Router DOM 7
- **HTTP Client:** Axios (`src/api/api.js`) — CSRF-aware, with centralized error/toast handling
- **Payments:** Stripe (`@stripe/react-stripe-js`, `@stripe/stripe-js`)
- **Notifications:** React Hot Toast
- **Linting:** ESLint 10
- **Deployment:** Vercel

## Project Structure

```
src/
├── api/            # Axios instance — CSRF token handling, global error toasts
├── app/            # Redux store config, MUI theme
├── features/       # Redux Toolkit slices (auth, cart, product, wishlist)
├── pages/          # Route-level pages — home, product detail, cart, checkout,
│                   #   orders, account, seller dashboard, admin dashboard, etc.
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
  deployed instance to point at) — see that repo's README for setup

### Setup

```bash
git clone https://github.com/boatengsamueltuga/solydshopFrontend.git
cd solydshopFrontend
npm install
```

Create a `.env` file in the project root with the variables listed below, then:

```bash
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

## Authentication & Security

- The app authenticates via an **HTTP-only JWT cookie** set by the backend — no tokens are ever
  held in JS-accessible storage.
- Axios is configured with `withCredentials: true` so the cookie is sent automatically with every
  request, and attaches the CSRF header (`X-XSRF-TOKEN`) required by the backend's Spring
  Security CSRF protection — including a same-origin-safe fallback for cross-domain deployments
  (frontend on Vercel, backend on a separate domain).
- Routes are gated by role (buyer, seller, admin) at the router level, in addition to the
  backend's own authorization checks.

## Roles

| Role | Access |
|---|---|
| `ROLE_USER` | Browse, cart, checkout, orders, reviews, wishlist, quote requests |
| `ROLE_SELLER` | Everything above + product management, seller dashboard, quote responses |
| `ROLE_ADMIN` | Full access: user management, product moderation, order management, analytics |

## Deployment

Deployed to Vercel, backed by a Spring Boot API on a DigitalOcean droplet. See
[DEPLOYMENT.md](https://github.com/boatengsamueltuga/solydshop_ecomm/blob/main/DEPLOYMENT.md) in
the backend repo for the full production runbook covering both this frontend and the backend.

## Related

- **Backend:** [solydshop_ecomm](https://github.com/boatengsamueltuga/solydshop_ecomm) — Spring Boot 3.5 / Java 17 REST API
- **Live site:** [solydshop.vercel.app](https://solydshop.vercel.app)
