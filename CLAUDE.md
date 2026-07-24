# CLAUDE.md

# ReviewFlow AI Engineering Handbook

**Version:** 1.0

---

# Project Mission

Build a production-ready, enterprise-grade, multi-tenant SaaS that helps agencies and local businesses collect genuine customer reviews, manage their online reputation, automate customer communication, and generate AI-powered business insights.

The codebase must be clean, scalable, secure, maintainable, and suitable for long-term commercial use.

---

# Core Principles

## Code Quality

Always write:

* Production-ready code
* Strongly typed TypeScript
* Modular architecture
* Reusable components
* Self-documenting code

Never write:

* Placeholder implementations
* Demo code
* Mock APIs (unless explicitly requested)
* Hardcoded secrets
* Duplicate logic
* Large monolithic components

---

# Tech Stack

Frontend

* Next.js 15
* React 19
* TypeScript
* TailwindCSS
* shadcn/ui

Backend

* Supabase
* PostgreSQL
* Drizzle ORM

Authentication

* Supabase Auth

Payments

* Stripe

Messaging

* Resend
* Twilio
* WhatsApp Cloud API

AI

* OpenAI

Deployment

* Vercel
* Cloudflare

Monitoring

* Sentry
* PostHog

---

# Architecture Rules

Always follow this layering:

Presentation Layer

↓

Application Layer

↓

Business Services

↓

Repositories

↓

Database

Business logic must never exist inside UI components.

Database queries must never be called directly from React components.

---

# Folder Structure

Every feature should follow:

features/

feature-name/

components/

hooks/

services/

repositories/

schemas/

types/

utils/

tests/

index.ts

Never place unrelated files together.

---

# Naming Conventions

Components

PascalCase

Example

CustomerTable.tsx

Hooks

camelCase

Example

useCustomers.ts

Types

PascalCase

Interfaces begin with I only when required by existing project standards.

Constants

UPPER_SNAKE_CASE

Database

snake_case

API

kebab-case

---

# Component Rules

Each component should:

* Have a single responsibility
* Accept typed props
* Avoid unnecessary state
* Be reusable
* Be responsive
* Be accessible

Maximum recommended component size:

200–250 lines

Split larger components.

---

# State Management

Prefer:

Server Components

↓

React Query (if introduced)

↓

Local State

Avoid global state unless necessary.

---

# API Standards

Every endpoint must include:

* Validation
* Authentication
* Authorization
* Error handling
* Logging
* Pagination (where appropriate)

Use consistent JSON responses.

---

# Database Standards

Every table must include:

* id
* created_at
* updated_at

Use soft deletes only where business requirements justify them.

Use indexes on searchable columns.

Use foreign keys.

Normalize data unless there is a measured performance reason to denormalize.

---

# Security

Mandatory

* Row Level Security
* RBAC
* Input validation
* Output sanitization
* Rate limiting
* Secure cookies
* Environment variable validation
* Audit logging

Never expose service keys to the client.

Never trust client input.

---

# Authentication

Support:

* Email
* Magic Link
* Google Login

Every protected route must verify:

Authentication

↓

Tenant

↓

Permissions

---

# Multi-Tenant Rules

Every business record belongs to a tenant.

Never allow cross-tenant access.

All queries must enforce tenant isolation.

---

# Error Handling

Never ignore errors.

Log unexpected failures.

Return user-friendly error messages.

Never expose stack traces in production.

---

# UI Principles

Design goals:

* Minimal
* Professional
* Fast
* Accessible
* Consistent

Use:

* 8px spacing system
* Responsive layouts
* Keyboard navigation
* Dark mode
* Light mode

Avoid unnecessary animations.

---

# Accessibility

Every feature must support:

* Keyboard navigation
* Proper labels
* Color contrast
* Focus indicators
* Screen readers

---

# Forms

Every form requires:

* Client validation
* Server validation
* Loading state
* Success state
* Error state

---

# Tables

Support:

* Sorting
* Filtering
* Pagination
* Search
* Empty states
* Loading states

---

# AI Features

AI-generated content must always be:

* Editable
* Reviewable
* Logged when appropriate

Never automatically publish AI-generated replies without explicit user approval.

---

# Testing

Every feature requires:

* Unit tests
* Integration tests where applicable
* End-to-end tests for critical workflows

No feature is complete without tests.

---

# Documentation

Every feature must include:

* Purpose
* Setup instructions
* Environment variables
* Usage examples
* API changes (if any)

Update documentation whenever behavior changes.

---

# Git Workflow

Feature branches:

feature/<name>

Bug fixes:

fix/<name>

Commit format:

feat:

fix:

refactor:

docs:

test:

chore:

Use small, focused commits.

---

# Pull Request Checklist

Before completing a feature:

* Tests pass
* Lint passes
* Types pass
* No duplicated code
* Documentation updated
* Security reviewed
* Responsive layout verified
* Accessibility checked

---

# Performance

Optimize for:

* Fast page loads
* Code splitting
* Image optimization
* Lazy loading where appropriate
* Efficient database queries

Measure before optimizing.

---

# Development Workflow

For every development task:

1. Read this CLAUDE.md.
2. Read the relevant project documentation.
3. Understand the feature before coding.
4. Implement production-ready code.
5. Write tests.
6. Update documentation.
7. Run lint and type checks.
8. Commit with a conventional commit message.

---

# Definition of Done

A task is complete only when:

* Code is production-ready
* Tests pass
* Documentation is updated
* Security requirements are met
* Accessibility requirements are met
* Responsive behavior is verified
* Code review checklist is satisfied

Do not consider a feature finished if any of these items are incomplete.
