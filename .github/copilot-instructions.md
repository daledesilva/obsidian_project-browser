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
| `dist/` | Build output (generated; used by Obsidian + E2E runner) |
| `docs/` | Project documentation (features, settings, testing, known issues) |

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
- **Linting:** ESLint 10 + `eslint-plugin-obsidianmd` (Obsidian plugin guidelines) + `@typescript-eslint/*`
- **Unit/component testing:** Jest (`jest`, `babel-jest`, `jest-environment-jsdom`) + React Testing Library (`@testing-library/react`, `@testing-library/jest-dom`)
- **E2E testing:** WebdriverIO 9 + Mocha + `wdio-obsidian-service` + `wdio-obsidian-reporter`
- **CI:** GitHub Actions (Node 22 in `.github/workflows/test.yaml`)

---

## AI Instruction Consistency

When adding or updating any convention or coding standard, always update **both** locations so they never diverge.

If the `./_reference_ide-setup/` folder is present, the rule changes must also be reflected there (it is a reference mirror of IDE setup + instructions).

| Rule type | Cursor file | Copilot file |
|---|---|---|
| Repo-wide / always-apply | `.cursor/rules/*.mdc` | `.github/copilot-instructions.md` |
| File-scoped | `.cursor/rules/*.mdc` (with `globs:`) | `.github/instructions/*.instructions.md` (with `applyTo:`) |

Express the same intent in both formats. Adapt the format to each tool's conventions, but never allow them to conflict.

---

## Documentation Standards

Store documentation in a `docs/` folder. Organise into separate pages per concept or feature.

**Docs are not a source of truth for how code works.** Documentation MUST not be used as an authoritative reference for how the project currently works or how specific code paths behave. For behavior/implementation details, use the codebase and any relevant external/official API/service documentation the code relies on instead—unless the task explicitly instructs you to use `docs/`.

Every documentation page follows this order:
1. **Why it exists** — motivation and problem being solved
2. **Conceptual understanding** — mental model before implementation details
3. **Flows** — how data or control moves through the system
4. **Technical details** — implementation specifics
5. **Technical Gotchas** — a dedicated section for non-obvious pitfalls

Use Mermaid diagrams for flows and architecture. Prefer Mermaid over ASCII art or prose descriptions.

After successful implementation, suggest that the user request relevant documentation be written or updated. Do **not** write or update documentation unless the user explicitly asks you to.

---

## Editing Guidelines

**Respect existing patterns.** Before introducing a new pattern or abstraction, check how similar problems are already solved and follow the same approach.

**Verify every fix.** Never assume a change will successfully fix something. Run the relevant code path or test after applying the fix. Do not mark a task complete until verification passes.

**Keep console logs during a fix.** Do not remove `console.log` statements while actively making a change.

**Debug mode rule:** Never remove logging added for debugging until a final test has been run that shows through the logs that the problem has been fixed. Do not assume a fix has worked without this confirmation.

**Keep documentation accurate.** If the user asks you to write/update documentation (or you are already editing docs for the task), keep documentation accurate and consistent with the implementation. After successful implementation, suggest that the user request documentation be written/updated, but do **not** write or update documentation unless the user explicitly asks you to.

---

## Environment File Conventions

- Env files belong in the relevant package or service subfolder (e.g. `server/.env`, `client/.env`). Never place env files at the repository root unless there is no service subfolder
- Always update the real `.env` file as well as `.env.example` and variations
- When adding a new variable, update **both** `.env` and `.env.example` in the same step (`.env.example` should reflect every variable that `.env` contains, with placeholder or documented values)
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
- **Export boundary:** anything **`export`ed** for other files **should** use a **file-scoped prefix**; **not exported** module-private helpers in a single-primary-component **`.tsx`** file should **not** repeat the component/file name — use role names (e.g. `outerSx` not `userBubbleOuterSx`). See **`.cursor/rules/naming-conventions.mdc`**.

Loop indices (`i`, `j`) are acceptable only in trivially small, obvious loops.

---

## Planning Workflow

- After successful implementation, suggest that the user request relevant documentation be written or updated (do **not** write/update docs unless explicitly asked)
- Use Mermaid format for all diagrams in plans and documentation
- A well-formed plan states the goal, breaks work into discrete steps, calls out risks, and ends with suggesting the user request documentation

---

## Testing Practices

- After implementing a new feature or meaningful change, suggest that the user request relevant tests (unit and/or e2e) be written and run
- Do **not** write tests or run tests unless the user explicitly asks you to
- If the user asks you to run tests, run them to completion and confirm they pass — do not assume they will pass
- Mock only dependencies that are genuinely impossible to control in a test environment (third-party APIs, hardware, external services)
- **Never start the server, app, or any background service** — starting services is the user's responsibility

---
