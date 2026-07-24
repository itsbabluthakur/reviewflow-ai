# SECURITY.md

# ReviewFlow AI Security Standards

**Version:** 1.0

**Classification:** Internal Engineering Document

---

# 1. Security Principles

ReviewFlow AI follows a "Secure by Default" philosophy.

Every feature must satisfy:

* Least Privilege
* Defense in Depth
* Zero Trust
* Principle of Explicit Authorization
* Secure Defaults
* Privacy by Design

Never assume any client request is trustworthy.

---

# 2. Authentication

Supported Providers

* Email + Password
* Magic Link
* Google OAuth

Requirements

* Secure password hashing (handled by Supabase Auth)
* Session expiration
* Secure logout
* Email verification
* Password reset tokens
* Login rate limiting

Future

* MFA / Two-Factor Authentication
* Passkeys (WebAuthn)

---

# 3. Authorization

Every request must verify:

```text
Authentication

↓

Tenant

↓

Role

↓

Permission

↓

Business Rule
```

Never trust frontend permissions.

Authorization is always enforced server-side.

---

# 4. Role-Based Access Control (RBAC)

Roles

* Super Admin
* Agency Owner
* Agency Staff
* Business Owner
* Manager
* Employee

Permissions are assigned by capability, not by UI.

Examples

```text
customer.read

customer.create

customer.update

customer.delete

campaign.manage

billing.manage

team.manage

review.reply
```

---

# 5. Multi-Tenant Isolation

Every business record contains:

* agency_id
* business_id
* location_id (where applicable)

Rules

* No cross-tenant queries
* No shared customer data
* No shared billing data
* No shared analytics

Tenant isolation is enforced using PostgreSQL Row Level Security (RLS).

---

# 6. Row Level Security

Enable RLS on every tenant-owned table.

Policies must ensure:

* Users only read tenant data.
* Users only modify tenant data.
* Service-role operations are restricted to trusted backend environments.

Never disable RLS in production.

---

# 7. Secrets Management

Secrets must never be:

* Committed to Git
* Logged
* Exposed to the browser
* Stored in local storage

Use:

* Environment variables
* Secret managers
* CI/CD secret storage

Rotate secrets regularly.

---

# 8. Input Validation

Every API endpoint must validate:

* Required fields
* Data types
* Length limits
* Allowed values
* File size
* File type

Never trust client-side validation alone.

---

# 9. Output Encoding

Always:

* Escape HTML where needed
* Encode dynamic output
* Sanitize user-generated content before rendering

Prevent:

* Cross-Site Scripting (XSS)
* HTML injection

---

# 10. SQL Injection Prevention

Rules

* Parameterized queries only
* ORM-generated queries where possible
* Never concatenate SQL strings
* Validate filter fields against allow-lists

---

# 11. CSRF Protection

Server actions and authenticated endpoints must be protected against Cross-Site Request Forgery where applicable.

State-changing requests should require verified authentication context and appropriate anti-CSRF mechanisms.

---

# 12. Session Security

Sessions must:

* Expire automatically
* Refresh securely
* Use HTTPS
* Use secure cookies where applicable
* Support remote logout

Never store JWTs in local storage.

---

# 13. Password Policy

Minimum

* 12 characters

Encourage

* Passphrases
* Password managers

Never store passwords directly.

---

# 14. Rate Limiting

Protect:

Authentication

Customer Import

AI

Billing

Public APIs

Suggested Defaults

Login

10/minute/IP

Password Reset

5/hour/account

API

Plan-based

AI

Plan-based quotas

---

# 15. File Upload Security

Allow only approved file types.

Virus scanning should be added before public production for uploaded files where appropriate.

Reject:

* Executables
* Scripts
* Oversized files

Generate unique file names.

Store uploads outside the application runtime.

---

# 16. Audit Logging

Record:

* Login
* Logout
* Password reset
* Customer CRUD
* Billing changes
* Team changes
* Permission changes
* API key changes
* Review replies
* Google account connections

Audit logs are append-only.

---

# 17. Logging

Never log:

* Passwords
* Access tokens
* Refresh tokens
* API secrets
* Payment details

Log:

* Request IDs
* Errors
* User ID
* Tenant ID
* Timestamp

---

# 18. Encryption

Data in Transit

* HTTPS only
* TLS 1.2+

Data at Rest

Use platform-managed encryption for database and object storage.

Sensitive values should be encrypted where business requirements demand it.

---

# 19. API Security

Every endpoint must:

* Authenticate
* Authorize
* Validate input
* Enforce rate limits
* Return structured errors

Do not reveal internal implementation details.

---

# 20. Webhooks

Verify webhook signatures.

Store delivery logs.

Support retries.

Ensure idempotent processing where appropriate.

---

# 21. Third-Party Integrations

Google Business

Stripe

Twilio

Resend

OpenAI

Requirements

* Minimal scopes
* Token refresh
* Secure storage
* Graceful token revocation

---

# 22. AI Security

AI responses:

* Must be editable
* Must not auto-publish
* Should avoid exposing confidential information in prompts
* Should be logged for troubleshooting with appropriate privacy safeguards

Never send secrets to AI providers.

---

# 23. Privacy

Follow applicable privacy laws (for example GDPR, CCPA, or regional equivalents) based on where the product is offered.

Support:

* Data export
* Data deletion
* Consent where required
* Retention policies

Collect only the data necessary to provide the service.

---

# 24. Backups

Database

* Daily automated backups

Retention

* 30 days (configurable)

Test restoration procedures regularly.

---

# 25. Disaster Recovery

Maintain documented recovery procedures.

Define Recovery Time Objective (RTO) and Recovery Point Objective (RPO) targets appropriate for the subscription tier.

Document rollback procedures for deployments.

---

# 26. Dependency Management

* Keep dependencies updated
* Monitor for known vulnerabilities
* Remove unused packages
* Review licenses before adoption

---

# 27. Secure Development Lifecycle

Every feature must include:

* Threat assessment
* Code review
* Security review
* Automated tests
* Documentation update

High-risk features should receive additional manual review.

---

# 28. Security Headers

Configure standard HTTP security headers including:

* Content Security Policy
* X-Content-Type-Options
* Referrer-Policy
* Permissions-Policy
* HSTS (production)

Review headers regularly as browser guidance evolves.

---

# 29. Incident Response

Prepare procedures for:

* Detecting incidents
* Containing impact
* Eradicating threats
* Recovering services
* Post-incident review

Maintain audit evidence where appropriate.

---

# 30. Security Checklist

Before every production release:

* Authentication tested
* Authorization verified
* RLS policies reviewed
* Secrets validated
* Rate limits tested
* Dependency scan completed
* Security headers verified
* Audit logging confirmed
* Backup status checked
* Documentation updated

Security is a release requirement, not an optional enhancement.
