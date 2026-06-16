---
applyTo: "**/*.{ts,tsx,js,jsx}"
---

# TypeScript / JavaScript Coding Style

## Avoid Ternary Branching

Use ternary (`?:`) only when both branches are plain values or single variables. For any logic, side effects, or function calls, use a full `if` statement.

```ts
// ❌ BAD
const label = isActive ? getActiveLabel() : computeFallback(item);

// ✅ GOOD
let label: string;
if (isActive) {
    label = getActiveLabel();
} else {
    label = computeFallback(item);
}
```

## Precompute Complex Conditions

Do not run complex expressions directly inside an `if` condition. Precompute them as named constants first.

```ts
// ❌ BAD
if (user.role === 'admin' && permissions.includes('write') && !session.isExpired()) { ... }

// ✅ GOOD
const isAuthorisedEditor = user.role === 'admin' && permissions.includes('write') && !session.isExpired();
if (isAuthorisedEditor) { ... }
```

## Inline Simple `if` Statements

When an `if` statement has a single simple statement in its body, keep it inline without curly braces.

```ts
// ❌ BAD
if (!settings) {
    return;
}

// ✅ GOOD
if (!settings) return;
```

Use braces when the branch contains more than one statement, a nested branch, or a comment that needs to live inside the branch.

## Do Not Use `useMemo` Unnecessarily

Do not wrap trivial value selection or cheap calculations in `React.useMemo` unless stable identity is actually required.

```tsx
// ❌ BAD
const chosenAtom = React.useMemo(
    () => isProjectPage ? projectPageStatelessSettingsAtom : statelessSettingsAtom,
    [isProjectPage]
);

// ✅ GOOD
let chosenAtom = statelessSettingsAtom;
if (isProjectPage) chosenAtom = projectPageStatelessSettingsAtom;
```

Use `React.useMemo` when it is needed to preserve identity for derived objects, derived atoms, or expensive computations.

## Branch Comments Go Inside the Branch

Place comments that explain a branch at the **start of that branch**, not before the `if` statement.

```ts
// ❌ BAD
// Only admins can delete
if (isAdmin) {
    deleteRecord();
}

// ✅ GOOD
if (isAdmin) {
    // Only admins can delete
    deleteRecord();
}
```

## React UI Layers

Projects may have two distinct UI layer types — be deliberate about which you use:

- **Framework components** (React components, JSX) — use for all interactive UI and anything that needs state or reactivity
- **Host/native elements** (platform-native APIs like `document.createElement` or Obsidian's `createEl`) — use only when the platform requires it

Do not mix layers arbitrarily. Follow the established pattern in the project.

## Colocate Styles

Place style definitions in the same folder as the component they style. Do not keep styles in a global folder unless they are genuinely global design tokens.

## State Management

- Use reactive state (Jotai, Zustand, React state) for UI and cross-component concerns
- Use structured session state (Redux Toolkit) for app-level workflow state that needs defined actions
- Follow whichever pattern is already established in the project

---

# UI and Styling

## Use the Theme System

Pull all visual tokens — colors, spacing, typography, border radii, animation timings — from the project's established theme system. Do not hardcode values.

```ts
// ❌ BAD
const styles = { color: '#3a86ff', fontSize: 14, padding: 12 };

// ✅ GOOD
const { colors, spacing, typography } = useTheme();
const styles = { color: colors.primary, fontSize: typography.body, padding: spacing.md };
```

## No Inline Styles Except Truly Dynamic Values

Avoid inline styles. The only acceptable exception is a value computed at runtime that cannot be expressed statically (e.g. a width derived from a live measurement).

## Follow the Project's Style API

Use whichever style API the project has established:

- React Native: `StyleSheet.create()` with `useTheme()`
- Web: CSS modules, `styled-components`, or utility classes from the design system
- Ignite: `useAppTheme()`, `themed()`, `ThemedStyle<T>` with bare JS objects

Do not introduce a new styling approach without a clear reason.
