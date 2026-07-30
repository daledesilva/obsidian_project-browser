# Build ready tasks

Implement ClickUp tickets from one or more lists' `Ready` column that have ticket type `Build`, batched into as few reviewable pull requests as practical (see PR batching bias below). Feature branches and independent PRs use the list-aligned release branch (`release_<version>` from each list name), not `main`.

Any text after `/build-ready-tasks` must be a ClickUp list URL or list ID, or a ClickUp folder URL or folder ID (a folder may contain several lists to check).

## Safety

- Use the ClickUp MCP server for all ClickUp reads and updates. Before the first MCP call, read the relevant tool descriptors for `clickup_get_list`, `clickup_get_folder`, `clickup_get_workspace_hierarchy`, `clickup_filter_tasks`, `clickup_get_task`, `clickup_get_custom_fields`, and `clickup_update_task`.
- Do not use browser automation as a fallback for missing ClickUp MCP support.
- Do not start if the current git working tree has uncommitted tracked changes or unrelated untracked files. Ask the user whether to commit, stash, or remove them first.
- Never update git config, skip hooks, force push, use interactive git commands, reset, rebase, or amend unless the user explicitly asks.
- Treat this command as explicit approval to create branches, implement work, commit, push, and open PRs for the selected Ready + Build tickets only.
- Stop the workflow on the first unresolved implementation, test, push, PR, or ClickUp blocker. Report the completed PRs, remaining groups, and the blocker.

## PR host repo (forks)

Always open PRs against the repository that **`origin`** points to (this checkout / your account), **not** against an `upstream` parent unless the user explicitly asks to contribute upstream.

Resolve once before the first `gh pr create` (and reuse for the whole run):

```bash
ORIGIN_URL=$(git remote get-url origin)
ORIGIN_REPO=$(printf '%s\n' "$ORIGIN_URL" | sed -E 's#^git@[^:]+:##; s#^https?://[^/]+/##; s#\.git$##; s#/$##')
```

- Pass `--repo "$ORIGIN_REPO"` on every `gh pr create` / `gh pr list` / `gh pr view` / `gh repo view` used for PR targeting.
- Do **not** choose the host from bare `gh repo view` or `gh pr create` with no repo argument — on forks that often selects the **parent** (`upstream`).
- After each create, confirm the PR URL’s `owner/name` matches `$ORIGIN_REPO` before writing it to ClickUp.

## Resolve the Ready Build tickets

1. Parse the text after `/build-ready-tasks`.
   - If it is missing, ask for a ClickUp list or folder URL or ID and stop.
   - If it is a URL, decide whether it targets a **list** or a **folder** from the path when possible (e.g. `/li/` or list-segment vs `/f/` or folder-segment). Extract the corresponding ID when present.
   - If the URL cannot be classified or the ID cannot be extracted, ask for a clear list or folder ID and stop.
   - If the input is a bare ID (not a URL), try `clickup_get_list` first; if that fails, try `clickup_get_folder`. If both fail, ask the user to clarify and stop.

2. Resolve the target into one or more lists to check:

   **List target**
   - Use `clickup_get_list` with `list_id` (or `list_name` when the input is clearly a list name).
   - The workflow has exactly one list to process.

   **Folder target**
   - Use `clickup_get_folder` with `folder_id` (or `folder_name` + space when the input is clearly a folder name) to confirm the folder.
   - Discover every list in that folder via `clickup_get_workspace_hierarchy` (`max_depth: "2"`, scoped with `space_ids` when known) or another ClickUp MCP path that returns the folder’s lists. Paginate until all lists are collected.
   - Skip lists that are clearly backlog / reference-only (e.g. name contains `Backlog`, ignoring case), or that `clickup.mdc` marks as reference-only. Report them as skipped.
   - If the folder has no remaining lists after skips, report that and stop.
   - Process every remaining list in the folder independently (see multi-list rules below). Do not require the user to pick a single list.

3. For each list to process, resolve its release base branch from the list name.
   - Every group branched and every independent PR opened for that list must use the release branch that aligns with **that list’s** name — not the repo default (`main` / `master`).
   - From the list name, extract the version token: the last whitespace-separated segment that looks like a dotted version (e.g. `0.4`, `1.2.3`). Strip a trailing colon or similar punctuation from that token if present.
   - Examples: list `xyz 0.4` → `release_0.4`; list `Sl: 1.0` → `release_1.0`; list `Product 1.2.0` → `release_1.2.0`.
   - The base branch name is always `release_<version>` (underscore after `release`, no other separators).
   - Confirm that branch exists on the remote (fetch if needed, then `git rev-parse --verify origin/release_<version>` or equivalent).
   - If no version token can be extracted from the list name: for a **single-list** target, report and stop; for a **folder** target, skip that list, report why, and continue with other lists.
   - If `origin/release_<version>` does not exist: for a **single-list** target, report and stop; for a **folder** target, skip that list, report why, and continue. Never fall back to `main` or create the release branch.

4. For each remaining list, inspect configured statuses.
   - Match the status named `Ready`, ignoring only case and surrounding whitespace.
   - **Single-list target:** if no matching status exists, say exactly: `There is no ready column` — then do nothing else.
   - **Folder target:** if a list has no Ready status, skip that list, report it, and continue with other lists. If every list is skipped this way, say exactly: `There is no ready column` and stop.

5. For each list that has Ready, retrieve every task with that status.
   - Use `clickup_filter_tasks` with `list_ids: [<list id>]`, `statuses: [<exact Ready status>]`, `include_closed: false`, and `subtasks: true`.
   - Paginate until all matching tasks are collected.
   - If a list has no Ready tasks, record that and continue (folder) or stop (single list with nothing left to do).

6. Keep only tickets with ticket type `Build`.
   - For each Ready task, use `clickup_get_task` (or inspect `task_type` / `taskType` from the filter payload when present).
   - Include a task only when its ticket type is `Build`, ignoring only case and surrounding whitespace.
   - Do not implement Ready tickets of any other type (or with no type). Report them as skipped with their type.
   - If no Ready + Build tickets remain across all lists being processed, report that and stop.

7. For each Ready + Build task, fetch implementation context:
   - Use `clickup_get_task` with `include: ["dependencies", "linked_tasks", "subtasks", "description", "checklists", "custom_fields"]` and `expand_statuses: true`.
   - Record task ID, custom ID, title, URL, description summary, status, task type, **source list id/name**, dependencies, linked tasks, subtasks, checklist size, priority, estimate if available, available statuses, and custom fields (including the `PR` field when present).

8. Resolve the workspace/list `PR` custom field once for later updates:
   - Use `clickup_get_custom_fields` (list, folder, space, and/or `include_workspace: true` as needed).
   - Match the field named `PR`, ignoring only case and surrounding whitespace.
   - Prefer a URL-type field when more than one match exists.
   - If no `PR` field exists, continue the workflow but report that PR links cannot be saved on tickets.

### Multi-list (folder) rules

- Treat each list’s Ready + Build set as tied to that list’s `release_<version>` base branch.
- Never put tickets from different release base branches into the same PR group.
- Prefer processing lists in ascending version order when versions are comparable; otherwise use a stable, reported order.
- Batching bias still applies **within** a single list / single release base. Across lists that share the same resolved `release_<version>`, batching across those lists is allowed when it stays reviewable; prefer keeping one list’s work together when uncertain.

## Build the implementation plan

Create a dependency graph using only the Ready + Build tasks as in-scope implementation nodes.

- A task with no in-scope blockers is a base dependency.
- A task blocked by another Ready + Build task must not be implemented before its blocker.
- If a task is blocked by a task outside the Ready + Build set, report the external blocker. Do not implement that task unless the dependency is clearly informational or already complete.
- If a dependency cycle exists, report the cycle and stop.

### PR batching bias (default: fewer PRs)

Prefer **one PR for many small, simple tickets**. Do not open a PR per ticket or per minor feature area. Too many small PRs is worse than one reviewable batch of simple work.

**Own PR only when justified:**

| Put in its own PR when… | Otherwise… |
|---|---|
| The change is **complex** (multiple subsystems, non-obvious design, hard to review in a mixed batch) | Bundle with other small/simple Ready + Build work |
| The change is **risky** (migrations, data loss risk, launcher/default-home behavior, security, broad user-facing regressions) | Bundle |
| The change is **simple but large** (high file/line volume, many touch points, long test plan even if each piece is easy) | Bundle other small work separately |
| A **theme cluster** has enough related tickets to stand alone (e.g. several UI cosmetic updates, accessibility polish, copy tweaks) | Prefer one themed PR for that cluster, not one PR per ticket |

**Default bucket:** All remaining small, simple, low-risk tickets **that share the same release base branch** go into **one shared PR**, even when they touch different files or light feature areas, as long as the combined test plan stays short and reviewable.

Classify each task before grouping:

- **Small / simple:** Low risk, limited scope, easy to verify. Default destination is the shared small-work PR (or a theme cluster PR when a clear theme has enough tickets).
- **Complex or risky:** Gets its own PR.
- **Simple but large:** Gets its own PR because of volume, not difficulty.
- **Base dependency:** Unlocks other Ready + Build work. Small base deps join the shared small-work (or theme) PR when possible; large/risky base deps get their own PR and may require stacking.
- **Blocked:** Has unresolved blockers outside the current Ready + Build plan.

Group tasks in implementation order:

1. Partition work by release base branch first (`release_<version>`). Never mix different bases in one PR.
2. Within each release base, start from the bias above: plan the **minimum number of PRs** that still keep complex/risky/large work isolatable.
3. Put unavoidable base dependencies first.
   - Fold small base deps into the shared small-work PR (or an early theme PR) when they unlock later work in that same PR.
   - Put a large or risky base dependency in its own PR.
4. Batch all other small/simple tickets into one PR unless a theme cluster is large enough to deserve its own PR (still one PR for the whole theme, not one per ticket).
5. Give each complex, risky, or simple-but-large ticket its own PR.
6. Split only when a candidate group would make review hard: hard-to-reason interactions across unrelated risky flows, a test plan that is too long to verify in one pass, or dependency ordering that requires a separate merge. Do **not** split merely because tickets are unrelated-but-simple.
7. Prefer stacked PRs when later groups depend on unmerged code from earlier groups **on the same release base**:
   - Branch dependent groups from the prerequisite branch.
   - Open the dependent PR with the prerequisite branch as its base.
   - Report the intended merge order.

Before implementing, show a short plan with:

- The ClickUp target (list or folder name/id)
- For each list being processed: list name, Ready status, and resolved release base branch (`release_<version>`)
- Any lists skipped (backlog, no Ready, no version, missing release branch, no Ready + Build) and why
- The ordered PR groups (and a one-line reason each group is separate, e.g. `shared small fixes`, `risky Room migration`, `UI cosmetics theme`), each tagged with its release base
- The tickets in each group
- Which groups are stacked on earlier groups
- Any blocked or skipped tickets and why (including Ready tickets skipped for non-Build type)

Proceed without asking for extra confirmation unless the plan has ambiguity that could change the code architecture or release order.

## Implement each group

For each group, complete the full loop before starting the next group:

1. Prepare the branch.
   - Confirm the working tree is clean.
   - Use that group’s list-aligned release branch (`release_<version>`) as the base for independent groups. Do not use the repo default (`main` / `master`).
   - Fetch that release branch if needed, then create the feature branch from `origin/release_<version>`.
   - For dependent / stacked groups, create the branch from the prerequisite group branch (which itself ultimately comes from the same release branch).
   - Name the branch using `git-workflow.mdc`, with the dominant prefix and a short description. Include a task ID when it helps traceability.

2. Move the group's tickets out of Ready.
   - Resolve an active-work status such as `In Progress` from the task's available statuses.
   - If an active-work status exists, use `clickup_update_task` to move each group task there.
   - If no active-work status exists, leave the tasks unchanged and report that status movement was skipped.

3. Implement the group.
   - Use the ticket descriptions, dependencies, and codebase as source material.
   - Keep the edit scope limited to the group.
   - Do not include unrelated cleanup.
   - Add or update tests only when the ticket explicitly calls for them or the repo's rules require them.

4. Verify the group.
   - Run relevant tests, lint, build, or manual verification for the changed code.
   - If verification requires a user-started app, service, or manual environment, stop and ask instead of starting it yourself.
   - If verification fails, fix and rerun before committing.

5. Commit the group.
   - Stage only files relevant to the group.
   - Use the required HEREDOC commit format.
   - Write one conceptual past-tense message.
   - Add one `Clickup Task: <id>` line for each ticket in the group.

6. Push and open the PR.
   - Push the branch with upstream tracking on **`origin`** if needed (`git push -u origin HEAD`).
   - Create the PR with `gh pr create --repo "$ORIGIN_REPO" …` (see **PR host repo**).
   - Use the group’s list-aligned release branch (`release_<version>`) as `--base` for independent groups.
   - Use the prerequisite group branch as `--base` for stacked groups.
   - Confirm the PR URL host matches `$ORIGIN_REPO` before ClickUp updates.

7. Move the group's tickets to review and save the PR link.
   - Resolve the `Review` status from the task's available statuses.
   - After the PR exists, use `clickup_update_task` for each group task to:
     - Move it to Review when that status exists (leave unchanged if already Review or later).
     - Set the `PR` custom field to the PR URL when the field was resolved earlier (`custom_fields: [{ id: <PR field id>, value: <PR URL> }]`).
   - If no Review status exists, still save the PR field when possible, leave status unchanged, and report that status movement was skipped.
   - If the `PR` field could not be resolved or the update fails, report that clearly and ask the user to paste the PR URL manually.

8. Report progress for the group:
   - Source list name(s)
   - Branch
   - Commit hash
   - PR URL and base branch
   - Tickets included
   - Tests or verification run
   - ClickUp status changes
   - Whether the `PR` custom field was updated on each ticket

## PR body format

```markdown
## Summary

- <What changed and why>

## ClickUp

- [<task name>](<task url>) - `<task id>` (list: `<list name>`)

## Test plan

- [x] <verification command or manual check>

## Stack

Base: `<base branch>`
Depends on: `<prior PR URL or none>`
```

Omit `## Stack` only when the PR is independent and based on the list-aligned release branch.

## Final output

When all possible groups are complete, show:

- Target type (list or folder), name/id, lists checked, lists skipped, and each list’s release base branch (`release_<version>`)
- Host repo for all PRs (`$ORIGIN_REPO` / `origin`)
- PRs created in merge order (each with its `--base` and URL)
- Tickets completed, skipped (including Ready tickets that are not type Build), or blocked
- Verification summary
- Any ClickUp statuses or `PR` field values that could not be updated
