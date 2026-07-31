import { TFile, TFolder } from 'obsidian';
import { StateSettings } from 'src/types/types-map';
import { renameTFile, renameTFolder } from 'src/utils/file-manipulation';
import {
	basenameHasHiddenSuffix,
	basenameWithHiddenSuffix,
	stripSearchGraphFilenameSuffixes,
} from './filename-suffixes';

//////////////////
//////////////////

/**
 * Renames a file so its basename includes or omits `[HIDDEN]`, matching whether it should
 * be excluded from Obsidian search/graph via the shared `/\[HIDDEN\]/` ignore filter.
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

/**
 * Renames a folder so its name includes or omits `[HIDDEN]`. Descendant paths then contain
 * the marker and match the shared ignore filter (md/canvas/base/etc. under that folder).
 */
export async function syncFolderHiddenFilenameSuffix(folder: TFolder, shouldHide: boolean): Promise<void> {
	const currentlyHidden = basenameHasHiddenSuffix(folder.name);
	if (shouldHide === currentlyHidden) {
		return;
	}

	const targetName = shouldHide
		? basenameWithHiddenSuffix(folder.name)
		: stripSearchGraphFilenameSuffixes(folder.name);

	if (targetName === folder.name) {
		return;
	}

	await renameTFolder(folder, targetName);
}

/** Applies `[HIDDEN]` when the chosen state opts into search/graph hiding; clears it otherwise. */
export async function syncFileHiddenFilenameForState(
	file: TFile,
	appliedState: StateSettings | null,
): Promise<void> {
	const shouldHide = Boolean(appliedState?.hideFromSearchGraph);
	await syncFileHiddenFilenameSuffix(file, shouldHide);
}

/** Same as file state sync, for project/folder state menus that share hideFromSearchGraph. */
export async function syncFolderHiddenFilenameForState(
	folder: TFolder,
	appliedState: StateSettings | null,
): Promise<void> {
	const shouldHide = Boolean(appliedState?.hideFromSearchGraph);
	await syncFolderHiddenFilenameSuffix(folder, shouldHide);
}

/** Manual hide/show from the file context menu. */
export async function setFileHiddenFromSearchGraph(file: TFile, shouldHide: boolean): Promise<void> {
	await syncFileHiddenFilenameSuffix(file, shouldHide);
}

/** Manual hide/show from folder/project context menus. */
export async function setFolderHiddenFromSearchGraph(folder: TFolder, shouldHide: boolean): Promise<void> {
	await syncFolderHiddenFilenameSuffix(folder, shouldHide);
}
