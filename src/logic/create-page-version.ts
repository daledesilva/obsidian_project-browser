import { TFile } from 'obsidian';
import {
	basenameHasDraftSuffix,
	basenameWithDraftSuffix,
	formatDraftDateStamp,
	formatDraftDateTimeStamp,
	stripSearchGraphFilenameSuffixes,
} from './filename-suffixes';
import { renameTFile } from 'src/utils/file-manipulation';
import { parseFilepath } from 'src/utils/string-processes';

//////////////////
//////////////////

/**
 * Snapshots the current page as a `[DRAFT]` by renaming it (keeps created/modified times on the
 * historical file), then creates a fresh copy under the original name as the new live page.
 */
export async function createPageVersion(file: TFile): Promise<TFile | null> {
	if (basenameHasDraftSuffix(file.basename)) {
		return null;
	}

	const vault = file.vault;
	const content = await vault.read(file);
	const liveStem = stripSearchGraphFilenameSuffixes(file.basename);
	const { folderpath } = parseFilepath(file.path);
	const extension = file.extension || 'md';
	const originalPath = file.path;

	let dateStamp = formatDraftDateStamp();
	let draftBasename = basenameWithDraftSuffix(liveStem, dateStamp);
	let draftPath = folderpath ? `${folderpath}/${draftBasename}.${extension}` : `${draftBasename}.${extension}`;

	// Same-day re-version: bump to a time-stamped draft name instead of colliding.
	if (vault.getAbstractFileByPath(draftPath)) {
		dateStamp = formatDraftDateTimeStamp();
		draftBasename = basenameWithDraftSuffix(liveStem, dateStamp);
		draftPath = folderpath ? `${folderpath}/${draftBasename}.${extension}` : `${draftBasename}.${extension}`;
	}

	const renamedPath = await renameTFile(file, draftBasename);
	if (!renamedPath) {
		return null;
	}

	const liveFile = await vault.create(originalPath, content);
	return liveFile instanceof TFile ? liveFile : null;
}
