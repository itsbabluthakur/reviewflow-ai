# API.md

# ReviewFlow AI API Specification

**Version:** 1.0

**Style:** REST API

**Base URL**

```
/api/v1
```

Future versions:

```
/api/v2
```

Older versions remain supported according to the API deprecation policy.

---

# 1. API Design Principles

Every endpoint must be:

* RESTful
* Versioned
* Authenticated (unless public)
* Authorized
* Rate limited
* Fully validated
* Logged
* Documented
* Tested

Use JSON for all request and response bodies.

---

# 2. Authentication

Supported methods:

* Email & Password
* Magic Link
* Google OAuth

Protected requests use:

```
Authorization: Bearer <JWT>
```

Every protected endpoint must:

1. Verify JWT
2. Load tenant context
3. Verify permissions
4. Execute request

---

# 3. Standard Response Format

## Success

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

## Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Customer email is required."
  }
}
```

---

# 4. Pagination

Query Parameters

```
?page=1
&pageSize=25
```

Response

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "totalItems": 142,
    "totalPages": 6
  }
}
```

---

# 5. Filtering

Example

```
GET /customers

?status=active

&tag=vip

&locationId=abc123
```

---

# 6. Sorting

```
?sort=createdAt

&order=desc
```

---

# 7. Search

```
?q=john
```

Search should support:

* Name
* Email
* Phone

---

# 8. Authentication Endpoints

```
POST /auth/login

POST /auth/logout

POST /auth/register

POST /auth/forgot-password

POST /auth/reset-password

GET /auth/me
```

---

# 9. Agency Endpoints

```
GET /agencies

POST /agencies

GET /agencies/{id}

PATCH /agencies/{id}

DELETE /agencies/{id}
```

---

# 10. Business Endpoints

```
GET /businesses

POST /businesses

GET /businesses/{id}

PATCH /businesses/{id}

DELETE /businesses/{id}
```

---

# 11. Location Endpoints

```
GET /locations

POST /locations

GET /locations/{id}

PATCH /locations/{id}

DELETE /locations/{id}
```

---

# 12. Customer Endpoints

```
GET /customers

POST /customers

GET /customers/{id}

PATCH /customers/{id}

DELETE /customers/{id}
```

Additional

```
POST /customers/import

GET /customers/export
```

Bulk operations

```
POST /customers/bulk-update

POST /customers/bulk-delete
```

---

# 13. Review Requests

```
GET /review-requests

POST /review-requests

GET /review-requests/{id}
```

Bulk

```
POST /review-requests/bulk-send
```

Retry

```
POST /review-requests/{id}/retry
```

---

# 14. Reviews

```
GET /reviews

GET /reviews/{id}
```

Reply

```
POST /reviews/{id}/reply
```

AI Draft

```
POST /reviews/{id}/ai-reply
```

---

# 15. Campaigns

```
GET /campaigns

POST /campaigns

PATCH /campaigns/{id}

DELETE /campaigns/{id}
```

Workflow

```
POST /campaigns/{id}/publish

POST /campaigns/{id}/pause

POST /campaigns/{id}/duplicate
```

---

# 16. Google Business Profile

```
GET /google/connect

POST /google/callback

GET /google/locations

POST /google/sync

POST /google/disconnect
```

---

# 17. QR Codes

```
GET /qr-codes

POST /qr-codes

PATCH /qr-codes/{id}

DELETE /qr-codes/{id}
```

Statistics

```
GET /qr-codes/{id}/analytics
```

---

# 18. AI

Generate Reply

```
POST /ai/reply
```

Sentiment

```
POST /ai/sentiment
```

Weekly Summary

```
POST /ai/weekly-summary
```

Monthly Report

```
POST /ai/monthly-report
```

---

# 19. Analytics

```
GET /analytics/dashboard

GET /analytics/reviews

GET /analytics/campaigns

GET /analytics/customers
```

---

# 20. Billing

```
GET /billing/plans

POST /billing/checkout

GET /billing/subscription

PATCH /billing/subscription

POST /billing/cancel
```

Invoices

```
GET /billing/invoices
```

---

# 21. Notifications

```
GET /notifications

PATCH /notifications/{id}

POST /notifications/read-all
```

---

# 22. Team

```
GET /team

POST /team

PATCH /team/{id}

DELETE /team/{id}
```

---

# 23. API Keys

```
GET /api-keys

POST /api-keys

DELETE /api-keys/{id}
```

---

# 24. Webhooks

```
GET /webhooks

POST /webhooks

PATCH /webhooks/{id}

DELETE /webhooks/{id}
```

Test Delivery

```
POST /webhooks/{id}/test
```

---

# 25. Health

```
GET /health
```

Returns:

* API version
* Database status
* Queue status
* Service status

---

# 26. HTTP Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | OK                    |
| 201  | Created               |
| 204  | No Content            |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 422  | Validation Error      |
| 429  | Rate Limited          |
| 500  | Internal Server Error |

---

# 27. Rate Limiting

Default

* Auth endpoints: 10 requests/minute/IP
* Public endpoints: 60 requests/minute/IP
* Authenticated API: plan-based limits
* AI endpoints: token and request quotas by subscription plan

---

# 28. Idempotency

The following endpoints should support idempotency keys:

* Payment creation
* Bulk review request creation
* Customer import
* Webhook retries

Header:

```
Idempotency-Key: <UUID>
```

---

# 29. Audit Logging

Log:

* Authentication events
* Customer CRUD
* Campaign changes
* Billing actions
* Team changes
* Review replies
* API key management

---

# 30. API Design Rules

Every endpoint must:

* Validate input
* Enforce tenant isolation
* Check permissions
* Return consistent JSON
* Include typed error responses
* Support structured logging
* Include automated tests
* Be documented in OpenAPI

This document is the official API contract for all frontend, backend, mobile, and third-party integrations.
