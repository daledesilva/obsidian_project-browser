import { TFile } from 'obsidian';
import { StateSettings } from 'src/types/types-map';
import { renameTFile } from 'src/utils/file-manipulation';
import {
	basenameHasHiddenSuffix,
	basenameWithHiddenSuffix,
	stripSearchGraphFilenameSuffixes,
} from './filename-suffixes';

//////////////////
//////////////////

/**
 * Renames a file so its basename includes or omits `[HIDDEN]`, matching whether it should
 * be excluded from Obsidian search/graph via the shared `[HIDDEN].md` ignore filter.
 */
export async function syncFileHiddenFilenameSuffix(file: TFile, shouldHide: boolean): Promise<void> {
	const currentlyHidden = basenameHasHiddenSuffix(file.basename);
	if (shouldHide === currentlyHidden) {
		return;
	}

	const targetBasename = shouldHide
		? basenameWithHiddenSuffix(file.basename)
		: stripSearchGraphFilenameSuffixes(file.basename);

	if (targetBasename === file.basename) {
		return;
	}

	await renameTFile(file, targetBasename);
}

/** Applies `[HIDDEN]` when the chosen state opts into search/graph hiding; clears it otherwise. */
export async function syncFileHiddenFilenameForState(
	file: TFile,
	appliedState: StateSettings | null,
): Promise<void> {
	const shouldHide = Boolean(appliedState?.hideFromSearchGraph);
	await syncFileHiddenFilenameSuffix(file, shouldHide);
}

/** Manual hide/show from the file context menu. */
export async function setFileHiddenFromSearchGraph(file: TFile, shouldHide: boolean): Promise<void> {
	await syncFileHiddenFilenameSuffix(file, shouldHide);
}
