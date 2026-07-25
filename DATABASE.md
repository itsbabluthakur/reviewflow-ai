# DATABASE.md

# ReviewFlow AI - Database Design

**Version:** 1.0

**Database:** PostgreSQL (Supabase)

**ORM:** Drizzle ORM

---

# 1. Database Design Principles

- UUID primary keys for all business entities.
- Every business record belongs to a tenant.
- UTC timestamps.
- Foreign keys enforced.
- Soft deletes only where required.
- Audit important actions.
- Index frequently queried columns.
- Row Level Security (RLS) enabled on tenant-owned tables.

---

# 2. Tenant Hierarchy

```text
Platform
└── Agency
    └── Business
        └── Location
            └── Customer
```

Every request must execute within a tenant context.

---

# 2a. Implementation Status

The ORM/connection layer described by this document is implemented in [`packages/database`](packages/README.md) (see [ADR-0002](docs/architecture/0002-database-and-migrations.md) for the driver/migration-ownership decisions): a Drizzle client (`getDb`), a migration runner and idempotent seed runner (`pnpm db:generate` / `db:migrate` / `db:seed`), a repository factory (`createRepositories(db)`, lazily building `{ users, agencies, memberships }` over one shared `db`/transaction handle), and generic repository infrastructure (`BaseRepository`, `withTransaction`, pagination helpers) that a domain repository extends rather than reimplements.

The infrastructure-only `_infra_probe` proof-point table (Sprint 2) has been removed now that real tables exist to serve that purpose (see [ADR-0004](docs/architecture/0004-first-domain-schema.md)).

Three tables are implemented today — `users`, `agencies`, and `memberships` — with `UserRepository`, `AgencyRepository`, and `MembershipRepository` (each extending `BaseRepository`) providing infrastructure-only query methods (`findByEmail`, `findByAuthUserId`, `linkAuthUserId`, `findBySlug`, `findMembers`, `findUserAgencies`, `findByAgencyAndUser`). Their actual columns are intentionally a minimal first slice, not yet the full column sets shown in section 3 below:

- `users`: `id`, `email` (unique), `full_name`, `avatar_url` (nullable), `auth_user_id` (nullable, unique, indexed — links to Supabase Auth's identity; see [ADR-0005](docs/architecture/0005-authentication-architecture.md)), `created_at`, `updated_at`. No `phone`, `status`, or `last_login_at` yet.
- `agencies`: `id`, `name`, `slug` (unique), `logo_url` (nullable), `timezone`, `created_at`, `updated_at`. No `website`, `currency`, or `status` yet.
- `memberships`: `id`, `agency_id` (FK → `agencies`), `user_id` (FK → `users`), `role` (enum: `owner` | `admin` | `member`), `created_at`. Unique on (`agency_id`, `user_id`) — one membership per user per agency. This is a minimal role label, not the full RBAC/permission-catalog model in sections 3 and 4 below (`roles`, `permissions`, `user_roles`) — see ARCHITECTURE.md section 7 for the target model. `packages/auth`'s `requireMembership` confirms a membership row exists; it does not yet check `role`.

Every other table below (`businesses`, `locations`, `roles`, `permissions`, `customers`, `reviews`, …) does not exist yet.

---

# 3. Core Tables

## Identity & Access

### users

Stores authenticated users.

Columns

- id (UUID)
- auth_user_id
- first_name
- last_name
- email
- phone
- avatar_url
- status
- last_login_at
- created_at
- updated_at

Indexes

- email
- auth_user_id

---

### agencies

Agency accounts.

Columns

- id
- name
- slug
- logo_url
- website
- timezone
- currency
- status
- created_at
- updated_at

---

### businesses

Business profiles.

Columns

- id
- agency_id
- name
- legal_name
- business_type
- website
- phone
- email
- timezone
- status
- created_at
- updated_at

---

### locations

Business locations.

Columns

- id
- business_id
- name
- address
- city
- state
- postal_code
- country
- latitude
- longitude
- google_location_id
- created_at
- updated_at

---

### roles

System roles.

Examples

- Super Admin
- Agency Owner
- Agency Staff
- Business Owner
- Manager
- Employee

---

### permissions

Permission catalog.

Examples

- customer.read
- customer.write
- review.reply
- billing.manage
- campaign.manage

---

### user_roles

Maps users to roles within a tenant.

---

# 4. Customer Management

### customers

Columns

- id
- location_id
- first_name
- last_name
- email
- phone
- preferred_channel
- tags
- notes
- status
- created_at
- updated_at

---

### customer_tags

Reusable tag definitions.

---

### customer_notes

Internal notes.

---

### customer_activity

Timeline of customer events.

Examples

- Created
- Imported
- Review Requested
- Review Submitted

---

# 5. Review System

### review_requests

Tracks every review request.

Columns

- id
- customer_id
- campaign_id
- channel
- status
- review_url
- sent_at
- opened_at
- clicked_at
- completed_at

---

### reviews

Imported Google reviews.

Columns

- id
- location_id
- external_review_id
- rating
- reviewer_name
- review_text
- review_date
- language
- sentiment
- synced_at

---

### review_replies

Stores replies.

Columns

- id
- review_id
- reply_text
- source (manual or AI)
- published_at

---

# 6. Campaign Automation

### campaigns

Campaign metadata.

---

### campaign_steps

Workflow definition.

Supported step types

- Trigger
- Delay
- Condition
- Email
- SMS
- WhatsApp
- End

---

### campaign_runs

Execution history.

---

### campaign_events

Detailed event log.

---

# 7. Messaging

### email_messages

### sms_messages

### whatsapp_messages

Shared fields

- recipient
- template
- provider
- status
- sent_at
- delivered_at
- failed_reason

---

### templates

Reusable templates.

Fields

- type
- subject
- body
- variables
- version

---

# 8. Google Business

### google_accounts

OAuth tokens.

---

### google_locations

Connected locations.

---

### google_sync_jobs

Synchronization history.

Track

- started_at
- finished_at
- records_synced
- errors

---

# 9. QR Codes

### qr_codes

Columns

- id
- location_id
- name
- destination_url
- design
- created_at

---

### qr_scans

Tracks every scan.

Fields

- scanned_at
- device
- browser
- country
- referrer

---

# 10. AI

### ai_requests

Stores prompts.

---

### ai_responses

Stores outputs.

---

### ai_usage

Tracks usage by tenant.

Metrics

- tokens
- model
- latency
- estimated_cost

---

# 11. Analytics

### dashboard_metrics

Pre-computed dashboard data.

---

### daily_statistics

Daily KPI snapshots.

---

### monthly_reports

Generated reports.

---

# 12. Billing

### plans

Subscription plans.

---

### subscriptions

Tenant subscriptions.

---

### invoices

Billing history.

---

### payments

Payment records.

---

### coupons

Discount codes.

---

# 13. Notifications

### notifications

In-app notifications.

---

### notification_preferences

User preferences.

---

# 14. Audit

### audit_logs

Track

- login
- updates
- deletes
- exports
- billing actions

---

### api_keys

API credentials.

---

### webhooks

Outgoing webhook configuration.

---

### webhook_deliveries

Delivery attempts.

---

# 15. Background Jobs

### jobs

Queue metadata.

---

### job_runs

Execution history.

---

# 16. Relationships

```text
Agency
 └── Businesses
      └── Locations
           ├── Customers
           ├── Reviews
           ├── QR Codes
           └── Campaigns

Customers
 ├── Review Requests
 ├── Notes
 └── Activity

Reviews
 └── Review Replies

Campaigns
 ├── Steps
 ├── Runs
 └── Events
```

---

# 17. Index Strategy

Index:

- email
- phone
- status
- created_at
- business_id
- location_id
- campaign_id
- customer_id
- review_date

Composite indexes should be added for common filtering combinations after measuring query performance.

---

# 18. Row Level Security

Enable RLS on all tenant-owned tables.

Policy goals:

- Users only access data within their tenant.
- Business owners cannot access another business.
- Agency users only access assigned businesses.
- Super Admin bypasses tenant restrictions through controlled server-side access.

---

# 19. Migration Strategy

Rules:

- Never edit an existing migration.
- Every schema change gets a new migration.
- Backward-compatible changes first.
- Test migrations on staging before production.
- Seed scripts must be idempotent.

---

# 20. Future Expansion

Schema is designed to support:

- Multiple review platforms
- Additional messaging providers
- CRM features
- Appointment booking
- AI agents
- Mobile applications
- Public API
- Marketplace integrations
- Advanced reporting

The schema should evolve through additive migrations whenever possible to minimize production risk.
