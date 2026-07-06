# Free Production Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make SolydShop deployable for free with production-quality behavior — no sleeping API, no leaked secrets, auto-deploy on push, documented backups — per `docs/superpowers/specs/2026-07-04-free-deployment-design.md`.

**Architecture:** Frontend (React/Vite) deploys to Vercel via its native GitHub integration. Backend (Spring Boot) + Postgres + Caddy reverse proxy run as Docker Compose services on an Oracle Cloud Always-Free VM, deployed via a GitHub Actions workflow that builds/pushes a Docker image to GHCR and SSHes into the VM to redeploy.

**Tech Stack:** Spring Boot 3.5/Java 17, React 19/Vite 8, Docker + Docker Compose, Caddy 2, GitHub Actions, GHCR, Oracle Cloud (Ampere A1/arm64), DuckDNS, Vercel.

## Global Constraints

- Never commit real secrets. `application.properties` and `.env` stay git-ignored in every repo; only `.example` templates with placeholder values are committed.
- Local dev behavior must not change — every new/changed property keeps its current value as the default, so `./mvnw spring-boot:run` and `npm run dev` work identically to before this plan.
- Target deployment architecture is `linux/arm64` (Oracle Ampere A1) — the Dockerfile and CI build target this platform.
- `SameSite=None` cookies require `Secure=true` (browser requirement) — `cookie.secure` and `cookie.same-site` must always change together.
- No new frontend test framework is introduced (none exists in this repo currently) — that is a separate initiative, out of scope here. Frontend verification steps use build-output inspection instead of unit tests.
- Existing backend test patterns (JUnit 5, `ReflectionTestUtils`, `MockHttpServletResponse`/`MockHttpServletRequest`, no Spring context loading for unit tests) are followed for all new backend tests.

---

## Task 1: [Backend] Externalize config to environment variables

**Files:**
- Modify: `src/main/resources/application.properties` (git-ignored — edited locally, never committed)
- Modify: `src/main/resources/application.properties.example`

**Interfaces:**
- Produces: property keys `cors.allowed-origins`, `cookie.secure`, `cookie.same-site` — consumed by Task 2 (`SecurityConfig`) and Task 3 (`JwtCookieUtil`).
- Produces: `SPRING_PROFILES_ACTIVE` convention (`prod` disables `DataInitializer`, already implemented) — consumed by Task 6 (`docker-compose.yml`).

This task only touches your local, git-ignored `application.properties` plus the committed `.example` template — real secret values never appear in this plan or in git.

- [ ] **Step 1: Wrap every property value in `application.properties` with `${ENV_VAR:default}`, keeping the current value as the default**

  Open your local `src/main/resources/application.properties` (not tracked by git) and transform it to this exact structure — for each `<keep-your-current-value>` marker, paste in whatever is *already* on that line today (do not change the actual value, only wrap it):

  ```properties
  spring.application.name=ecommerce

  # PostgreSQL Database
  spring.datasource.url=${DB_URL:<keep-your-current-value>}
  spring.datasource.driverClassName=org.postgresql.Driver
  spring.datasource.username=${DB_USERNAME:<keep-your-current-value>}
  spring.datasource.password=${DB_PASSWORD:<keep-your-current-value>}

  # JPA
  spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
  spring.jpa.hibernate.ddl-auto=update
  spring.jpa.show-sql=true

  jwt.secret=${JWT_SECRET:<keep-your-current-value>}
  jwt.expiration=${JWT_EXPIRATION:3600000}

  spring.servlet.multipart.max-file-size=10MB
  spring.servlet.multipart.max-request-size=10MB

  cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME:<keep-your-current-value>}
  cloudinary.api-key=${CLOUDINARY_API_KEY:<keep-your-current-value>}
  cloudinary.api-secret=${CLOUDINARY_API_SECRET:<keep-your-current-value>}

  # Stripe
  stripe.secret-key=${STRIPE_SECRET_KEY:<keep-your-current-value>}
  stripe.publishable-key=${STRIPE_PUBLISHABLE_KEY:<keep-your-current-value>}
  # Run: stripe listen --forward-to localhost:8080/api/payment/webhook  to get this value locally
  stripe.webhook-secret=${STRIPE_WEBHOOK_SECRET:<keep-your-current-value>}

  # Mail (SMTP)
  spring.mail.host=smtp.gmail.com
  spring.mail.port=587
  spring.mail.username=${MAIL_USERNAME:<keep-your-current-value>}
  spring.mail.password=${MAIL_PASSWORD:<keep-your-current-value>}
  spring.mail.properties.mail.smtp.auth=true
  spring.mail.properties.mail.smtp.starttls.enable=true

  # Frontend URL for password reset link
  app.frontend-url=${FRONTEND_URL:http://localhost:3000}

  # CORS - comma-separated list of allowed origins
  cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:3000}

  # Auth cookies - both must flip together for cross-site production use
  cookie.secure=${COOKIE_SECURE:false}
  cookie.same-site=${COOKIE_SAME_SITE:Lax}
  ```

  Note: `jwt.expiration` and `app.frontend-url`/`cors.allowed-origins`/`cookie.*` have their real non-sensitive current values spelled out directly since they aren't secrets.

- [ ] **Step 2: Update the committed example template to match**

  Edit `src/main/resources/application.properties.example` — it already has placeholder (non-real) values for everything except the three new properties. Add these three lines at the end, before the closing comment:

  ```properties
  # CORS - comma-separated list of allowed origins
  cors.allowed-origins=http://localhost:3000

  # Auth cookies - both must flip together for cross-site production use
  cookie.secure=false
  cookie.same-site=Lax
  ```

- [ ] **Step 3: Verify local dev still works unchanged**

  Run: `./mvnw spring-boot:run`
  Expected: application starts with no errors, ending in a line like `Started EcommerceApplication in N.NNN seconds`.

  In a second terminal, run: `curl http://localhost:8080/api/public/categories?pageSize=1000`
  Expected: HTTP 200 with a JSON body containing your categories.

  Stop the app (Ctrl+C).

- [ ] **Step 4: Commit**

  ```bash
  git add src/main/resources/application.properties.example
  git commit -m "feat: add CORS/cookie config template entries for deployment"
  ```

  (`application.properties` itself is git-ignored — there is nothing else to stage.)

---

## Task 2: [Backend] Make CORS origins configurable

**Files:**
- Modify: `src/main/java/com/solydshop/ecommerce/security/SecurityConfig.java`
- Create: `src/test/java/com/solydshop/ecommerce/security/SecurityConfigCorsTest.java`

**Interfaces:**
- Consumes: `cors.allowed-origins` property from Task 1 (comma-separated string).
- No change to `SecurityConfig`'s constructor signature or other bean methods.

- [ ] **Step 1: Write the failing test**

  Create `src/test/java/com/solydshop/ecommerce/security/SecurityConfigCorsTest.java`:

  ```java
  package com.solydshop.ecommerce.security;

  import org.junit.jupiter.api.Test;
  import org.springframework.mock.web.MockHttpServletRequest;
  import org.springframework.test.util.ReflectionTestUtils;
  import org.springframework.web.cors.CorsConfiguration;
  import org.springframework.web.cors.CorsConfigurationSource;

  import static org.junit.jupiter.api.Assertions.assertEquals;
  import static org.junit.jupiter.api.Assertions.assertTrue;

  class SecurityConfigCorsTest {

      @Test
      void corsConfigurationSource_splitsAndTrimsCommaSeparatedOrigins() {
          SecurityConfig config = new SecurityConfig(null, null, null);
          ReflectionTestUtils.setField(config, "allowedOrigins",
                  "https://solydshop.vercel.app, http://localhost:3000");

          CorsConfigurationSource source = config.corsConfigurationSource();
          MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/public/products");

          CorsConfiguration resolved = source.getCorsConfiguration(request);

          assertEquals(2, resolved.getAllowedOrigins().size());
          assertTrue(resolved.getAllowedOrigins().contains("https://solydshop.vercel.app"));
          assertTrue(resolved.getAllowedOrigins().contains("http://localhost:3000"));
      }
  }
  ```

- [ ] **Step 2: Run the test to verify it fails**

  Run: `./mvnw test -Dtest=SecurityConfigCorsTest -B`
  Expected: FAIL — compile error, `SecurityConfig` has no field `allowedOrigins`.

- [ ] **Step 3: Add the configurable field and use it in `corsConfigurationSource()`**

  In `SecurityConfig.java`, add the import and field, then use it:

  ```java
  import org.springframework.beans.factory.annotation.Value;
  ```

  Add this field right after the existing three fields (`jwtAuthFilter`, `userDetailsService`, `jwtAuthenticationEntryPoint`):

  ```java
  @Value("${cors.allowed-origins:http://localhost:3000}")
  private String allowedOrigins;
  ```

  Replace the body of `corsConfigurationSource()`:

  ```java
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {

      CorsConfiguration configuration = new CorsConfiguration();

      configuration.setAllowedOrigins(
              java.util.Arrays.stream(allowedOrigins.split(","))
                      .map(String::trim)
                      .toList()
      );
      configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
      configuration.setAllowedHeaders(List.of("*"));
      configuration.setAllowCredentials(true);

      UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
      source.registerCorsConfiguration("/**", configuration);

      return source;
  }
  ```

- [ ] **Step 4: Run the test to verify it passes**

  Run: `./mvnw test -Dtest=SecurityConfigCorsTest -B`
  Expected: PASS (1 test run, 0 failures).

- [ ] **Step 5: Run the full test suite to check for regressions**

  Run: `./mvnw test -B`
  Expected: all tests pass (BUILD SUCCESS).

- [ ] **Step 6: Commit**

  ```bash
  git add src/main/java/com/solydshop/ecommerce/security/SecurityConfig.java src/test/java/com/solydshop/ecommerce/security/SecurityConfigCorsTest.java
  git commit -m "feat: make CORS allowed origins configurable via cors.allowed-origins"
  ```

---

## Task 3: [Backend] Cross-site auth cookies (SameSite/Secure support)

**Files:**
- Modify: `src/main/java/com/solydshop/ecommerce/security/JwtCookieUtil.java`
- Create: `src/test/java/com/solydshop/ecommerce/security/JwtCookieUtilTest.java`

**Interfaces:**
- Consumes: `cookie.secure`, `cookie.same-site` properties from Task 1.
- Produces: `addAccessTokenCookie(HttpServletResponse, String)`, `addRefreshTokenCookie(HttpServletResponse, String)`, `clearCookies(HttpServletResponse)` — unchanged signatures, so `AuthController` (the only caller) needs no changes.

- [ ] **Step 1: Write the failing tests**

  Create `src/test/java/com/solydshop/ecommerce/security/JwtCookieUtilTest.java`:

  ```java
  package com.solydshop.ecommerce.security;

  import org.junit.jupiter.api.Test;
  import org.springframework.mock.web.MockHttpServletResponse;
  import org.springframework.test.util.ReflectionTestUtils;

  import java.util.List;

  import static org.junit.jupiter.api.Assertions.assertEquals;
  import static org.junit.jupiter.api.Assertions.assertFalse;
  import static org.junit.jupiter.api.Assertions.assertTrue;

  class JwtCookieUtilTest {

      private JwtCookieUtil newUtil(boolean secure, String sameSite) {
          JwtCookieUtil util = new JwtCookieUtil();
          ReflectionTestUtils.setField(util, "cookieSecure", secure);
          ReflectionTestUtils.setField(util, "cookieSameSite", sameSite);
          return util;
      }

      @Test
      void addAccessTokenCookie_prod_setsSecureAndSameSiteNone() {
          JwtCookieUtil util = newUtil(true, "None");
          MockHttpServletResponse response = new MockHttpServletResponse();

          util.addAccessTokenCookie(response, "test-token");

          String header = response.getHeader("Set-Cookie");
          assertTrue(header.contains("Secure"));
          assertTrue(header.contains("SameSite=None"));
          assertTrue(header.contains("HttpOnly"));
      }

      @Test
      void addAccessTokenCookie_localDev_defaultsToLaxAndNotSecure() {
          JwtCookieUtil util = newUtil(false, "Lax");
          MockHttpServletResponse response = new MockHttpServletResponse();

          util.addAccessTokenCookie(response, "test-token");

          String header = response.getHeader("Set-Cookie");
          assertTrue(header.contains("SameSite=Lax"));
          assertFalse(header.contains("Secure"));
      }

      @Test
      void clearCookies_setsMaxAgeZeroForBothCookies() {
          JwtCookieUtil util = newUtil(false, "Lax");
          MockHttpServletResponse response = new MockHttpServletResponse();

          util.clearCookies(response);

          List<String> cookies = response.getHeaders("Set-Cookie");
          assertEquals(2, cookies.size());
          assertTrue(cookies.get(0).contains("Max-Age=0"));
          assertTrue(cookies.get(1).contains("Max-Age=0"));
      }
  }
  ```

- [ ] **Step 2: Run the tests to verify they fail**

  Run: `./mvnw test -Dtest=JwtCookieUtilTest -B`
  Expected: FAIL — compile error, `JwtCookieUtil` has no field `cookieSecure`/`cookieSameSite`.

- [ ] **Step 3: Rewrite `JwtCookieUtil` using `ResponseCookie`**

  Replace the full contents of `src/main/java/com/solydshop/ecommerce/security/JwtCookieUtil.java`:

  ```java
  package com.solydshop.ecommerce.security;

  import jakarta.servlet.http.HttpServletResponse;
  import org.springframework.beans.factory.annotation.Value;
  import org.springframework.http.HttpHeaders;
  import org.springframework.http.ResponseCookie;
  import org.springframework.stereotype.Component;

  @Component
  public class JwtCookieUtil {

      private final int ACCESS_TOKEN_EXPIRY = 60 * 60; // 1 hour
      private final int REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days

      @Value("${cookie.secure:false}")
      private boolean cookieSecure;

      @Value("${cookie.same-site:Lax}")
      private String cookieSameSite;

      public void addAccessTokenCookie(HttpServletResponse response, String token) {
          ResponseCookie cookie = ResponseCookie.from("accessToken", token)
                  .httpOnly(true)
                  .secure(cookieSecure)
                  .sameSite(cookieSameSite)
                  .path("/")
                  .maxAge(ACCESS_TOKEN_EXPIRY)
                  .build();
          response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
      }

      public void addRefreshTokenCookie(HttpServletResponse response, String token) {
          ResponseCookie cookie = ResponseCookie.from("refreshToken", token)
                  .httpOnly(true)
                  .secure(cookieSecure)
                  .sameSite(cookieSameSite)
                  .path("/api/auth/refresh")
                  .maxAge(REFRESH_TOKEN_EXPIRY)
                  .build();
          response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
      }

      public void clearCookies(HttpServletResponse response) {
          ResponseCookie access = ResponseCookie.from("accessToken", "")
                  .httpOnly(true)
                  .secure(cookieSecure)
                  .sameSite(cookieSameSite)
                  .path("/")
                  .maxAge(0)
                  .build();

          ResponseCookie refresh = ResponseCookie.from("refreshToken", "")
                  .httpOnly(true)
                  .secure(cookieSecure)
                  .sameSite(cookieSameSite)
                  .path("/api/auth/refresh")
                  .maxAge(0)
                  .build();

          response.addHeader(HttpHeaders.SET_COOKIE, access.toString());
          response.addHeader(HttpHeaders.SET_COOKIE, refresh.toString());
      }
  }
  ```

- [ ] **Step 4: Run the tests to verify they pass**

  Run: `./mvnw test -Dtest=JwtCookieUtilTest -B`
  Expected: PASS (3 tests run, 0 failures).

- [ ] **Step 5: Run the full test suite to check for regressions**

  Run: `./mvnw test -B`
  Expected: BUILD SUCCESS. (This also confirms `AuthController`, the only caller of these methods, still compiles against the unchanged method signatures.)

- [ ] **Step 6: Manual smoke check against a running server**

  Run: `./mvnw spring-boot:run`, then in another terminal:
  ```bash
  curl -i -X POST http://localhost:8080/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"user@mail.com","password":"1234"}'
  ```
  Expected: response headers include `Set-Cookie: accessToken=...; Path=/; Max-Age=3600; HttpOnly; SameSite=Lax` (no `Secure` attribute, matching local defaults). If this account no longer exists (seeding is now dev-only via `DataInitializer`, which still runs when `SPRING_PROFILES_ACTIVE` is unset), sign up a fresh account first via `/api/auth/signup` and retry with those credentials. Stop the app (Ctrl+C).

- [ ] **Step 7: Commit**

  ```bash
  git add src/main/java/com/solydshop/ecommerce/security/JwtCookieUtil.java src/test/java/com/solydshop/ecommerce/security/JwtCookieUtilTest.java
  git commit -m "feat: support SameSite/Secure cookie attributes for cross-site production auth"
  ```

---

## Task 4: [Backend] Add health endpoint

**Files:**
- Modify: `pom.xml`
- Modify: `src/main/java/com/solydshop/ecommerce/security/SecurityConfig.java`

**Interfaces:**
- Produces: `GET /actuator/health` returning `{"status":"UP"}`, unauthenticated — consumed by Task 6's Docker healthcheck and Task 10's verification checklist.

- [ ] **Step 1: Add the Actuator dependency**

  In `pom.xml`, add this dependency inside the existing `<dependencies>` block (next to the other `spring-boot-starter-*` entries):

  ```xml
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-actuator</artifactId>
  </dependency>
  ```

- [ ] **Step 2: Permit unauthenticated access to the health endpoint**

  In `SecurityConfig.java`, in the `authorizeHttpRequests` block, add this line as the first matcher (before `/h2-console/**`):

  ```java
  .requestMatchers("/actuator/health").permitAll()
  ```

- [ ] **Step 3: Verify**

  Run: `./mvnw spring-boot:run`

  In another terminal: `curl -i http://localhost:8080/actuator/health`
  Expected: `HTTP/1.1 200` with body `{"status":"UP"}`.

  Stop the app (Ctrl+C).

- [ ] **Step 4: Run the full test suite to check for regressions**

  Run: `./mvnw test -B`
  Expected: BUILD SUCCESS.

- [ ] **Step 5: Commit**

  ```bash
  git add pom.xml src/main/java/com/solydshop/ecommerce/security/SecurityConfig.java
  git commit -m "feat: add unauthenticated /actuator/health endpoint"
  ```

---

## Task 5: [Backend] Dockerfile

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`

**Interfaces:**
- Produces: a buildable image exposing port `8080` — consumed by Task 6 (`docker-compose.yml`) and Task 7 (CI build).

- [ ] **Step 1: Create `.dockerignore`**

  ```
  target/
  .idea/
  .git/
  *.md
  .mvn/wrapper/maven-wrapper.jar
  ```

- [ ] **Step 2: Create `Dockerfile`**

  ```dockerfile
  # ---- Build stage ----
  FROM eclipse-temurin:17-jdk-alpine AS build
  WORKDIR /app
  COPY .mvn/ .mvn
  COPY mvnw pom.xml ./
  RUN chmod +x mvnw && ./mvnw dependency:go-offline -B
  COPY src ./src
  RUN ./mvnw clean package -DskipTests -B

  # ---- Runtime stage ----
  FROM eclipse-temurin:17-jre-alpine
  WORKDIR /app
  COPY --from=build /app/target/*.jar app.jar
  EXPOSE 8080
  ENTRYPOINT ["java", "-jar", "app.jar"]
  ```

- [ ] **Step 3: Verify the image builds**

  Run: `docker build -t solydshop-backend:local .`
  Expected: build completes with `[+] Building ... FINISHED` and no errors (this will take a few minutes the first time while Maven downloads dependencies).

  This only proves the image builds — full boot verification (with a real database) happens in Task 6.

- [ ] **Step 4: Commit**

  ```bash
  git add Dockerfile .dockerignore
  git commit -m "feat: add multi-stage Dockerfile for backend"
  ```

---

## Task 6: [Backend] Docker Compose stack (app + Postgres + Caddy)

**Files:**
- Create: `docker-compose.yml`
- Create: `Caddyfile`
- Create: `.env.example`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: the image built in Task 5, all env vars named in Task 1's `application.properties`, plus `SPRING_PROFILES_ACTIVE` and `DOMAIN`.
- Produces: the exact deployment shape the VM will run in production — consumed directly by Task 10 (manual VM setup) and Task 7 (CI redeploy commands reference these same service names).

- [ ] **Step 1: Add `.env` to `.gitignore`**

  Append to `.gitignore`:
  ```
  # Docker Compose environment (real secrets, VM-side only)
  .env
  ```

- [ ] **Step 2: Create `docker-compose.yml`**

  ```yaml
  services:
    db:
      image: postgres:16-alpine
      restart: unless-stopped
      env_file: .env
      environment:
        POSTGRES_DB: solydShopdb
        POSTGRES_USER: ${DB_USERNAME}
        POSTGRES_PASSWORD: ${DB_PASSWORD}
      volumes:
        - pgdata:/var/lib/postgresql/data
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME}"]
        interval: 10s
        timeout: 5s
        retries: 5

    backend:
      image: ghcr.io/boatengsamueltuga/solydshop-backend:latest
      build: .
      restart: unless-stopped
      depends_on:
        db:
          condition: service_healthy
      env_file: .env
      environment:
        DB_URL: jdbc:postgresql://db:5432/solydShopdb
        SPRING_PROFILES_ACTIVE: prod
      expose:
        - "8080"

    caddy:
      image: caddy:2-alpine
      restart: unless-stopped
      env_file: .env
      ports:
        - "80:80"
        - "443:443"
      volumes:
        - ./Caddyfile:/etc/caddy/Caddyfile
        - caddy_data:/data
      depends_on:
        - backend

  volumes:
    pgdata:
    caddy_data:
  ```

  `image:` + `build: .` together means `docker compose up --build` builds and tags the image locally for testing, while the VM (which never runs `--build`) just pulls the prebuilt `ghcr.io` image.

- [ ] **Step 3: Create `Caddyfile`**

  ```
  {$DOMAIN} {
      reverse_proxy backend:8080
  }
  ```

- [ ] **Step 4: Create `.env.example`**

  ```
  # Copy to .env (on the VM only) and fill in real values. Never commit .env.

  DB_USERNAME=postgres
  DB_PASSWORD=changeme

  JWT_SECRET=replace-with-a-long-random-string
  JWT_EXPIRATION=3600000

  CLOUDINARY_CLOUD_NAME=your-cloud-name
  CLOUDINARY_API_KEY=your-api-key
  CLOUDINARY_API_SECRET=your-api-secret

  STRIPE_SECRET_KEY=sk_live_replace-me
  STRIPE_PUBLISHABLE_KEY=pk_live_replace-me
  STRIPE_WEBHOOK_SECRET=whsec_replace-me

  MAIL_USERNAME=your-email@gmail.com
  MAIL_PASSWORD=your-app-password

  FRONTEND_URL=https://your-project.vercel.app
  CORS_ALLOWED_ORIGINS=https://your-project.vercel.app

  COOKIE_SECURE=true
  COOKIE_SAME_SITE=None

  DOMAIN=yourname.duckdns.org
  ```

- [ ] **Step 5: Verify the full stack boots locally**

  ```bash
  cp .env.example .env
  ```
  Edit the local `.env` and set `DB_USERNAME=postgres` and `DB_PASSWORD=localtestpass` (the rest can stay as placeholders — nothing else is pinged at startup).

  ```bash
  docker compose up --build -d db backend
  ```
  Wait about 30 seconds for the JVM to start, then:
  ```bash
  docker compose exec backend wget -qO- http://localhost:8080/actuator/health
  ```
  Expected output: `{"status":"UP"}`

  Check logs if it doesn't come up: `docker compose logs backend`

  Clean up:
  ```bash
  docker compose down -v
  rm .env
  ```

- [ ] **Step 6: Commit**

  ```bash
  git add docker-compose.yml Caddyfile .env.example .gitignore
  git commit -m "feat: add Docker Compose stack for backend + Postgres + Caddy"
  ```

---

## Task 7: [Backend] CI/CD workflow (build, push, deploy)

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: `Dockerfile` (Task 5), `docker-compose.yml` service name `backend` (Task 6).
- Requires (documented in Task 10, not creatable by this task): GitHub Actions secrets `VM_HOST`, `VM_USER`, `VM_SSH_KEY`.

- [ ] **Step 1: Create the workflow file**

  ```yaml
  name: Build and Deploy Backend

  on:
    push:
      branches: [main]

  jobs:
    test-build-push:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4

        - uses: actions/setup-java@v4
          with:
            java-version: '17'
            distribution: 'temurin'

        - name: Run tests
          run: ./mvnw test -B

        - uses: docker/setup-qemu-action@v3

        - uses: docker/setup-buildx-action@v3

        - uses: docker/login-action@v3
          with:
            registry: ghcr.io
            username: ${{ github.actor }}
            password: ${{ secrets.GITHUB_TOKEN }}

        - uses: docker/build-push-action@v6
          with:
            context: .
            push: true
            platforms: linux/arm64
            tags: ghcr.io/${{ github.repository_owner }}/solydshop-backend:latest

    deploy:
      needs: test-build-push
      runs-on: ubuntu-latest
      steps:
        - name: Deploy to VM
          uses: appleboy/ssh-action@v1.0.3
          with:
            host: ${{ secrets.VM_HOST }}
            username: ${{ secrets.VM_USER }}
            key: ${{ secrets.VM_SSH_KEY }}
            script: |
              cd ~/solydshop
              docker compose pull backend
              docker compose up -d backend
  ```

- [ ] **Step 2: Verify workflow syntax**

  Run: `docker run --rm -v "${PWD}/.github/workflows:/repo" --workdir /repo rhysd/actionlint:latest deploy.yml`
  Expected: no output (no errors). If actionlint reports issues, fix them before continuing.

  Note: this only validates YAML/Actions syntax. The workflow can't be fully exercised until the VM exists and the three GitHub secrets are set (Task 10) — that end-to-end check is the last item in Task 10's verification checklist.

- [ ] **Step 3: Commit**

  ```bash
  git add .github/workflows/deploy.yml
  git commit -m "feat: add CI/CD workflow to build, push, and deploy backend"
  ```

---

## Task 8: [Backend] VM bootstrap and backup scripts

**Files:**
- Create: `scripts/vm-bootstrap.sh`
- Create: `scripts/backup-db.sh`

**Interfaces:**
- Consumes: `docker-compose.yml`'s `db` service name (Task 6) and its `.env`'s `DB_USERNAME`.
- Produces: the exact commands Task 10's manual runbook tells the user to run on the VM.

- [ ] **Step 1: Create `scripts/vm-bootstrap.sh`**

  ```bash
  #!/usr/bin/env bash
  set -euo pipefail

  # One-time setup for a fresh Oracle Cloud Ubuntu VM. Run as: bash vm-bootstrap.sh

  sudo apt-get update
  sudo apt-get install -y ca-certificates curl gnupg

  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

  sudo usermod -aG docker "$USER"

  # Oracle's default Ubuntu image blocks 80/443 at the iptables level in
  # addition to the Cloud console's security list - both must be opened.
  sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
  sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
  sudo netfilter-persistent save 2>/dev/null || true

  mkdir -p ~/solydshop

  echo "Docker installed. Log out and back in for group membership to take effect, then copy docker-compose.yml, Caddyfile, and .env into ~/solydshop/"
  ```

- [ ] **Step 2: Create `scripts/backup-db.sh`**

  ```bash
  #!/usr/bin/env bash
  set -euo pipefail

  # Nightly Postgres backup. Run via cron from the crontab entry below.
  # crontab -e:
  #   0 3 * * * bash /home/ubuntu/solydshop/scripts/backup-db.sh >> /home/ubuntu/solydshop/backups/backup.log 2>&1

  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  cd "$SCRIPT_DIR/.."

  set -a
  source .env
  set +a

  BACKUP_DIR="./backups"
  mkdir -p "$BACKUP_DIR"

  TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  FILE="$BACKUP_DIR/solydshop-$TIMESTAMP.sql.gz"

  docker compose exec -T db pg_dump -U "$DB_USERNAME" solydShopdb | gzip > "$FILE"

  echo "Backup written to $FILE"

  find "$BACKUP_DIR" -name "solydshop-*.sql.gz" -mtime +7 -delete
  ```

- [ ] **Step 3: Verify script syntax**

  ```bash
  bash -n scripts/vm-bootstrap.sh
  bash -n scripts/backup-db.sh
  ```
  Expected: no output from either command (syntax OK). These scripts target a Linux VM and can't be fully executed on the dev machine — full execution happens during Task 10's VM setup.

- [ ] **Step 4: Commit**

  ```bash
  git add scripts/vm-bootstrap.sh scripts/backup-db.sh
  git commit -m "feat: add VM bootstrap and database backup scripts"
  ```

---

## Task 9: [Frontend] Fix hardcoded API base URL

**Files:**
- Modify: `src/api/api.js`

**Interfaces:**
- Consumes: `VITE_BACK_END_URL` env var (already defined in `.env`, previously unused by this file).

- [ ] **Step 1: Change the hardcoded `baseURL`**

  In `src/api/api.js`, change:
  ```js
  const api = axios.create({

      baseURL: "http://localhost:8080/api",
  ```
  to:
  ```js
  const api = axios.create({

      baseURL: `${import.meta.env.VITE_BACK_END_URL}/api`,
  ```

- [ ] **Step 2: Verify the env var is inlined at build time**

  Run: `npm run build`
  Expected: build completes successfully.

  Run: `grep -r "localhost:8080/api" dist/assets/*.js`
  Expected: at least one match — this confirms Vite substituted `import.meta.env.VITE_BACK_END_URL` with the value from `.env` (`http://localhost:8080`) at build time, rather than shipping a literal `import.meta.env` reference that would be `undefined` at runtime.

- [ ] **Step 3: Verify local dev still works**

  Run: `npm run dev`, open the app in a browser, and confirm the product list loads (proves API calls still reach `http://localhost:8080/api` in dev mode, where the backend from Task 6 or your normal local backend must be running).

  Stop the dev server (Ctrl+C).

- [ ] **Step 4: Commit**

  ```bash
  git add src/api/api.js
  git commit -m "fix: use VITE_BACK_END_URL env var instead of hardcoded localhost API URL"
  ```

---

## Task 10: [Docs] Deployment runbook + manual setup

**Files:**
- Create: `DEPLOYMENT.md` (backend repo root)
- Modify: `README.md` (frontend repo — add a one-line pointer)

**Interfaces:**
- Consumes: every artifact from Tasks 1–9 (the runbook is the execution instructions for all of them, plus the steps only a human with account credentials can do).

- [ ] **Step 1: Create `DEPLOYMENT.md`** (backend repo root)

  ```markdown
  # Deployment Runbook

  One-time setup to get SolydShop running in production for free. Code-level
  changes referenced here are already in place (see
  `docs/superpowers/specs/2026-07-04-free-deployment-design.md` in the
  frontend repo for the full design).

  ## 1. Oracle Cloud VM

  1. Sign up at https://www.oracle.com/cloud/free/ (Always Free tier).
  2. Create a Compute instance: shape "Ampere A1 (VM.Standard.A1.Flex)",
     Ubuntu 24.04, at least 1 OCPU / 6GB RAM (well within the Always Free
     allowance of 4 OCPU / 24GB total).
  3. Under Networking, reserve a **static** public IP for the instance
     (Oracle calls this a "Reserved Public IP") — a dynamic IP would break
     DNS/HTTPS on every reboot.
  4. In the VM's attached Virtual Cloud Network → Security List, add ingress
     rules for TCP ports 22, 80, and 443 from source `0.0.0.0/0`.
  5. Note the VM's public IP and download the SSH private key Oracle gives you.

  ## 2. DuckDNS

  1. Sign up at https://www.duckdns.org (GitHub/Google login).
  2. Create a subdomain (e.g. `solydshop.duckdns.org`) and point it at the
     VM's static public IP from step 1.

  ## 3. VM bootstrap

  1. SSH into the VM: `ssh -i <key> ubuntu@<vm-ip>`
  2. Copy `scripts/vm-bootstrap.sh` to the VM and run it: `bash vm-bootstrap.sh`
  3. Log out and back in (for the `docker` group membership to apply).
  4. Copy `docker-compose.yml`, `Caddyfile`, and `.env.example` into
     `~/solydshop/` on the VM (`scp` from your machine, or `git clone` the
     repo there and copy the files out).
  5. On the VM, `cp .env.example .env` and fill in every real value —
     production Stripe/Cloudinary/mail credentials, a freshly generated
     `JWT_SECRET`, `DB_PASSWORD` (choose a new strong password, this is a
     fresh production database), `FRONTEND_URL`/`CORS_ALLOWED_ORIGINS` set to
     your Vercel URL (step 5 below), `COOKIE_SECURE=true`,
     `COOKIE_SAME_SITE=None`, and `DOMAIN` set to your DuckDNS hostname.
  6. Start the stack: `cd ~/solydshop && docker compose up -d`
  7. Verify: `curl https://<your-duckdns-domain>/actuator/health` from your
     own machine should return `{"status":"UP"}` over a valid HTTPS
     connection (Caddy auto-issues the certificate on first request — this
     may take a few seconds the first time).

  ## 4. GitHub Actions secrets (backend repo)

  Add these under Settings → Secrets and variables → Actions:
  - `VM_HOST` — the VM's public IP or DuckDNS hostname
  - `VM_USER` — `ubuntu`
  - `VM_SSH_KEY` — a **dedicated** deploy keypair's private key (don't reuse
    your personal key): generate with `ssh-keygen -t ed25519 -f deploy_key`,
    add `deploy_key.pub` to the VM's `~/.ssh/authorized_keys`, paste the
    contents of `deploy_key` (private half) as this secret.

  By default, GHCR packages are private — after the first push from CI, go to
  the package's settings on GitHub and make it public (simplest option,
  since the image itself contains no secrets — those are injected via `.env`
  at container runtime). Otherwise the VM's `docker compose pull` will fail
  with an authentication error.

  ## 5. Vercel (frontend)

  1. Sign up at https://vercel.com, connect the `solydshopFrontend` GitHub repo.
  2. In the project's Environment Variables settings, add:
     - `VITE_BACK_END_URL` = `https://<your-duckdns-domain>`
     - `VITE_FRONTEND_URL` = your Vercel deployment URL
     - `VITE_STRIPE_PUBLISHABLE_KEY` = your production Stripe publishable key
  3. Deploy. Every future push to `main` auto-deploys with no extra config.

  ## 6. Stripe

  1. In the Stripe Dashboard, add a webhook endpoint pointing to
     `https://<your-duckdns-domain>/api/payment/webhook`.
  2. Copy its signing secret into the VM's `.env` as `STRIPE_WEBHOOK_SECRET`,
     then `docker compose up -d backend` on the VM to pick it up.
  3. The local `stripe listen` CLI forwarding is no longer needed once this
     is live.

  ## 7. Create the first admin account

  Production intentionally has no default admin account (demo-account
  seeding is dev-only). Sign up normally through the deployed app, then run
  this on the VM to promote that account:

  ```bash
  docker compose exec db psql -U <DB_USERNAME> -d solydShopdb -c \
    "UPDATE user_roles SET role_id = (SELECT role_id FROM roles WHERE role_name = 'ROLE_ADMIN') WHERE user_id = (SELECT user_id FROM users WHERE email = 'your-real-email@example.com');"
  ```

  ## 8. Backups

  On the VM: `crontab -e` and add:
  ```
  0 3 * * * bash /home/ubuntu/solydshop/scripts/backup-db.sh >> /home/ubuntu/solydshop/backups/backup.log 2>&1
  ```
  This keeps the last 7 days of `pg_dump` backups in `~/solydshop/backups/`,
  local to the VM (see the design spec's "known gap" note on off-VM
  replication).

  ## 9. Final verification checklist

  - [ ] `https://<duckdns-domain>/actuator/health` returns 200 over valid HTTPS
  - [ ] Full flow on the live Vercel URL: sign up → log in → browse → add to
        cart → checkout with a Stripe test card → order appears
  - [ ] Refresh the page after logging in — session persists (proves
        `SameSite=None; Secure` cookies work cross-site)
  - [ ] Push a trivial commit to the backend repo — confirm the GitHub
        Actions workflow runs green and `docker compose ps` on the VM shows
        a new container start time
  - [ ] Push a trivial commit to the frontend repo — confirm Vercel
        auto-deploys
  ```

- [ ] **Step 2: Add a pointer from the frontend README**

  Append to the end of `README.md` (frontend repo):

  ```markdown

  ## Deployment

  See `DEPLOYMENT.md` in the `solydshop_ecomm` (backend) repo for the full
  production deployment runbook covering both this frontend and the backend.
  ```

- [ ] **Step 3: Commit**

  In the backend repo:
  ```bash
  git add DEPLOYMENT.md
  git commit -m "docs: add production deployment runbook"
  ```

  In the frontend repo:
  ```bash
  git add README.md
  git commit -m "docs: point to backend repo's deployment runbook"
  ```
