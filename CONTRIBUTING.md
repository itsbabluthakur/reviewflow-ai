# CONTRIBUTING.md

# Contributing to ReviewFlow AI

Thank you for contributing to ReviewFlow AI.

This document defines the engineering workflow, coding standards, and review process to ensure the project remains maintainable, secure, and production-ready.

---

# Core Principles

Every contribution should be:

* Small and focused
* Well documented
* Fully tested
* Backward compatible whenever possible
* Consistent with the project architecture

If a change requires a deviation from the documented architecture, update the relevant documentation as part of the same pull request.

---

# Before You Start

1. Read `README.md`
2. Read `CLAUDE.md`
3. Review the relevant documentation (`ARCHITECTURE.md`, `DATABASE.md`, `API.md`, etc.)
4. Check for existing issues or feature requests
5. Create a new feature branch

---

# Development Environment

Requirements:

* Node.js 22+
* pnpm
* Docker
* Supabase CLI

Install dependencies:

```bash
pnpm install
```

Run locally:

```bash
pnpm dev
```

---

# Branch Naming

Use descriptive branch names.

Examples:

```text
feature/customer-import
feature/google-review-sync
feature/ai-review-replies

fix/login-timeout
fix/csv-parser

docs/api-updates

refactor/auth-service

chore/dependency-updates
```

Never commit directly to `main`.

---

# Commit Messages

Use Conventional Commits.

Examples:

```text
feat: add customer CSV import

fix: prevent duplicate review requests

docs: update API specification

refactor: simplify campaign execution service

test: add customer service integration tests

chore: upgrade dependencies
```

---

# Pull Request Guidelines

Each pull request should:

* Solve one logical problem
* Be easy to review
* Include tests where appropriate
* Update documentation when behavior changes

Include:

* Summary
* Motivation
* Screenshots (if UI changes)
* Testing notes
* Migration notes (if applicable)

---

# Coding Standards

General rules:

* Prefer readability over cleverness
* Keep functions focused
* Avoid duplicated logic
* Use descriptive names
* Remove unused code before merging

Do not:

* Hardcode secrets
* Disable security checks
* Introduce unnecessary dependencies
* Leave debugging code in production

---

# TypeScript Standards

* Enable strict mode
* Avoid `any`
* Prefer explicit types for public APIs
* Reuse shared types
* Validate external input

---

# React Standards

* Functional components only
* Prefer server components where appropriate
* Keep components small
* Extract reusable UI into the shared package
* Avoid deeply nested component trees

---

# API Standards

Every endpoint must:

* Validate input
* Authorize requests
* Return consistent JSON
* Handle errors gracefully
* Be documented in `API.md`

---

# Database Standards

Schema changes must:

* Use new migrations
* Preserve existing data
* Be reviewed before merging
* Include rollback considerations where practical

Never modify an existing migration after it has been applied in shared environments.

---

# Testing Requirements

Every feature should include the appropriate level of testing:

* Unit tests
* Integration tests
* End-to-end tests (where applicable)

Before opening a pull request, ensure:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

complete successfully.

---

# Documentation

Update documentation when:

* APIs change
* Database schema changes
* User workflows change
* Security requirements change
* New environment variables are introduced

Documentation is part of the feature—not an afterthought.

---

# Accessibility

UI contributions should:

* Support keyboard navigation
* Provide visible focus states
* Include accessible labels
* Maintain sufficient color contrast
* Work in both light and dark mode

---

# Security Checklist

Before submitting:

* No secrets committed
* Inputs validated
* Authorization enforced
* Tenant isolation maintained
* Sensitive data not logged

Refer to `SECURITY.md` for detailed guidance.

---

# Code Review Checklist

Reviewers should verify:

* Architecture consistency
* Code readability
* Test coverage
* Performance impact
* Security implications
* Documentation updates

Pull requests may be returned for revision if these requirements are not met.

---

# Issue Reporting

When reporting a bug, include:

* Environment
* Steps to reproduce
* Expected behavior
* Actual behavior
* Screenshots or logs (if applicable)

Do not include passwords, API keys, or other sensitive information.

---

# Feature Requests

Feature requests should include:

* Problem statement
* Proposed solution
* Expected user benefit
* Possible alternatives

---

# Definition of Done

A task is complete only when:

* Code is implemented
* Tests pass
* Documentation is updated
* Security requirements are met
* Code review is approved
* CI pipeline succeeds

Only then is the feature ready to merge.

---

Thank you for helping keep ReviewFlow AI reliable, secure, and maintainable.
