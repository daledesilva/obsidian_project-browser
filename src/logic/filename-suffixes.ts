//////////////////
//////////////////

/** Filename postfix that Obsidian exclude filters use to hide drafts from search/graph. */
export const DRAFT_FILENAME_SUFFIX = '[DRAFT]';
/** Filename postfix that Obsidian exclude filters use to hide arbitrary notes from search/graph. */
export const HIDDEN_FILENAME_SUFFIX = '[HIDDEN]';

/** Substring injected into Obsidian's Excluded files list for draft markdown. */
export const DRAFT_USER_IGNORE_FILTER = '[DRAFT].md';
/** Substring injected into Obsidian's Excluded files list for hidden markdown. Always applied on load. */
export const HIDDEN_USER_IGNORE_FILTER = '[HIDDEN].md';

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

const DRAFT_BASENAME_PATTERN = /^(.+) - (\d{4}-\d{2}-\d{2}(?:-\d{4})?) \[DRAFT\]$/i;

/** Parses a versioned draft basename back into its live-page stem and date stamp. */
export function parseDraftBasename(basename: string): { stem: string; dateStamp: string } | null {
	const match = basename.match(DRAFT_BASENAME_PATTERN);
	if (!match) return null;
	return { stem: match[1], dateStamp: match[2] };
}

/** Today's date as `YYYY-MM-DD` for draft filenames. */
export function formatDraftDateStamp(date: Date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

/** Date+time stamp used when a same-day draft name already exists. */
export function formatDraftDateTimeStamp(date: Date = new Date()): string {
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${formatDraftDateStamp(date)}-${hours}${minutes}`;
}
