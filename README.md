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
  validation/
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

- **Unit tests** use [Vitest](https://vitest.dev/). Package tests are colocated with source (e.g. `packages/utils/src/index.test.ts`); run with `pnpm test`.
- **Smoke tests** use [Playwright](https://playwright.dev/) (`tests/e2e/`), covering that the home page renders and `GET /api/health` returns `200`. Run with `pnpm test:e2e` (builds and starts `apps/web` on port 3100 automatically).

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
