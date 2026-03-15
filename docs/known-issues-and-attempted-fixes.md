# Known issues and attempted fixes

Reference for Obsidian and plugin issues that have been investigated and for which solutions were attempted but reverted. Kept for future reference to avoid re-exploring dead ends.

## Why it exists

When addressing bugs or limitations, we sometimes try approaches that do not work out. Recording both the problem and what was attempted helps future contributors avoid repeating the same work and understand the context if Obsidian behaviour or APIs change.

## Mouse back button (Canvas and Base files)

### The problem

When navigating back from a Canvas or Base file to the project browser, the mouse back button often fails: instead of returning to the project browser, Obsidian shows a blank page. This works correctly for Markdown files.

This is due to known navigation-history bugs in Obsidian for Canvas and Base view types. The plugin cannot reliably fix this from the outside.

### Attempted solutions

Two approaches were implemented and later removed because they did not fix the issue (or introduced other problems).

#### Low-risk approach (reverted)

1. **Empty-leaf replacement** — In `loadCardBrowserOnNewTab`, when the user focuses a leaf with view type `'empty'`, we replace it with the project browser. The idea was that when back from Canvas/Base lands on an empty leaf instead of the project browser, we would show the project browser instead. The empty-leaf replacement logic remains in place for new-tab behaviour but does not fix the back-button case.

2. **Proactive state save before opening file** — Before opening a file in the same leaf, we saved the project browser state via `prepareStateBeforeOpeningFile` so that when the user pressed back, Obsidian would have something to restore. This was wired through `CardBrowserContext`, `note-card-base`, and `card-browser-view`. It did not reliably improve back-button behaviour for Canvas/Base.

#### High-risk approach (reverted)

1. **`setViewState` workaround** — Instead of `leaf.openFile(file)` for Canvas and Base files, we used `leaf.setViewState` to set the view type and state for the target file. The intent was to avoid Obsidian’s default navigation-history handling for these types. Behaviour was inconsistent and did not reliably fix the back-button issue.

2. **Plugin setting** — A toggle `useCanvasBaseNavWorkaround` exposed the `setViewState` path in settings. Removed along with the workaround.

### Current workaround for users

When the mouse back button fails to return to the project browser from a Canvas or Base file, users can use the Project Pages FAB’s **Folder** button (“Open folder in project browser”) to navigate back to the project browser for that folder.

## Technical gotchas

- **Obsidian API stability** — Navigation history and view-state handling are Obsidian internals. Plugin workarounds may break across Obsidian versions.
- **Re-evaluation** — If Obsidian fixes its Canvas/Base navigation bugs in a future release, the approaches above may become obsolete or unnecessary.
