# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

This is a learning/practice workspace (owner is a product manager taking a course), not a
single product codebase. There is no shared build tooling, package manifest, or test suite
at the repo root — each subfolder under `projects/`, `skills/`, or `products/` is its own
independent piece of work and may have its own tooling once it has code in it.

## Structure

- `projects/` — full end-to-end things being built (an app, a prototype, a tool). One subfolder per project.
- `skills/` — small, focused exercises practicing one specific skill. One subfolder per exercise.
- `products/` — product concepts taken further than a course exercise, each with its own PRD. One subfolder per product.

Each subfolder has its own `README.md` (or `PRD.md` for products) describing what it is.
When a subfolder gains real code, its build/lint/test commands and architecture belong in
that subfolder's own README, not here — update this file only if repo-wide tooling
(e.g. a root package.json shared across projects) gets introduced.
