# obsidian_project-browser — Copilot Instructions

These instructions apply repo-wide. When creating or updating project conventions or AI guidance, maintain parity with `.cursor/rules/*.mdc`.

---

## Project overview

This workspace contains **obsidian_project-browser** — an Obsidian plugin that replaces the new tab window with a card layout of files in each folder, organised by state. The view is filterable with an inbuilt search field, and files can be assigned a state from a prominent menu within the note.

### Tech stack

- TypeScript, React, Jotai, Redux Toolkit
- SCSS for styling (co-located with components)
- Obsidian plugin API for views, settings, modals, and commands

### Documentation

Design documentation and implementation notes live in `docs/` at the repository root.

---

## Verification guidelines

- Never assume a change will successfully fix something. Every fix must be verified.
- Do not remove `console.log` statements (or other debug logging) while making a change. Keep them until the fix is confirmed to work.
- Only remove or reduce logging after verification is complete.

---

## Testing guidelines

- Never start the server or the app; starting services is the user's responsibility.

---

## Editing guidelines

- Respect the project's existing patterns and conventions before introducing new ones.
- Docs in `docs/` are reference material. Keep them accurate if related code changes.

---

## Plugin settings

Never create a new plugin settings version unless explicitly asked. When adding or changing settings, work within the current version (`PluginSettings_0_4_0` in `src/types/plugin-settings_0_4_0.ts`). Do not introduce new migration paths or versioned type files unless the user explicitly requests a new settings version.

---

## Documentation standards

### Location

- Documentation lives in `docs/` at the repository root.
- Separate documentation into individual pages per general concept or feature, and shortlink each page from the main README or parent page.

### Structure and content order

1. **Why it exists** — lead with the purpose and how it fits into the broader system.
2. **Conceptual understanding** — flows, reasoning behind design decisions. This is the priority section.
3. **Flows and relationships** — describe these before diving into specifics.
4. **Technical implementation details** — only when needed to understand or use the system; keep language- and framework-agnostic where possible. Place lower in the page.
5. **Technical Gotchas** — a dedicated section for known pitfalls and non-obvious behaviours.

### Style

- Use Mermaid diagrams for architecture, data flows, and sequences; prefer Mermaid over ASCII art.
- Language/framework-specific code snippets are allowed as examples but should be clearly labelled and placed in the implementation details section.

---

## Planning standards

- The final step of every plan must be creating or updating relevant documentation.

---

## Naming conventions

Variable, parameter, and property names must be unambiguous and self-explanatory. A reader should understand exactly what a name represents without needing to trace its origin or read surrounding code.

- Prefer full, descriptive words over abbreviations, acronyms, or single letters.
- Names should convey both **what** the value is and **what it belongs to** when that context is non-obvious.
- Avoid generic placeholders like `data`, `info`, `value`, `item`, `temp`, `result`, `obj`, or `val` unless the type itself already provides full context.

```typescript
// ❌ BAD — ambiguous, requires context to decode
const val = getEditorBounds(e);
const temp = user.settings;
const data = await fetchPage(id);

// ✅ GOOD — explicit and self-contained
const editorBounds = getEditorBounds(editor);
const userSettings = user.settings;
const pageData = await fetchPage(pageId);
```

- Loop variables and short-lived indices are exempt when the scope is trivially small (e.g. `i` in a simple `for` loop over an array).
- Boolean names should read as a yes/no question or statement: `isVisible`, `hasUnsavedChanges`, `canEdit`.

---

## AI instruction rules (dual maintenance)

When creating or updating project conventions, coding standards, or AI guidance, **always create or update both**:

1. **Cursor rules** — `.cursor/rules/*.mdc`
2. **GitHub Copilot rules** — `.github/copilot-instructions.md` (repo-wide) and/or `.github/instructions/*.instructions.md` (path-scoped)

Express the **same intent** in both formats. Content may be adapted for each tool's conventions, but must not conflict.
