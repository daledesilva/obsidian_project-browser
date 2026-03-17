# Copilot Instructions

These instructions apply to all files in this repository.

---

## Project Overview

> **IMPORTANT:** If any `[PLACEHOLDER]` value below has not been filled in, stop and tell the user:
> _"The project overview in `.github/copilot-instructions.md` still contains unfilled placeholders. Please update it (and the matching `.cursor/rules/project-overview.mdc`) with the real project details before continuing."_

**What this project is:** This project is an **Obsidian plugin** (“Project Browser”) designed to help people navigate vault files and folders using a **non-technical, low-effort browsing interface** (ideal when you’re busy or don’t want to think in paths/structure). It replaces the new tab view with a browsable, searchable file/folder layout (see `manifest.json` for the concise plugin description).

**Folder structure:**

| Folder | Purpose |
|---|---|
| `src/` | Plugin source (Obsidian entrypoint, React UI, logic, styles, assets) |
| `tests/` | Unit/component test scaffolding and E2E specs/helpers |
| `scripts/` | Release, QA, and test automation scripts |
| `qa-test-vault/` | Generated vault used for E2E/manual QA |
| `docs/` | Project documentation |

**Architecture:** The plugin bundles to `dist/` via esbuild and is loaded by Obsidian. The entrypoint (`src/main.ts`) registers the plugin behaviour/UI, including the “new tab replacement” browsing experience. UI is primarily React-based, with state handled via Jotai (UI state) and Redux Toolkit (structured workflow/app state where useful). Styles are built from CSS/SCSS and emitted alongside the plugin bundle.

**Key constraints:**
- Must stay compatible with Obsidian’s plugin API + packaging expectations (`dist/` output, manifest copied into `dist/`)
- No backend/server assumptions (this is a local Obsidian plugin)
- E2E uses WebdriverIO running real Obsidian; don’t start background services as part of automated tasks

---

## Tech Stack

This section is the source of truth for libraries, frameworks, and tools in use. **Update it as the final step of any plan that introduces, removes, or changes a dependency or tool.**

- **Plugin platform:** Obsidian plugin API (`obsidian`)
- **Language:** TypeScript (TS 4.7), modern JS target (esbuild target `es2021`)
- **UI:** React 18 (`react`, `react-dom`)
- **State management:** Jotai (UI state), Redux Toolkit + React-Redux (structured workflow state)
- **UI utilities:** `classnames`, `@tippyjs/react`, `lucide-react`, `react-sortablejs` / `sortablejs`, `uuid`
- **Build:** esbuild (`esbuild`), `esbuild-sass-plugin`, `esbuild-plugin-copy`
- **Linting:** ESLint + `@typescript-eslint/*`
- **Unit/component testing:** Jest (`jest`, `babel-jest`, `jest-environment-jsdom`) + React Testing Library (`@testing-library/react`, `@testing-library/jest-dom`)
- **E2E testing:** WebdriverIO 9 + Mocha + `wdio-obsidian-service` + `wdio-obsidian-reporter`
- **CI:** GitHub Actions (Node 22 in `.github/workflows/test.yaml`)

---

## AI Instruction Consistency

When adding or updating any convention or coding standard, always update **both** locations so they never diverge:

| Rule type | Cursor file | Copilot file |
|---|---|---|
| Repo-wide / always-apply | `.cursor/rules/*.mdc` | `.github/copilot-instructions.md` |
| File-scoped | `.cursor/rules/*.mdc` (with `globs:`) | `.github/instructions/*.instructions.md` (with `applyTo:`) |

Express the same intent in both formats. Adapt the format to each tool's conventions, but never allow them to conflict.

---

## Documentation Standards

Store documentation in a `docs/` folder. Organise into separate pages per concept or feature.

Every documentation page follows this order:
1. **Why it exists** — motivation and problem being solved
2. **Conceptual understanding** — mental model before implementation details
3. **Flows** — how data or control moves through the system
4. **Technical details** — implementation specifics
5. **Technical Gotchas** — a dedicated section for non-obvious pitfalls

Use Mermaid diagrams for flows and architecture. Prefer Mermaid over ASCII art or prose descriptions.

---

## Editing Guidelines

**Respect existing patterns.** Before introducing a new pattern or abstraction, check how similar problems are already solved and follow the same approach.

**Verify every fix.** Never assume a change will successfully fix something. Run the relevant code path or test after applying the fix. Do not mark a task complete until verification passes.

**Keep console logs during a fix.** Do not remove `console.log` statements while actively making a change. Keep them until the fix is confirmed working. Remove logging only after verification.

**Keep documentation accurate.** When changing code described in `docs/`, update the documentation in the same step.

---

## Environment File Conventions

- Env files belong in the relevant package or service subfolder (e.g. `server/.env`, `client/.env`) — never at the repository root
- Always update the real `.env` file, not just `.env.example`
- When adding a new variable, update **both** `.env` and `.env.example` in the same step
- Infer the correct file from context: API/backend work → server env; frontend/mobile work → client env

---

## Git Workflow

Branch format: `<prefix>/<short-description>` in kebab-case.

| Prefix | Use for |
|---|---|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation only changes |
| `refactor/` | Code restructuring without behaviour change |
| `chore/` | Maintenance, deps, tooling |
| `experiment/` | Exploratory or throwaway work |

- Lowercase only
- Hyphens separate words, underscores seperate categories where necessary. Higher level categories first (eg. feat/ui-revamp_colour-updates)
- Delete branches immediately after merging to `main`

---

## Naming Conventions

Every name must be self-explanatory without needing to trace the surrounding context.

- Prefer full descriptive words over abbreviations
- Avoid generic placeholders: `data`, `info`, `value`, `item`, `temp`, `result`, `obj`, `val`
- Name booleans as yes/no answers: `isVisible`, `hasUnsavedChanges`, `canEdit`, `isLoading`
- Include the owning entity in a name when relevant: `userAvatarUrl`, `orderCreatedAt`

Loop indices (`i`, `j`) are acceptable only in trivially small, obvious loops.

---

## Planning Workflow

- The final step of every plan must be creating or updating the relevant documentation
- Use Mermaid format for all diagrams in plans and documentation
- A well-formed plan states the goal, breaks work into discrete steps, calls out risks, and ends with a documentation update

---

## Testing Practices

- Every new feature or meaningful change must include tests
- Run tests to completion and confirm they pass — do not assume they will pass
- Mock only dependencies that are genuinely impossible to control in a test environment (third-party APIs, hardware, external services)
- **Never start the server, app, or any background service** — starting services is the user's responsibility

---
