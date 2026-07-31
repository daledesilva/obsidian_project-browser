# Hide from search and graph

This page explains how Project Browser hides notes, pages, folders, and projects from Obsidian’s **Search** and **Graph view** using a `[HIDDEN]` filename suffix, while keeping them browsable in the Card Browser and page menus.

## Why it exists

Obsidian’s **Excluded files** list (`userIgnoreFilters`) excludes matching paths from search and graph. Project Browser uses that mechanism so users can hide items without deleting them or losing project-browser navigation.

The plugin also needs a clear in-app signal: hidden items should look different from normal items, but labels should not show raw `[HIDDEN]` markers in cards, breadcrumbs, or FAB titles.

## Conceptual understanding

### What “hidden from search/graph” means

- **On disk:** the file or folder basename ends with ` [HIDDEN]` (space before the bracketed suffix).
- **In Obsidian:** the vault’s Excluded files list includes the regex **`/\[HIDDEN\]/`**, which matches any path containing `[HIDDEN]` (markdown, canvas, base, attachments, folders).
- **In Project Browser:** the item remains visible and navigable; only search/graph exclusion changes.

This is separate from **hidden states** (Card Browser section visibility) and **Hide folder** (Project Browser’s PBS hide flag).

### Display names vs on-disk names

UI labels strip `[HIDDEN]` and `[DRAFT]` suffixes via:

- `getFileDisplayName()` / `getFileDisplayNameParts()` for files
- `getFolderDisplayName()` for folders
- `getAbstractFileDisplayName()` for mixed lists (e.g. card search)

**Rename modals** intentionally show the raw on-disk name so users can edit the suffix directly.

### Visual treatment

Items with `[HIDDEN]` in the path get the CSS class `ddc_pb_hidden-from-search-graph`:

- **Idle surfaces** (cards, folder buttons, page menu buttons, breadcrumb segments): background pushed toward the theme extreme — near-black in dark mode, near-white in light mode (`color-mix` on `--color-base-00`).
- **Selected hidden page** in the pages menu: muted active fill (accent mixed toward black/white) instead of full accent.
- **Low-priority cards** that are also hidden: keep full opacity so the background treatment reads clearly.

Styles live in `src/shared/search-graph-hidden.scss`, imported by card, folder, FAB, sidebar, and breadcrumb SCSS.

## Flows

### Plugin load — ensure Excluded files entry

```mermaid
flowchart LR
    Load[Plugin_onload] --> Migrate[Remove_legacy_filters]
    Migrate --> Ensure[Ensure_slash_HIDDEN_slash_regex]
    Ensure --> Config[app.json_userIgnoreFilters]
```

On load, `ensureHiddenMarkdownIgnoreFilter()` in `src/main.ts`:

1. Removes legacy entries (`[HIDDEN].md`, `/\[HIDDEN\]\.md/`).
2. Adds **`/\[HIDDEN\]/`** if missing (exact-match dedup).

### Hide or show an item

```mermaid
flowchart TD
    Action[User_action] --> Source{Source}
    Source -->|Context_menu| Menu[Hide_or_show_in_search_graph]
    Source -->|State_with_flag| State[setFileState_or_setFolderState]
    Menu --> Sync[syncFile_or_FolderHiddenFilenameSuffix]
    State --> FM[Update_frontmatter_or_PBS]
    FM --> Sync
    Sync --> Rename[vault.rename_add_or_remove_HIDDEN]
    Rename --> Obsidian[Obsidian_excludes_from_search_graph]
```

- **Manual:** context menus on files, folders, and projects (`Hide from search/graph` / `Show in search/graph`).
- **Automatic:** state settings with **Hide from search/graph** enabled (`hideFromSearchGraph` on `StateSettings`) sync the suffix when that state is applied (`syncFileHiddenFilenameForState` / `syncFolderHiddenFilenameForState`).

Folder context menu places hide/show in the same group as **Rename** and **Delete** (after a separator from convert/hide-folder actions).

### Display name in UI

Any surface that shows a human label should use the display-name helpers, not raw `file.basename` or `folder.name`. Card browser search filters on display names so queries match the label users see, not the suffixed on-disk name.

## Technical details

| Area | Key files |
|------|-----------|
| Suffix constants and strip/build helpers | `src/logic/filename-suffixes.ts` |
| Rename sync for files and folders | `src/logic/sync-hidden-filename.ts` |
| Excluded files list read/write | `src/logic/obsidian-user-ignore-filters.ts` |
| Folder display labels | `src/logic/get-folder-display-name.ts` |
| File display labels | `src/logic/get-file-display-name.ts` |
| Hidden surface styling | `src/shared/search-graph-hidden.scss` |
| State toggle in state editor | `src/modals/state-settings-modal-base/state-settings-modal-base.ts` |
| Default `hideFromSearchGraph` on Archived/Cancelled | `src/types/plugin-settings-migrations.ts` |

**Modified date:** hide/show uses a normal `vault.rename`. The plugin does **not** attempt to preserve `mtime` after rename (Obsidian’s timestamp APIs are unreliable for this).

## Technical gotchas

- **Plain `[HIDDEN].md` in Excluded files does not work** for nested or suffixed names. Obsidian compiles plain strings as start-anchored regexes. Use slash-wrapped **`/\[HIDDEN\]/`** only.
- **Excluded files settings UI** snapshots the filter list when opened. After the plugin adds a filter programmatically, Settings → Excluded files may still show “No exclusions added” until Settings is fully closed and reopened.
- **`config-changed` event:** notify with the key `'userIgnoreFilters'` (Obsidian 1.13+), not a bare event with no key.
- **Folder rename** adds `[HIDDEN]` to the folder name; descendant paths inherit the marker for Obsidian’s path-based exclude filter.
- **Do not strip suffixes in rename modals** — users editing `[HIDDEN]` need the real basename.
- **Hidden vs PBS “Hide folder”:** `[HIDDEN]` affects Obsidian search/graph; PBS hide affects Project Browser folder visibility — different flags and menus.

## Related

- [States and sections](states-and-sections.md) — visible vs hidden *states* (different concept)
- [Settings](settings.md) — display name helpers and aliases
- [Card Browser and navigation](card-browser-and-navigation.md) — breadcrumbs and FAB back labels
