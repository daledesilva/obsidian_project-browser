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
export const DRAFT_USER_IGNORE_FILTER = '/\\[DRAFT\\]/';
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

const DRAFT_BASENAME_PATTERN =
	/^(.+) - (\d{4}\.\d{1,2}\.\d{1,2} - \d{1,2}\.\d{2}(?:am|pm)(?: \(\d+\))?) \[DRAFT\]$/i;

/** Parses a versioned draft basename back into its live-page stem and date/time stamp. */
export function parseDraftBasename(basename: string): { stem: string; dateStamp: string } | null {
	const match = basename.match(DRAFT_BASENAME_PATTERN);
	if (!match) return null;
	return { stem: match[1], dateStamp: match[2] };
}

/**
 * Formats a draft date/time stamp using the designdebt.club filename convention.
 * @see https://designdebt.club/the-typography-of-dates-times-filenames/
 */
export function formatDesignDebtDraftDateTimeStamp(date: Date = new Date(), sequence = 1): string {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const hours = date.getHours();
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const ampm = hours < 12 ? 'am' : 'pm';
	const baseStamp = `${year}.${month}.${day} - ${hours}.${minutes}${ampm}`;
	return sequence > 1 ? `${baseStamp} (${sequence})` : baseStamp;
}

/** Sort key for draft rows (newest first). */
export function getDraftChronologicalSortKey(dateStamp: string): string {
	const parsedDate = parseDraftDateStampToDate(dateStamp);
	if (!parsedDate) return dateStamp;
	const sequenceMatch = dateStamp.match(/ \((\d+)\)$/);
	const sequence = sequenceMatch ? Number.parseInt(sequenceMatch[1], 10) : 1;
	return `${String(parsedDate.getTime()).padStart(15, '0')}-${String(sequence).padStart(4, '0')}`;
}

function parseDraftDateStampToDate(dateStamp: string): Date | null {
	const match = dateStamp.match(
		/^(\d{4})\.(\d{1,2})\.(\d{1,2}) - (\d{1,2})\.(\d{2})(am|pm)(?: \((\d+)\))?$/i,
	);
	if (!match) return null;

	const year = Number.parseInt(match[1], 10);
	const month = Number.parseInt(match[2], 10) - 1;
	const day = Number.parseInt(match[3], 10);
	const hours = Number.parseInt(match[4], 10);
	const minutes = Number.parseInt(match[5], 10);

	return new Date(year, month, day, hours, minutes);
}
