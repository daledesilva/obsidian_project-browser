import { TFile, TFolder } from 'obsidian';
import { getSortedPageMenuFilesInProjectFolder } from './project-page-list';
import {
	basenameHasDraftSuffix,
	getDraftChronologicalSortKey,
	parseDraftBasename,
	stripSearchGraphFilenameSuffixes,
} from './filename-suffixes';
import { compareItemNamesNaturally } from 'src/utils/sorting';

//////////////////
//////////////////

export interface ProjectPageMenuGroup {
	/** Live (non-draft) page, when one still exists under this stem. */
	liveFile: TFile | null;
	/** Stem used to match drafts to a live page. */
	stem: string;
	/** Prior versions, newest first. */
	drafts: TFile[];
}

function draftSortKey(file: TFile): string {
	const parsed = parseDraftBasename(file.basename);
	return parsed ? getDraftChronologicalSortKey(parsed.dateStamp) : file.basename;
}

/**
 * Groups page-menu files so drafts nest under their live page instead of appearing as siblings.
 * Orphan drafts (no live sibling) still get a group keyed by their stem.
 */
export function getGroupedPageMenuFilesInProjectFolder(folder: TFolder): ProjectPageMenuGroup[] {
	const files = getSortedPageMenuFilesInProjectFolder(folder);
	const liveByStem = new Map<string, TFile>();
	const draftsByStem = new Map<string, TFile[]>();

	for (const file of files) {
		if (basenameHasDraftSuffix(file.basename)) {
			const parsed = parseDraftBasename(file.basename);
			const stem = parsed?.stem ?? stripSearchGraphFilenameSuffixes(file.basename);
			const list = draftsByStem.get(stem) ?? [];
			list.push(file);
			draftsByStem.set(stem, list);
			continue;
		}
		const stem = stripSearchGraphFilenameSuffixes(file.basename);
		liveByStem.set(stem, file);
	}

	const stems = new Set<string>([...liveByStem.keys(), ...draftsByStem.keys()]);
	const groups: ProjectPageMenuGroup[] = [];

	for (const stem of stems) {
		const drafts = (draftsByStem.get(stem) ?? []).slice().sort((a, b) => {
			// Reverse chronological by embedded date stamp, then natural name.
			const keyCompare = draftSortKey(b).localeCompare(draftSortKey(a));
			if (keyCompare !== 0) return keyCompare;
			return compareItemNamesNaturally(a, b);
		});
		groups.push({
			stem,
			liveFile: liveByStem.get(stem) ?? null,
			drafts,
		});
	}

	groups.sort((a, b) => {
		const aFile = a.liveFile ?? a.drafts[0];
		const bFile = b.liveFile ?? b.drafts[0];
		if (!aFile || !bFile) return 0;
		return compareItemNamesNaturally(aFile, bFile);
	});

	return groups;
}
