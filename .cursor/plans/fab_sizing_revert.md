---
name: FAB sizing revert
overview: Remove the 70% scale transform from FAB groups and apply sizing directly to each element. Match the project/folder back button size to the page button.
todos: []
isProject: false
---

# FAB Sizing Revert

## Summary

Remove `transform: scale(0.7)` from both FAB UIs so elements render at their defined sizes. Ensure the project/folder floating title (back button) matches the page button dimensions.

---

## 1. Remove Scale from Project Pages FAB

**File**: [project-pages-fab.scss](src/components/project-pages-fab/project-pages-fab.scss)

- Remove `transform: scale(0.7)` and `transform-origin: bottom right` from `.ddc_pb_project-pages-fab`.
- Page buttons, folder/action buttons, and main button already have explicit sizes; they will render at full size once scale is removed.
- No need to change their CSS values — they are correct.

---

## 2. Match Project Title to Page Button Size

**File**: [project-pages-fab.scss](src/components/project-pages-fab/project-pages-fab.scss)

- `.ddc_pb_project-pages-fab__project-title` should use the same sizing as `.ddc_pb_project-pages-fab__page-button`:
  - `min-height: var(--size)` with `--size: min(40px, 8vw)` (or use the same pattern as page button).
  - `padding: 8px 24px 8px 12px` — keep 24px right padding (per earlier plan); vertical padding 8px to match page button.
  - `font-size: 0.9em` — same as page button.
- The page button uses `--size: min(40px, 8vw)` and `padding: 8px 12px`. The project title should have the same `min-height` and vertical padding (8px). The 24px right padding is intentional for the "twice padding" spec.

---

## 3. Remove Scale from Card Browser FAB

**File**: [card-browser-floating-menu.scss](src/components/card-browser-floating-menu/card-browser-floating-menu.scss)

- Remove `transform: scale(0.7)` and `transform-origin: bottom right` from `.ddc_pb_card-browser-floating-menu`.
- Search and New buttons keep their pill shapes and explicit sizes.

---

## 4. Match Card Browser Folder Title to Page Button Size

**File**: [card-browser-floating-menu.scss](src/components/card-browser-floating-menu/card-browser-floating-menu.scss)

- `.ddc_pb_card-browser-floating-menu__folder-title` should match the page button sizing:
  - `min-height: min(40px, 8vw)` (same as page button).
  - `padding: 8px 24px 8px 12px` (vertical 8px to match, 24px right per spec).
  - `font-size: 0.9em`.

---

## Files to Modify

| File | Changes |
|------|---------|
| [project-pages-fab.scss](src/components/project-pages-fab/project-pages-fab.scss) | Remove `transform` and `transform-origin`; ensure project-title uses same min-height and padding pattern as page-button |
| [card-browser-floating-menu.scss](src/components/card-browser-floating-menu/card-browser-floating-menu.scss) | Remove `transform` and `transform-origin`; ensure folder-title matches page-button sizing |

---

## Verification

After changes:

1. Page buttons, folder button, and action buttons appear at full size (no shrinking).
2. Main FAB button and Search/New buttons appear at full size.
3. Project title and folder title pills have the same height as page buttons (min-height 40px/8vw, 8px vertical padding).
