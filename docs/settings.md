# Settings

Reference for Project Browser plugin settings that affect display and behavior.

## Why it exists

Settings control how the plugin renders and behaves. This page documents the most important options that affect **how you access the Card Browser** and **how items are displayed**.

## Access and behaviour

These settings control when and how you see the Card Browser.

### Replace new tab with Card Browser

When enabled, opening a new tab (an “empty” pane) shows the Card Browser instead of a blank view.

### Launch folder

Sets the starting folder when the Card Browser opens. This is useful if you have a “home” folder you always want to start from.

### Open command and ribbon icon

You can enable a command palette entry and/or a ribbon icon to open the Card Browser on demand.

### State Menu default visibility

Controls whether the in-note State Menu is shown by default when you open a note.

## Display settings

### Use Aliases

When enabled, card titles show the first frontmatter alias of a markdown file instead of its basename. Only applies to `.md` files with frontmatter aliases.

### Show extension for non-document files

When enabled, non-document files (PDF, images, etc.) display the full filename including extension (e.g. `document.pdf` instead of `document`) on both project browser cards and page menu buttons. When disabled, only the basename is shown. The extension portion (`.pdf`, `.png`, etc.) is rendered with `var(--text-faint)` so it appears slightly faded.

**Document types** (notes `.md`, canvas `.canvas`, and bases `.base`) never show the file extension, regardless of this setting. They always display the basename.

Only canvas and base files show a small type tag (CANVAS, BASE) at the top-right of their cards and page menu buttons; other file types do not.

## Technical implementation

- Card titles use `getFileDisplayNameParts()` for split basename/extension rendering; `getFileDisplayName()` returns the full string.
- The function checks `useAliases` and `showFileExtForNonMdFiles` from `plugin.settings`.
- Non-document detection uses `OBSIDIAN_DOCUMENT_EXTENSIONS` (`md`, `canvas`, `base`); files without extension are treated as markdown for backward compatibility.
- Settings types: `PluginSettings_0_4_0` in `src/types/plugin-settings_0_4_0.ts`.
- Access and state-menu behaviour are read during plugin load (`src/main.ts`) and initialised into UI state (`src/logic/stores.ts`).

### File type visibility

Controls which file types appear in the project browser view and the project pages menu. See [docs/file-type-visibility.md](file-type-visibility.md) for full details.

## Related

- [Overview](overview.md)
