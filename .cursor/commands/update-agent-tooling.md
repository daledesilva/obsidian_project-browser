# Update agent tooling from reference repo

Sync Cursor agent tooling from `_reference_ide-setup` into a target project.

Any text after `/update-agent-tooling` is optional context, such as a target repo path, environment name, or specific tooling type to check.

## Scope

- Target the primary repository in the current workspace unless the user names another repo or path.
- Use `_reference_ide-setup` as the source of truth for reusable agent tooling.
- Pull in missing shared/common tooling from `shared/`.
- Detect this project type, then pull in missing relevant tooling from the matching environment folder, such as `android-native/`, `react-native/`, `web-react/`, `obsidian-plugin/`, or `unity-mixed-reality/`.
- Agent tooling includes Cursor commands, skills, plugins, rules those tools need, scripts/templates they depend on, and docs that explain how to use them.
- There is **no** shared ClickUp `mcp.json` to copy. Point people at `shared/docs/cursor-mcp-clickup-cloud-agents.md` (and the root README ClickUp section) for the URL and global vs project vs Cloud Agents placement. Copy or merge environment `mcp.json` only when a server is project-bound (e.g. Unity `unity-mcp`) and missing from the target.
- Do not commit, push, or change branches unless the user explicitly asks.

## Steps

1. Resolve source and target:
   - Find `_reference_ide-setup` in the workspace or as a sibling repo.
   - Identify the target repo from the `/update-agent-tooling` context, or default to the primary repo in the workspace.
   - If either repo is ambiguous or missing, ask for clarification before editing.

2. Determine the environment:
   - Prefer an explicit environment named after the command.
   - Otherwise inspect project files, existing `.cursor/rules/`, README files, build files, and package metadata.
   - If the project type is still unclear, ask before copying environment-specific tooling.

3. Compare tooling:
   - Check `shared/.cursor/commands/`, `shared/.cursor/skills/`, `shared/.cursor/plugins/`, plus any dependent shared docs, scripts, templates, or rules.
   - Check the same paths under the matching environment folder.
   - Compare against the target repo's `.cursor/commands/`, `.cursor/skills/`, `.cursor/plugins/`, `docs/`, `scripts/`, and `templates/` as applicable.
   - For MCP: there is no shared ClickUp JSON to sync. Mention the ClickUp setup doc if relevant. Only plan a project merge for environment-bound servers (e.g. Unity `unity-mcp`) when missing.

4. Copy missing relevant items:
   - Create target directories only when needed.
   - Copy missing files from `shared/` first, then from the environment folder.
   - **Do not** create or copy a ClickUp project `mcp.json` from shared (it does not exist). If ClickUp is already on global MCP, nothing to do for local; for Cloud Agents, use the agents dashboard.
   - If merging project-bound MCP from an environment folder, merge carefully instead of replacing existing servers.
   - Do not overwrite customized target files without reviewing the difference and asking for confirmation.
   - Preserve project-specific placeholders and filled-in values. If a copied template contains placeholders, list them for the user to fill in.

5. Verify:
   - Re-read the copied or merged files.
   - Run a read-only status/diff check to summarize what changed.
   - Do not build or deploy for Cursor-tooling-only changes.

## Output

When done, show:
- Target repo and detected environment
- Shared tooling added or already present
- Environment tooling added or already present
- MCP notes: skipped as reference (default), already covered by global MCP, dashboard needed for Cloud Agents, or merged (and why)
- Plugin merge notes
- Any skipped files, conflicts, or placeholders that need user input
