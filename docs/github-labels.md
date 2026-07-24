# GitHub Labels

## Purpose

The label taxonomy used for issues and pull requests in this repository, so triage stays consistent as the number of contributors grows. Apply labels when opening or triaging an issue/PR; every issue should get at least one `type` label.

## Type

| Label           | Color     | Description                                                                                                     |
| --------------- | --------- | --------------------------------------------------------------------------------------------------------------- |
| `bug`           | `#d73a4a` | Something isn't working as expected.                                                                            |
| `enhancement`   | `#a2eeef` | New feature or improvement request.                                                                             |
| `documentation` | `#0075ca` | Improvements or additions to documentation.                                                                     |
| `security`      | `#b60205` | Security-related issue. See `SECURITY.md` for the responsible-disclosure process before opening a public issue. |

## Priority

| Label             | Color     | Description                                  |
| ----------------- | --------- | -------------------------------------------- |
| `priority:high`   | `#e11d21` | Should be addressed before other open work.  |
| `priority:medium` | `#fbca04` | Normal priority; schedule in the usual flow. |
| `priority:low`    | `#c2e0c6` | Nice to have; no urgency.                    |

Every issue should carry at most one `priority:*` label. If priority is unclear, leave it unlabeled rather than guessing — a maintainer will triage it.

## Community

| Label              | Color     | Description                                                         |
| ------------------ | --------- | ------------------------------------------------------------------- |
| `good first issue` | `#7057ff` | Well-scoped and suitable for a first-time contributor.              |
| `help wanted`      | `#008672` | Maintainers are actively looking for a contributor to pick this up. |

## Usage Notes

- Labels are additive across categories — an issue can be `bug` + `priority:high` + `help wanted` at the same time, but should only ever have one `type` label and one `priority` label.
- `security` issues that involve an actual vulnerability (not a hardening suggestion) should follow the private reporting process in [`SECURITY.md`](../SECURITY.md) instead of being labeled on a public issue.
- New labels should be added to this document in the same pull request that introduces them, so this file stays the source of truth for the taxonomy.

## Applying These Labels

GitHub does not version-control repository labels, so they must be created once via the UI or CLI. Using the [GitHub CLI](https://cli.github.com/):

```bash
gh label create "bug"             --color d73a4a --description "Something isn't working as expected."
gh label create "enhancement"     --color a2eeef --description "New feature or improvement request."
gh label create "documentation"   --color 0075ca --description "Improvements or additions to documentation."
gh label create "security"        --color b60205 --description "Security-related issue."
gh label create "good first issue" --color 7057ff --description "Well-scoped and suitable for a first-time contributor."
gh label create "help wanted"     --color 008672 --description "Maintainers are actively looking for a contributor."
gh label create "priority:high"   --color e11d21 --description "Should be addressed before other open work."
gh label create "priority:medium" --color fbca04 --description "Normal priority; schedule in the usual flow."
gh label create "priority:low"    --color c2e0c6 --description "Nice to have; no urgency."
```

Add `--force` to any command above to overwrite an existing label's color/description instead of failing when the label already exists.
