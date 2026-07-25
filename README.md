# ReviewFlow AI

> **A modern, AI-powered reputation management platform for agencies and local businesses.**

ReviewFlow AI helps businesses collect more authentic customer reviews, manage their online reputation, automate review request campaigns, and gain actionable insights through AI.

---

## ✨ Features

### MVP

- 🔐 Secure Authentication
- 🏢 Multi-Tenant Architecture
- 👥 Customer Management
- ⭐ Google Business Profile Integration
- 📧 Email Review Requests
- 📱 SMS & WhatsApp Review Requests
- 🤖 AI-Powered Review Reply Drafts
- 📊 Analytics Dashboard
- 🧾 Subscription Billing
- 🎨 White-Label Agency Portal

---

## 🛠 Technology Stack

### Frontend

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend

- Next.js Route Handlers
- Supabase
- PostgreSQL
- Drizzle ORM

### Authentication

- Supabase Auth
- Google OAuth
- Magic Links

### Infrastructure

- Docker
- GitHub Actions
- Vercel (Frontend)
- Supabase (Database)

### AI

- OpenAI
- AI-generated review replies
- Sentiment analysis
- Weekly reputation summaries

---

## 📁 Repository Structure

```text
apps/
  web/
  api/

packages/
  ui/
  auth/
  database/
  supabase/
  logger/
  errors/
  config/
  types/
  utils/
  validation/
  emails/
  shared/

supabase/
docker/
scripts/
tests/
docs/
.github/
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- Docker
- Supabase CLI

### Installation

```bash
git clone https://github.com/<your-username>/reviewflow-ai.git

cd reviewflow-ai

pnpm install
```

### Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Update the required values before starting the application.

### Start Development

```bash
pnpm dev
```

---

## 📚 Documentation

| Document           | Purpose                |
| ------------------ | ---------------------- |
| `CLAUDE.md`        | Engineering standards  |
| `PRD.md`           | Product requirements   |
| `ARCHITECTURE.md`  | System architecture    |
| `DATABASE.md`      | Database schema        |
| `API.md`           | REST API specification |
| `SECURITY.md`      | Security standards     |
| `UI_GUIDELINES.md` | Design system          |
| `ROADMAP.md`       | Development roadmap    |

---

## 🧪 Development Workflow

1. Create a feature branch.
2. Read the relevant documentation.
3. Implement a single feature.
4. Add or update tests.
5. Update documentation.
6. Open a pull request.
7. Merge after review.

### Git hooks

`pnpm install` automatically installs [Husky](https://typicode.github.io/husky/) git hooks (via the `prepare` script) — no manual setup needed:

- **`pre-commit`** runs [lint-staged](https://github.com/lint-staged/lint-staged), which runs `eslint --fix` and `prettier --write` on staged files only.
- **`commit-msg`** runs [Commitlint](https://commitlint.js.org/) against [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `ci:`, `build:`, `perf:`, `style:`, `chore:`) — see `CONTRIBUTING.md` for the full convention.

### Testing

- **Unit tests** use [Vitest](https://vitest.dev/). Package tests are colocated with source (e.g. `packages/utils/src/index.test.ts`); run with `pnpm test`. `apps/web` additionally uses [Testing Library](https://testing-library.com/) + jsdom for component tests (`Sidebar`, `Navbar`, `UserMenu`, login/signup forms, Server Actions).
- **E2e tests** use [Playwright](https://playwright.dev/) (`tests/e2e/`): the original infra smoke test, auth middleware/redirect behavior, and the application shell (public page rendering, 404, responsive layout, no console errors). Run with `pnpm test:e2e` (builds and starts `apps/web` on port 3100 automatically).

### Database

`packages/database` (Drizzle ORM + postgres.js) owns the schema and connection; migration SQL is generated into `supabase/migrations`, not the package itself (see [ADR-0002](docs/architecture/0002-database-and-migrations.md)):

```bash
pnpm db:generate   # Diff packages/database/src/schema against supabase/migrations, write new SQL
pnpm db:migrate    # Apply pending migrations
pnpm db:seed       # Idempotent seed — safe to re-run
```

All three need `DATABASE_URL` set (see `.env.example`).

The first domain schema — `users`, `agencies`, `memberships` — and their repositories (`UserRepository`, `AgencyRepository`, `MembershipRepository`), plus a repository factory (`createRepositories(db)`), are implemented; see `DATABASE.md` section 2a and [ADR-0004](docs/architecture/0004-first-domain-schema.md)/[ADR-0005](docs/architecture/0005-authentication-architecture.md).

### Authentication

`packages/auth` bridges Supabase Auth (identity) to the application's `users` table (business data) — see [ADR-0005](docs/architecture/0005-authentication-architecture.md):

- `createAuthService(...)`: `signUp` / `signIn` / `signOut` / `refreshSession` / `getCurrentSession` / `getCurrentUser` / `syncUser`, wrapping Supabase responses into `AppUser`/`AppSession` types — never a raw session or JWT.
- Session helpers: `requireSession` / `optionalSession` / `requireUser` / `optionalUser` / `requireMembership` (confirms a membership row exists; does not check `role` — see ARCHITECTURE.md section 7).
- `apps/web/src/middleware.ts` protects `/dashboard`, `/settings`, `/account`, `/api/private/*`, redirecting anonymous page requests to `/login?redirect=<path>` and returning a standard 401 JSON error for anonymous API requests. Never queries the application database — only verifies the Supabase session.
- `apps/web/src/lib/api-auth.ts`: `withAuth` / `withUser` / `withMembership` Route Handler wrappers — compose with `withApiContext` for the standard error envelope, e.g. `export const GET = withApiContext(withUser(handler))`. See `GET /api/private/me` for a minimal worked example.

No Google OAuth or RBAC permission enforcement yet.

### Application shell

The first production UI — see [ADR-0006](docs/architecture/0006-application-shell.md):

- **Public:** `/`, `/login`, `/signup`, `/forgot-password`.
- **Protected** (`/dashboard`, `/account`, `/settings`, `/profile`): a shared shell (`app/(protected)/layout.tsx`) with a responsive sidebar/navbar, resolved via `requireMembership` — redirects to `/login` if unauthenticated, shows a friendly access-denied screen if authenticated but not a member of any agency.
- Login/signup/forgot-password are Server Actions calling `packages/auth` directly — never bypassed from a component.
- No business feature UI (reviews, customers, businesses, campaigns, analytics) — the sidebar shows those as disabled "Coming soon" items.

### Health & readiness

- `GET /api/health` — static service identity (name, version).
- `GET /api/live` — liveness: is the process up? No dependency checks.
- `GET /api/ready` — readiness: verifies environment configuration and database connectivity, returning `503` (not `200`) if either fails.

### Docker

```bash
docker build -f docker/Dockerfile.web -t reviewflow-web .
docker run -p 3000:3000 -e DATABASE_URL=... reviewflow-web
```

Multi-stage build via `turbo prune`, non-root runtime user, `HEALTHCHECK` against `/api/live`. See `docker/README.md`.

---

## 📦 Scripts

```bash
pnpm dev           # Start development
pnpm build         # Production build
pnpm lint          # Lint project
pnpm typecheck     # Type checking
pnpm test          # Run unit tests (Vitest)
pnpm test:e2e      # Run Playwright smoke tests
pnpm format        # Format code
pnpm deps:check    # Check dependency version consistency (syncpack)
pnpm deps:fix      # Fix dependency version mismatches (syncpack)
pnpm deps:unused   # Find unused dependencies/files/exports (knip)
pnpm db:generate   # Generate a migration from the Drizzle schema
pnpm db:migrate    # Apply pending migrations
pnpm db:seed       # Run the idempotent seed script
```

---

## 🔒 Security

Security is built into the project from the start.

Highlights include:

- Row Level Security (RLS)
- Role-Based Access Control (RBAC)
- Tenant isolation
- Audit logging
- Secure secrets management
- Input validation
- Rate limiting

See `SECURITY.md` for full details.

---

## 🗺 Roadmap

Current milestone:

- Project Foundation

Upcoming milestones:

- Authentication
- Customer Management
- Review Automation
- Google Business Integration
- AI Features
- Billing
- Public Launch

See `ROADMAP.md` for the complete execution plan.

---

## 🤝 Contributing

Please read `CONTRIBUTING.md` before opening issues or submitting pull requests.

---

## 📄 License

This project is licensed under the terms specified in the `LICENSE` file.

---

## 🌟 Vision

Our goal is to build a scalable, enterprise-grade reputation management platform that agencies can confidently use to manage hundreds of businesses from a single, secure, AI-assisted workspace.
