//////////////////
//////////////////

/** Filename postfix that Obsidian exclude filters use to hide drafts from search/graph. */
export const DRAFT_FILENAME_SUFFIX = '[DRAFT]';
/** Manual hide from search/graph (context menu). Independent of state-driven hide. */
export const HIDDEN_FILENAME_SUFFIX = '[HIDDEN]';
/** State-driven hide from search/graph when a state has `hideFromSearchGraph`. */
export const STATE_HIDE_FILENAME_SUFFIX = '[STATE-HIDE]';

/**
 * Excluded-files entries for Obsidian.
 * Plain strings are compiled as `^`-anchored regexes, so they only match vault-root paths.
 * Slash-wrapped forms are unanchored JS regexes. Suffix markers are extension-agnostic so md,
 * canvas, base, and folders named with the suffix all match.
 */
export const DRAFT_USER_IGNORE_FILTER = '/\\[DRAFT\\]\\.md/';
export const HIDDEN_USER_IGNORE_FILTER = '/\\[HIDDEN\\]/';
export const STATE_HIDE_USER_IGNORE_FILTER = '/\\[STATE-HIDE\\]/';
/** Older plugin-injected filters to strip on load so only the current pattern remains. */
export const LEGACY_HIDDEN_USER_IGNORE_FILTERS = [
	'[HIDDEN].md',
	'/\\[HIDDEN\\]\\.md/',
] as const;
export const LEGACY_DRAFT_USER_IGNORE_FILTER = '[DRAFT].md';

const SEARCH_GRAPH_SUFFIX_PATTERN = /\s*\[(?:HIDDEN|STATE-HIDE|DRAFT)\]\s*$/i;
const MANUAL_HIDDEN_SUFFIX_PATTERN = /\s*\[HIDDEN\]\s*$/i;
const STATE_HIDE_SUFFIX_PATTERN = /\s*\[STATE-HIDE\]\s*$/i;

export type SearchGraphHideFlags = {
	hasManualHidden: boolean;
	hasStateHide: boolean;
};

/**
 * Parses manual `[HIDDEN]` and state `[STATE-HIDE]` markers from the end of a basename.
 * Suffix order when both are present: `{stem} [STATE-HIDE] [HIDDEN]`.
 */
export function parseSearchGraphHideSuffixes(basename: string): { stem: string; flags: SearchGraphHideFlags } {
	let stem = basename;
	const flags: SearchGraphHideFlags = { hasManualHidden: false, hasStateHide: false };

	while (true) {
		if (MANUAL_HIDDEN_SUFFIX_PATTERN.test(stem)) {
			flags.hasManualHidden = true;
			stem = stem.replace(MANUAL_HIDDEN_SUFFIX_PATTERN, '').trimEnd();
			continue;
		}
		if (STATE_HIDE_SUFFIX_PATTERN.test(stem)) {
			flags.hasStateHide = true;
			stem = stem.replace(STATE_HIDE_SUFFIX_PATTERN, '').trimEnd();
			continue;
		}
		break;
	}

	return { stem, flags };
}

/** Rebuilds a basename from a stem plus hide flags (state marker before manual marker). */
export function rebuildBasenameWithHideFlags(stem: string, flags: SearchGraphHideFlags): string {
	let name = stem;
	if (flags.hasStateHide) {
		name = `${name} ${STATE_HIDE_FILENAME_SUFFIX}`;
	}
	if (flags.hasManualHidden) {
		name = `${name} ${HIDDEN_FILENAME_SUFFIX}`;
	}
	return name;
}

/**
 * Strips plugin-managed search/graph suffixes from a basename so card titles and page menus
 * never show raw `[HIDDEN]` / `[STATE-HIDE]` / `[DRAFT]` markers.
 */
export function stripSearchGraphFilenameSuffixes(basename: string): string {
	let cleaned = basename;
	// Repeatedly strip so stacked suffixes (unusual but possible) still clean up.
	while (SEARCH_GRAPH_SUFFIX_PATTERN.test(cleaned)) {
		cleaned = cleaned.replace(SEARCH_GRAPH_SUFFIX_PATTERN, '').trimEnd();
	}
	return cleaned;
}

/** True when the basename has a manual `[HIDDEN]` marker (context-menu hide). */
export function basenameHasHiddenSuffix(basename: string): boolean {
	return parseSearchGraphHideSuffixes(basename).flags.hasManualHidden;
}

/** True when the basename has a state-driven `[STATE-HIDE]` marker. */
export function basenameHasStateHideSuffix(basename: string): boolean {
	return parseSearchGraphHideSuffixes(basename).flags.hasStateHide;
}

/** True when either manual or state hide markers are present (UI accent styling). */
export function basenameIsHiddenFromSearchGraph(basename: string): boolean {
	const { flags } = parseSearchGraphHideSuffixes(basename);
	return flags.hasManualHidden || flags.hasStateHide;
}

export function basenameHasDraftSuffix(basename: string): boolean {
	return /\[DRAFT\]\s*$/i.test(basename);
}

/** Builds a basename with the manual `[HIDDEN]` marker, preserving other hide suffixes. */
export function basenameWithHiddenSuffix(basename: string): string {
	const { stem, flags } = parseSearchGraphHideSuffixes(basename);
	return rebuildBasenameWithHideFlags(stem, { ...flags, hasManualHidden: true });
}

/** Builds a basename with the state `[STATE-HIDE]` marker, preserving manual hide. */
export function basenameWithStateHideSuffix(basename: string): string {
	const { stem, flags } = parseSearchGraphHideSuffixes(basename);
	return rebuildBasenameWithHideFlags(stem, { ...flags, hasStateHide: true });
}

/** Removes only the manual `[HIDDEN]` marker; keeps `[STATE-HIDE]` intact. */
export function basenameWithoutHiddenSuffix(basename: string): string {
	const { stem, flags } = parseSearchGraphHideSuffixes(basename);
	return rebuildBasenameWithHideFlags(stem, { ...flags, hasManualHidden: false });
}

/** Removes only the state `[STATE-HIDE]` marker; keeps manual `[HIDDEN]` intact. */
export function basenameWithoutStateHideSuffix(basename: string): string {
	const { stem, flags } = parseSearchGraphHideSuffixes(basename);
	return rebuildBasenameWithHideFlags(stem, { ...flags, hasStateHide: false });
}

/** Builds a basename with the `[DRAFT]` marker (used by page versioning). */
export function basenameWithDraftSuffix(basename: string, dateStamp: string): string {
	const cleaned = stripSearchGraphFilenameSuffixes(basename);
	return `${cleaned} - ${dateStamp} ${DRAFT_FILENAME_SUFFIX}`;
}
