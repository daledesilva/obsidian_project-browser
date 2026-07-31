import { TFile } from 'obsidian';
import {
	basenameHasDraftSuffix,
	basenameWithDraftSuffix,
	formatDesignDebtDraftDateTimeStamp,
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
	const versionedAt = new Date();

	let sequence = 1;
	let dateStamp = formatDesignDebtDraftDateTimeStamp(versionedAt, sequence);
	let draftBasename = basenameWithDraftSuffix(liveStem, dateStamp);
	let draftPath = folderpath ? `${folderpath}/${draftBasename}.${extension}` : `${draftBasename}.${extension}`;

	// Same-minute re-version: append (2), (3), … per designdebt.club instead of using seconds.
	while (vault.getAbstractFileByPath(draftPath)) {
		sequence += 1;
		dateStamp = formatDesignDebtDraftDateTimeStamp(versionedAt, sequence);
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
