# SolydShop Free Production Deployment — Design

**Date:** 2026-07-04
**Repos affected:** `solydshopFrontend` (this repo) and `solydshop_ecomm` (backend, sibling repo)
**Branch:** `feat/deployment-setup` (created in both repos)

## Goal

Get SolydShop hosted publicly, cheaply, with production-quality behavior — no
sleeping/cold-start API, no exposed secrets, auto-deploy on push, and a
documented recovery path (backups) if something goes wrong. Frontend hosting
(Vercel) is free; the backend runs on a low-cost DigitalOcean droplet rather
than a free-tier host (see "Why DigitalOcean over Oracle Cloud" below).

## Architecture

```
GitHub (main branch)
   │
   ├── push ──► Vercel (auto-deploy via native GitHub integration, zero config)
   │              └── serves the React static build at https://<project>.vercel.app
   │
   └── push ──► GitHub Actions workflow (solydshop_ecomm repo)
                  └── mvn test → build Docker image (linux/amd64) → push to ghcr.io
                        └── SSH into DigitalOcean droplet → docker compose pull && up -d

DigitalOcean droplet (Basic, Ubuntu 24.04, always-on, static public IP)
   │
   ├── Caddy (reverse proxy container) — automatic free HTTPS via Let's Encrypt,
   │     bound to a DuckDNS hostname (Let's Encrypt requires a hostname, not a bare IP)
   ├── Spring Boot backend (container)
   └── PostgreSQL 16 (container, named volume for data persistence)
```

**Why this shape:** Frontend and backend are fully decoupled onto different
hosts talking over HTTPS + CORS — the standard SPA/API pattern, and it
matches the existing two-repo structure. Vercel's CDN never sleeps. A
DigitalOcean droplet is a real always-on box, not a free-tier container
platform that suspends after inactivity — this is what buys "fast" without
the cold-start problem. Docker Compose keeps the backend + DB + proxy stack
reproducible from one file instead of hand-run `apt install` steps that only
exist in one admin's memory.

**Why DigitalOcean over Oracle Cloud:** the original design targeted
Oracle's Always Free Ampere A1 (ARM) tier for zero infrastructure cost, but
that tier is notoriously hard to actually provision (frequent "out of host
capacity" errors across regions) and has a history of reclaiming
free-tier resources it deems idle. Oracle's ARM instances also forced the
CI image build onto `linux/arm64`, and Oracle's default Ubuntu image blocks
80/443 at the iptables level in addition to the console security list — an
extra footgun. DigitalOcean droplets provision instantly, default to
`amd64`, have simpler firewall handling, and a much simpler console. The
tradeoff is real cost (a few dollars/month) instead of Oracle's
theoretical $0 — accepted deliberately for reliability.

## Components

### 1. Backend config externalization (`solydshop_ecomm`)

`application.properties` currently hardcodes every secret (DB password, JWT
secret, Cloudinary keys, Stripe keys, mail credentials). Convert every one to
Spring's `${ENV_VAR:default}` placeholder syntax, keeping today's values as
the defaults — local dev is unaffected (file stays git-ignored, unchanged
values), while the VM's `docker-compose.yml` supplies real production values
via a git-ignored `.env` file.

New/changed properties:
- `cors.allowed-origins` — comma-separated list, read by `SecurityConfig`
  instead of the current hardcoded `List.of("http://localhost:3000")`.
- `cookie.secure` / `cookie.same-site` — new properties consumed by
  `JwtCookieUtil`. Default `false` / `Lax` for local dev.

### 2. Cross-site auth cookies (`solydshop_ecomm`)

`JwtCookieUtil.java` builds cookies with `jakarta.servlet.http.Cookie`, which
has no `SameSite` support, and hardcodes `secure=false` with a `// change to
true in production` comment that was never wired to anything. Since Vercel
and the DuckDNS backend are different domains, browsers require
`SameSite=None; Secure` for the auth cookies to be sent on cross-site API
calls — `Lax` would silently break login in production. Rewrite
`JwtCookieUtil` to build cookies with Spring's `ResponseCookie`
(`org.springframework.http.ResponseCookie`), which supports `.sameSite(...)`,
and wire it to the new `cookie.secure` / `cookie.same-site` properties.

### 3. Health endpoint (`solydshop_ecomm`)

Add Spring Boot Actuator, expose `/actuator/health`. Gives Docker Compose and
Caddy something to check so a crashed backend container is visibly unhealthy
rather than silently serving errors.

### 4. Frontend API URL fix (`solydshopFrontend`)

`src/api/api.js` hardcodes `baseURL: "http://localhost:8080/api"`, ignoring
the existing `VITE_BACK_END_URL` env var entirely. Deployed as-is, every
visitor's browser would try to call their own `localhost:8080` and fail
outright. Fix: `baseURL: import.meta.env.VITE_BACK_END_URL + "/api"`. Set the
real backend URL as a Vercel project environment variable.

### 5. Containerization (`solydshop_ecomm`)

**`Dockerfile`** — multi-stage build (Maven build stage → slim JRE runtime
stage), so the shipped image doesn't carry the JDK or build cache.

**`docker-compose.yml`** (lives on the VM, not necessarily committed since it
references the `.env` file with real secrets — commit a `docker-compose.yml`
with placeholders/comments to the repo for reference, keep the real `.env`
VM-side only) — three services:
- `db`: `postgres:16-alpine`, named volume, health-checked.
- `backend`: image from `ghcr.io`, `depends_on: db (service_healthy)`,
  env vars from `.env`, not exposed to the host directly.
- `caddy`: `caddy:2-alpine`, exposes 80/443, reverse-proxies to `backend`.

**`Caddyfile`**:
```
yourname.duckdns.org {
    reverse_proxy backend:8080
}
```

### 5b. Production seed-data fix (already applied, `solydshop_ecomm`)

A structural review before implementation surfaced that `DataInitializer.java`
unconditionally seeds `admin@mail.com` / `seller1@mail.com` / etc. with a
hardcoded password (`1234`) on every boot, in every environment — deploying
as-is would put a publicly-known admin login on the live production
database. Fixed by annotating it `@Profile("!prod")`, so it only runs when
`SPRING_PROFILES_ACTIVE` is not `prod` (the VM's `.env` will set
`SPRING_PROFILES_ACTIVE=prod`). Production gets no default admin account —
create the real one by signing up normally, then granting `ROLE_ADMIN`
directly in Postgres:
```sql
UPDATE user_roles SET role_id = (SELECT role_id FROM roles WHERE role_name = 'ROLE_ADMIN')
WHERE user_id = (SELECT user_id FROM users WHERE email = 'your-real-email@example.com');
```
Also removed `data.sql` (confirmed dead code — Spring Boot only auto-runs
`data.sql` for embedded databases, and no `spring.sql.init.mode` override
existed to force it for Postgres, so it never actually executed; it also
duplicated `DataInitializer`'s seed data with separate hardcoded IDs). Added
`application.properties.example` as a bootstrap template for new developers,
listing every required property with placeholder values.

**Follow-up (Task 10 review):** the original `@Profile("!prod")` fix put
*all* seeding — including the `ROLE_USER`/`ROLE_ADMIN`/`ROLE_SELLER` rows —
behind the non-prod profile, which was a Critical bug: with no roles in the
database, production signup itself failed (it depends on `ROLE_USER`
existing). Role-seeding was split out into a separate, always-on
`RoleSeeder` component that runs in every environment, while
`DataInitializer` keeps `@Profile("!prod")` and now only seeds the demo
accounts. The distinction: roles are structural data every environment
needs to function; demo accounts with known passwords are a dev-only
convenience.

### 6. CI/CD

**Backend** (`solydshop_ecomm/.github/workflows/deploy.yml`): on push to
`main` — run `./mvnw test` (fail fast before building anything), then build
the Docker image for `linux/amd64` and push to `ghcr.io/<owner>/solydshop-backend`
using the repo's built-in `GITHUB_TOKEN` (no separate registry account),
then SSH into the droplet (`docker/build-push-action` + `appleboy/ssh-action`)
and run `docker compose pull backend && docker compose up -d backend`.

Required GitHub Actions secrets (backend repo): `VM_HOST`, `VM_USER`,
`VM_SSH_KEY` (private key of a deploy-only keypair).

GHCR packages are private by default — the VM needs its own credentials to
`docker compose pull`. Either make the package public (simplest, fine since
the image contains no secrets — those are injected via `.env` at runtime),
or have the VM `docker login ghcr.io` once with a GitHub Personal Access
Token (`read:packages` scope). Default to making the package public unless
the user objects.

**Frontend**: no workflow file needed — Vercel's native GitHub App
integration builds and deploys on every push once the repo is connected in
the Vercel dashboard.

### 7. One-time manual setup (user-executed, credentials only the user holds)

1. DigitalOcean: sign up, create a Basic Ubuntu 24.04 droplet (2 GB RAM
   recommended), add a firewall allowing ports 22/80/443. The droplet's
   public IP is static by default.
2. DuckDNS: sign up, claim a subdomain, point it at the droplet's IP.
3. Droplet bootstrap: SSH in once, run a provided setup script (installs
   Docker + Compose plugin), create the deploy directory with
   `docker-compose.yml`, `Caddyfile`, and a real `.env`.
4. Generate a deploy-only SSH keypair, add the public key to the droplet's
   `authorized_keys`, add the private key + droplet host/user as GitHub
   secrets.
5. Vercel: connect the frontend repo, set `VITE_BACK_END_URL`,
   `VITE_FRONTEND_URL`, `VITE_STRIPE_PUBLISHABLE_KEY` as project env vars.
6. Stripe: replace local `stripe listen` CLI forwarding with a real webhook
   endpoint in the Stripe Dashboard pointing at
   `https://yourname.duckdns.org/api/payment/webhook`; put its production
   signing secret in the VM's `.env`.

### 8. Backups

Nightly cron job on the VM runs `pg_dump` inside the Postgres container to a
timestamped file, keeping the last 7 days locally on the VM's disk.

**Known gap (explicitly out of scope for this pass):** backups are
VM-local only — no off-box replication (e.g. to Backblaze B2). If the VM's
disk is lost, backups are lost with it. Flagging this now as a deliberate
scope cut, not an oversight; worth revisiting later.

## Testing / Verification Plan

1. Build and run the Compose stack (locally or on the VM); confirm
   `/actuator/health` returns 200.
2. Confirm HTTPS works end-to-end via the DuckDNS hostname (valid Let's
   Encrypt cert, no browser warnings).
3. Full manual flow against production: signup → login → browse → cart →
   checkout with a Stripe test card, confirm the webhook fires and the order
   updates.
4. Confirm the login session survives a page refresh — this specifically
   proves the cross-site cookie (`SameSite=None; Secure`) settings work,
   since a broken config would silently drop the session instead of erroring.
5. Push a trivial commit to each repo and confirm both pipelines fire
   automatically: GitHub Actions build+deploy to the VM, and Vercel's
   auto-deploy.

## Explicitly Out of Scope

- Off-VM backup replication (noted above).
- Custom domain / DNS beyond DuckDNS + Vercel's default subdomain.
- Uptime/alerting (e.g. UptimeRobot) — reasonable future addition, not built now.
- Horizontal scaling / multi-instance backend — a single VM is the whole
  point of "free and simple" here.
