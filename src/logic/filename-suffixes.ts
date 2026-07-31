//////////////////
//////////////////

/** Filename postfix that Obsidian exclude filters use to hide drafts from search/graph. */
export const DRAFT_FILENAME_SUFFIX = '[DRAFT]';
/** Filename postfix that Obsidian exclude filters use to hide arbitrary notes/folders from search/graph. */
export const HIDDEN_FILENAME_SUFFIX = '[HIDDEN]';

/**
 * Excluded-files entries for Obsidian.
 * Plain strings are compiled as `^`-anchored regexes, so they only match vault-root paths.
 * Slash-wrapped forms are unanchored JS regexes. `[HIDDEN]` is extension-agnostic so md,
 * canvas, base, and folders named with the suffix all match.
 */
export const DRAFT_USER_IGNORE_FILTER = '/\\[DRAFT\\]\\.md/';
export const HIDDEN_USER_IGNORE_FILTER = '/\\[HIDDEN\\]/';
/** Older plugin-injected filters to strip on load so only the current pattern remains. */
export const LEGACY_HIDDEN_USER_IGNORE_FILTERS = [
	'[HIDDEN].md',
	'/\\[HIDDEN\\]\\.md/',
] as const;
export const LEGACY_DRAFT_USER_IGNORE_FILTER = '[DRAFT].md';

const SEARCH_GRAPH_SUFFIX_PATTERN = /\s*\[(?:HIDDEN|DRAFT)\]\s*$/i;

/**
 * Strips plugin-managed search/graph suffixes from a basename so card titles and page menus
 * never show raw `[HIDDEN]` / `[DRAFT]` markers.
 */
export function stripSearchGraphFilenameSuffixes(basename: string): string {
	let cleaned = basename;
	// Repeatedly strip so stacked suffixes (unusual but possible) still clean up.
	while (SEARCH_GRAPH_SUFFIX_PATTERN.test(cleaned)) {
		cleaned = cleaned.replace(SEARCH_GRAPH_SUFFIX_PATTERN, '').trimEnd();
	}
	return cleaned;
}

export function basenameHasHiddenSuffix(basename: string): boolean {
	return /\[HIDDEN\]\s*$/i.test(basename);
}

export function basenameHasDraftSuffix(basename: string): boolean {
	return /\[DRAFT\]\s*$/i.test(basename);
}

/** Builds a basename with the `[HIDDEN]` marker, preserving a clean stem first. */
export function basenameWithHiddenSuffix(basename: string): string {
	const cleaned = stripSearchGraphFilenameSuffixes(basename);
	return `${cleaned} ${HIDDEN_FILENAME_SUFFIX}`;
}

/** Builds a basename with the `[DRAFT]` marker (used by page versioning). */
export function basenameWithDraftSuffix(basename: string, dateStamp: string): string {
	const cleaned = stripSearchGraphFilenameSuffixes(basename);
	return `${cleaned} - ${dateStamp} ${DRAFT_FILENAME_SUFFIX}`;
}
