# Cursor Git And Workflow Command Setup

Reference for commit message format, shared workflow rules, and common slash commands.

## Artifacts

| Artifact | Location | Purpose |
|---|---|---|
| **Commit rule** | User Rule (Settings → Rules) or `.cursor/rules/committing-changes-with-git.mdc` | Agent commit behavior when asked to commit (does **not** push unless explicitly asked) |
| **`/commit` command** | `~/.cursor/commands/commit.md` (global) or `.cursor/commands/commit.md` (project) | Explicit workflow: stage → commit → **push** |
| **`/pr` command** | `~/.cursor/commands/pr.md` (global) or `.cursor/commands/pr.md` (project) | Explicit workflow: inspect branch changes, push if needed, and open a pull request |
| **`/document` command** | `~/.cursor/commands/document.md` (global) or `.cursor/commands/document.md` (project) | Explicit workflow: document current-thread feature work and add context comments |
| **`/build-ready-tasks` command** | `~/.cursor/commands/build-ready-tasks.md` (global) or `.cursor/commands/build-ready-tasks.md` (project) | Explicit workflow: pull ClickUp Ready-column tickets with type Build from a list, batch small/simple work into few PRs (own PR only for complex, risky, large, or clear themes), implement, commit, push |
| **Documentation/context comments rule** | `.cursor/rules/documentation-and-context-comments.mdc` | Shared rule for when to update docs and when to add code comments that explain intent |
| **ClickUp rule** | `.cursor/rules/clickup.mdc` | Task folder scope; feeds `Clickup Task:` line in commits |
| **Git workflow** | `.cursor/rules/git-workflow.mdc` | Branch naming and AI commit policy |

## Rule vs command

| Behavior | Commit rule | `/commit` command |
|---|---|---|
| Triggers | User asks Agent to commit | User types `/commit` in Agent chat |
| Commits | Yes | Yes |
| Pushes | No (unless explicitly asked) | Yes (always) |
| Optional context | N/A | `/commit 86abc1234` for ClickUp task ID |

The Source Control sparkle button (**Generate commit message**) does not read rules or commands.

## Commit message format

```
<past-tense-verb>: <1–2 sentences — conceptual what + emphasis on why>

Clickup Task: <ClickUp-task-ID>   ← optional; blank line before it
```

### Grammar

- **Prefix:** lowercase past-tense verb + `: ` — e.g. `added:`, `updated:`, `fixed:`, `redesigned:`, `removed:`
- **Body:** each sentence starts with a past-tense verb; entire message stays past tense
- **Avoid:** passive openings (`was dropped`), imperatives (`Fix`, `Update`), present tense (`persists`), file lists

### Example

```
fixed: Dropped hand tracking input during scene transitions because the OVRHand reference was destroyed on load. Rebounded the reference in Awake so input persisted across scenes.

Clickup Task: 86abc1234
```

## Setup checklist (new repo)

1. Add `_reference_ide-setup` to the workspace (clone, submodule, or sibling folder)
2. Copy **`shared/`** and the matching **environment folder** (e.g. `android-native/`, `react-native/`, `unity-mixed-reality/`) into the target project
3. Merge `.cursor/rules/`, `.cursor/commands/`, and environment-specific `.cursor/` subtrees into the project's `.cursor/`
4. Copy environment `docs/` and `scripts/` to the project root when applicable
5. Fill in template placeholders — see root `README.md` and `shared/.cursor/rules/project-overview.mdc`, `tech-stack.mdc`, `clickup.mdc`
6. Add **Committing changes with git** as a User Rule — copy text from `committing-changes-with-git.mdc`, or use the file as a project rule
7. Copy `shared/.cursor/commands/*.md` to the project, or to `~/.cursor/commands/` for all repos
8. Test: ask Agent to commit → should not push
9. Test: `/commit` → should commit and push

## Global vs project placement

| File | Global (`~/.cursor/`) | Project (`.cursor/`) |
|---|---|---|
| `commands/{commit,pr,document,build-ready-tasks}.md` | All repos on this machine | Shared with team via git |
| User Rule (commit format) | Recommended | Optional duplicate as project rule |
