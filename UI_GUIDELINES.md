# UI_GUIDELINES.md

# ReviewFlow AI Design System

**Version:** 1.0

---

# 1. Design Philosophy

ReviewFlow AI should feel like a premium SaaS product.

Inspired by:

* Linear
* Vercel
* Stripe Dashboard
* Notion
* Raycast

Goals:

* Fast
* Minimal
* Professional
* Accessible
* Consistent
* Mobile-first

Avoid excessive gradients, clutter, or unnecessary animations.

---

# 2. Design Principles

Every screen should prioritize:

* Clarity over decoration
* Consistency over creativity
* Speed over complexity
* Accessibility by default

---

# 3. Color System

## Primary

Brand Primary

* Indigo 600

Primary Hover

* Indigo 700

Primary Light

* Indigo 100

---

## Neutral

Background

* Slate 50 (Light)
* Slate 950 (Dark)

Cards

* White (Light)
* Slate 900 (Dark)

Borders

* Slate 200
* Slate 800

Text

Primary

* Slate 900
* Slate 100

Secondary

* Slate 600
* Slate 400

Muted

* Slate 500

---

## Semantic Colors

Success

* Emerald

Warning

* Amber

Danger

* Red

Info

* Sky

Never use more than one primary accent color.

---

# 4. Typography

Font

Inter

Fallback

System UI

---

Headings

H1

36px

H2

30px

H3

24px

H4

20px

Body

16px

Small

14px

Caption

12px

Use a maximum of two font weights per section.

---

# 5. Spacing

Use an 8px spacing system.

Allowed spacing:

4

8

12

16

24

32

40

48

64

96

Avoid arbitrary spacing values.

---

# 6. Border Radius

Small

8px

Medium

12px

Large

16px

Cards

16px

Buttons

12px

Inputs

12px

---

# 7. Shadows

Use subtle shadows only.

Cards

Small shadow

Modals

Medium shadow

Dropdowns

Medium shadow

Avoid heavy shadows.

---

# 8. Layout

Desktop

Maximum content width

1440px

Dashboard

Sidebar

Header

Content

Mobile

Bottom navigation only if required.

All pages must remain fully usable on screens down to 320px wide.

---

# 9. Navigation

Sidebar Sections

* Dashboard
* Customers
* Reviews
* Campaigns
* Analytics
* Billing
* Team
* Settings

Features:

* Collapsible
* Keyboard accessible
* Searchable command palette
* Active route highlighting

---

# 10. Buttons

Variants

Primary

Secondary

Outline

Ghost

Danger

Sizes

Small

Medium

Large

Loading

Disabled

Icon Button

Buttons should always show a loading state during async actions.

---

# 11. Forms

Every form must support:

* Labels
* Helper text
* Validation
* Error messages
* Loading state
* Success state

Use inline validation where appropriate.

---

# 12. Tables

Required features:

* Sorting
* Filtering
* Search
* Pagination
* Bulk actions
* Column visibility
* Empty state
* Skeleton loading

Sticky headers on long tables.

---

# 13. Cards

Cards should include:

* Title
* Description (optional)
* Actions
* Content
* Footer (optional)

Use consistent padding across all cards.

---

# 14. Modals

Support:

* Keyboard escape
* Focus trap
* Confirmation dialogs
* Loading state
* Error state

Avoid nested modals.

---

# 15. Notifications

Toast Types

* Success
* Error
* Warning
* Information

Placement

Top-right on desktop.

Top-center on mobile.

---

# 16. Icons

Use a single icon library throughout the project.

Rules:

* Consistent sizing
* Meaningful usage
* Decorative icons marked appropriately for accessibility

Avoid mixing icon sets.

---

# 17. Charts

Use consistent chart styling.

Support:

* Line
* Bar
* Area
* Pie

Charts must:

* Be responsive
* Support dark mode
* Include tooltips
* Be color-blind friendly

---

# 18. Empty States

Every empty state should include:

* Illustration or icon
* Clear message
* Primary action

Example:

"No customers yet."

Button:

"Add Customer"

---

# 19. Loading States

Use skeleton loaders for:

* Tables
* Cards
* Dashboards

Use spinners only for short actions.

---

# 20. Error States

Every error screen should include:

* Human-readable explanation
* Retry button
* Contact support option (where appropriate)

Do not expose technical details to users.

---

# 21. Dark Mode

Requirements:

* Full feature parity
* Accessible contrast
* No hardcoded colors
* Theme persistence across sessions

---

# 22. Accessibility

Meet WCAG AA where practical.

Support:

* Keyboard navigation
* Focus indicators
* Screen readers
* Sufficient color contrast
* ARIA labels where needed

Never rely on color alone to convey meaning.

---

# 23. Motion

Animations should be:

* Fast (150–250ms)
* Subtle
* Functional

Use animation to improve usability, not decoration.

Respect reduced-motion user preferences.

---

# 24. Responsive Breakpoints

Mobile

0–639px

Tablet

640–1023px

Laptop

1024–1279px

Desktop

1280px+

Large Desktop

1536px+

Every page must work across all breakpoints.

---

# 25. Component Standards

All reusable components should support:

* Light mode
* Dark mode
* Loading
* Disabled
* Error
* Accessibility
* Responsive layouts

Shared components belong in the shared UI package.

---

# 26. Quality Checklist

Before approving any screen:

* Visual hierarchy is clear
* Responsive layout verified
* Keyboard navigation works
* Accessibility reviewed
* No layout shifts
* Dark mode tested
* Empty states implemented
* Loading states implemented
* Error states implemented

This document is the authoritative design system for ReviewFlow AI and must be followed for every screen and component.
