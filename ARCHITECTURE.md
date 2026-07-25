# ARCHITECTURE.md

# ReviewFlow AI - System Architecture

**Version:** 1.0

**Architecture Style:** Modular Monolith (MVP) → Microservice Ready

---

# 1. Architecture Goals

The platform must be:

- Multi-tenant
- Secure by default
- Highly maintainable
- Horizontally scalable
- API-first
- AI-ready
- Cloud-native
- Mobile-ready
- White-label capable

---

# 2. High-Level Architecture

```text
                    Browser / Mobile
                           │
                           ▼
                Next.js 15 (App Router)
                           │
                           ▼
                 Route Handlers / Server Actions
                           │
                           ▼
                 Application Service Layer
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   Customer Service   Review Service   Billing Service
          ▼                ▼                ▼
              Repository / Data Access Layer
                           │
                           ▼
                     Supabase / PostgreSQL
                           │
      ┌──────────────┬───────────────┬──────────────┐
      ▼              ▼               ▼              ▼
 Google Business   Stripe       OpenAI        Messaging APIs
```

---

# 3. Monorepo Structure

```text
reviewflow-ai/

apps/
  web/
  admin/
  docs/

packages/
  ui/
  auth/
  api/
  database/
  supabase/
  logger/
  errors/
  billing/
  ai/
  analytics/
  shared/
  config/
  types/
  utils/
  validation/
  emails/

supabase/
scripts/
docs/
tests/
```

---

# 4. Application Layers

## Presentation Layer

Responsibilities:

- UI
- Forms
- Tables
- Charts
- Layouts

Must never contain business logic.

**Implementation status:** the first production application shell (public auth pages, protected dashboard/account/settings/profile, sidebar/navbar/user-menu navigation) is implemented — see [ADR-0006](docs/architecture/0006-application-shell.md). No business feature UI (reviews, customers, businesses, billing) yet; the sidebar shows those as disabled placeholders.

---

## Application Layer

Responsibilities:

- Use cases
- Validation
- Authorization
- Workflow orchestration

---

## Service Layer

Responsibilities:

- Customer management
- Review requests
- AI features
- Billing
- Analytics

Business rules belong here.

---

## Repository Layer

Responsibilities:

- Database access
- Query optimization
- Transactions

No UI code.

---

## Database Layer

Responsibilities:

- Storage
- Constraints
- Indexes
- Row Level Security

---

# 5. Multi-Tenant Model

```text
Platform
    │
Agency
    │
Business
    │
Location
    │
Customer
```

Every record belongs to a tenant.

No cross-tenant access.

Tenant isolation is enforced in:

- Authentication
- Authorization
- Database policies
- API layer

---

# 6. Authentication Flow

```text
User Login
      │
      ▼
Supabase Auth
      │
      ▼
JWT Verification
      │
      ▼
Load Tenant Context
      │
      ▼
Permission Check
      │
      ▼
Access Granted
```

**Implementation status** (`packages/auth`, see [ADR-0005](docs/architecture/0005-authentication-architecture.md)): Supabase Auth (JWT Verification, via `getUser()` — never the locally-decoded `getSession()`) and Load Tenant Context (`requireMembership` — confirms a membership row exists) are implemented. Permission Check (role/capability enforcement) is not — `requireMembership` deliberately stops at "a membership exists," not "this role permits this action." Google OAuth and password reset are not implemented; only email/password `signUp`/`signIn` exist so far.

---

# 7. Authorization (RBAC)

Roles:

- Super Admin
- Agency Owner
- Agency Staff
- Business Owner
- Manager
- Employee

Every API endpoint must verify:

1. Authentication
2. Tenant
3. Role
4. Permission

**Implementation status:** `memberships.role` (Sprint 3A) stores one of `owner` / `admin` / `member` but nothing yet enforces it — steps 1–2 above are implemented (`requireUser`, `requireMembership`); steps 3–4 (role/permission enforcement) are future work, per ADR-0005's "Future RBAC" section.

---

# 8. Core Modules

## Authentication

- Login
- Logout
- Password reset
- Google OAuth
- Session management

**Implementation status:** `packages/auth` implements `signUp`/`signIn`/`signOut`/`refreshSession`/`getCurrentUser`/`getCurrentSession`/`syncUser`/`requestPasswordReset`, session helpers (`requireSession`/`optionalSession`/`requireUser`/`optionalUser`/`requireMembership`), and Edge-safe route-protection middleware. Login, signup, and forgot-password pages (`apps/web`) are implemented on top of these — see ADR-0006. Password reset is request-only (no `/reset-password` completion page yet); Google OAuth and MFA are not implemented.

---

## Customer Module

- CRUD
- Import
- Export
- Search
- Notes
- Tags

---

## Review Module

- Send requests
- Track delivery
- Sync reviews
- AI reply drafts

---

## Campaign Module

- Workflow builder
- Scheduling
- Automation history

---

## Billing Module

- Stripe
- Plans
- Invoices
- Trials
- Webhooks

---

## Analytics Module

- KPIs
- Reports
- Charts
- Campaign performance

---

# 9. Integrations

## Google Business Profile

Purpose:

- Connect business accounts
- Sync locations
- Import reviews
- Draft replies

---

## Messaging

Channels:

- Email
- SMS
- WhatsApp

Delivery status stored in database.

---

## AI

OpenAI provides:

- Review replies
- Sentiment analysis
- Weekly summaries
- Monthly reports

AI responses are always reviewed by the user before publishing.

---

# 10. Background Jobs

Use background processing for:

- Sending campaigns
- Import jobs
- Review synchronization
- Scheduled reports
- Analytics generation

Jobs must be:

- Retryable
- Logged
- Idempotent where possible

---

# 11. API Design

REST-first architecture.

Conventions:

- Versioned endpoints (`/api/v1`)
- JSON responses
- Standard error format
- Pagination
- Filtering
- Sorting
- Rate limiting

---

# 12. Database Design Principles

- UUID primary keys
- Foreign keys enforced
- Index frequently queried columns
- Soft deletes only where justified
- Audit important actions
- Store timestamps in UTC

---

# 13. File Storage

Use Supabase Storage for:

- Logos
- QR code assets
- User uploads
- Exported reports

Never store files in the application container.

---

# 14. Caching Strategy

Cache:

- Dashboard metrics
- Analytics
- Business settings
- Public widgets

Invalidate cache on data changes.

---

# 15. Error Handling

Every service must:

- Log unexpected errors
- Return typed errors
- Avoid exposing internal details
- Include correlation/request IDs for debugging

Implemented by `packages/errors` (`AppError` and its `ValidationError`/`ConfigurationError`/`DatabaseError` subclasses, plus `toApiErrorResponse`/`toApiSuccessResponse` matching the envelope in `API.md` section 3) and `packages/logger`'s request-context binding — see [ADR-0003](docs/architecture/0003-observability-and-error-handling.md).

---

# 16. Security

Mandatory protections:

- Row Level Security
- RBAC
- HTTPS only
- Secure cookies
- Input validation
- Output sanitization
- CSRF protection
- XSS prevention
- SQL injection prevention
- Audit logging

---

# 17. Observability

Monitoring:

- Sentry
- PostHog
- Structured application logs
- Health endpoints
- Error alerts

Structured logging (`packages/logger`, Pino) and health/liveness/readiness endpoints (`GET /api/health`, `/api/live`, `/api/ready`) are implemented; Sentry, PostHog, and error alerting are not yet — see `ROADMAP.md` Phase 15.

Track:

- API latency
- Failed requests
- Queue failures
- Authentication failures

---

# 18. Scalability Strategy

MVP:

- Modular monolith

Future:

- Extract services if required:

  - AI Service
  - Notification Service
  - Billing Service
  - Analytics Service

Avoid premature microservices.

---

# 19. Deployment

Primary:

- Vercel
- Supabase
- Cloudflare

CI/CD:

- GitHub Actions
- Automated tests
- Lint
- Type checking
- Preview deployments

---

# 20. Engineering Principles

Every new feature must:

- Follow CLAUDE.md
- Respect tenant isolation
- Include tests
- Update documentation
- Be production-ready
- Avoid breaking existing APIs
- Be reviewed for security and performance

This architecture document is the authoritative technical reference for all future development.
