import { TFile, TFolder } from 'obsidian';
import { StateSettings } from 'src/types/types-map';
import { renameTFile, renameTFolder } from 'src/utils/file-manipulation';
import {
	basenameHasHiddenSuffix,
	basenameHasStateHideSuffix,
	basenameWithHiddenSuffix,
	basenameWithStateHideSuffix,
	basenameWithoutHiddenSuffix,
	basenameWithoutStateHideSuffix,
} from './filename-suffixes';
import { getStateByName, getStateByNameForFile } from './get-state-by-name';

//////////////////
//////////////////

/** Reads hideFromSearchGraph from live plugin settings so menu copies cannot drop the flag. */
async function resolveFileStateHideFromSearchGraph(
	file: TFile,
	appliedState: StateSettings | null,
): Promise<boolean> {
	if (!appliedState) {
		return false;
	}
	const resolved = await getStateByNameForFile(file, appliedState.name);
	return Boolean(resolved?.hideFromSearchGraph ?? appliedState.hideFromSearchGraph);
}

/** Project folders use note/project states (not page states). */
function resolveFolderStateHideFromSearchGraph(appliedState: StateSettings | null): boolean {
	if (!appliedState) {
		return false;
	}
	const resolved = getStateByName(appliedState.name);
	return Boolean(resolved?.hideFromSearchGraph ?? appliedState.hideFromSearchGraph);
}

/**
 * Renames a file so its basename includes or omits manual `[HIDDEN]`, without touching
 * state-driven `[STATE-HIDE]`.
 */
export async function syncFileManualHiddenFilenameSuffix(file: TFile, shouldHide: boolean): Promise<void> {
	const currentlyHidden = basenameHasHiddenSuffix(file.basename);
	if (shouldHide === currentlyHidden) {
		return;
	}

	const targetBasename = shouldHide
		? basenameWithHiddenSuffix(file.basename)
		: basenameWithoutHiddenSuffix(file.basename);

	if (targetBasename === file.basename) {
		return;
	}

	await renameTFile(file, targetBasename);
}

/**
 * Renames a folder so its name includes or omits manual `[HIDDEN]`, without touching
 * state-driven `[STATE-HIDE]`.
 */
export async function syncFolderManualHiddenFilenameSuffix(folder: TFolder, shouldHide: boolean): Promise<void> {
	const currentlyHidden = basenameHasHiddenSuffix(folder.name);
	if (shouldHide === currentlyHidden) {
		return;
	}

	const targetName = shouldHide
		? basenameWithHiddenSuffix(folder.name)
		: basenameWithoutHiddenSuffix(folder.name);

	if (targetName === folder.name) {
		return;
	}

	await renameTFolder(folder, targetName);
}

/**
 * Renames a file so its basename includes or omits state `[STATE-HIDE]`, without touching
 * manual `[HIDDEN]`.
 */
export async function syncFileStateHideFilenameSuffix(file: TFile, shouldHide: boolean): Promise<void> {
	const currentlyStateHidden = basenameHasStateHideSuffix(file.basename);
	if (shouldHide === currentlyStateHidden) {
		return;
	}

	const targetBasename = shouldHide
		? basenameWithStateHideSuffix(file.basename)
		: basenameWithoutStateHideSuffix(file.basename);

	if (targetBasename === file.basename) {
		return;
	}

	await renameTFile(file, targetBasename);
}

/**
 * Renames a folder so its name includes or omits state `[STATE-HIDE]`, without touching
 * manual `[HIDDEN]`.
 */
export async function syncFolderStateHideFilenameSuffix(folder: TFolder, shouldHide: boolean): Promise<void> {
	const currentlyStateHidden = basenameHasStateHideSuffix(folder.name);
	if (shouldHide === currentlyStateHidden) {
		return;
	}

	const targetName = shouldHide
		? basenameWithStateHideSuffix(folder.name)
		: basenameWithoutStateHideSuffix(folder.name);

	if (targetName === folder.name) {
		return;
	}

	await renameTFolder(folder, targetName);
}

/** Applies `[STATE-HIDE]` when the chosen state opts into search/graph hiding; clears it otherwise. */
export async function syncFileHiddenFilenameForState(
	file: TFile,
	appliedState: StateSettings | null,
): Promise<void> {
	const shouldHide = await resolveFileStateHideFromSearchGraph(file, appliedState);
	await syncFileStateHideFilenameSuffix(file, shouldHide);
}

/** Same as file state sync, for project/folder state menus that share hideFromSearchGraph. */
export async function syncFolderHiddenFilenameForState(
	folder: TFolder,
	appliedState: StateSettings | null,
): Promise<void> {
	const shouldHide = resolveFolderStateHideFromSearchGraph(appliedState);
	await syncFolderStateHideFilenameSuffix(folder, shouldHide);
}

/** Manual hide/show from the file context menu. */
export async function setFileHiddenFromSearchGraph(file: TFile, shouldHide: boolean): Promise<void> {
	await syncFileManualHiddenFilenameSuffix(file, shouldHide);
}

/** Manual hide/show from folder/project context menus. */
export async function setFolderHiddenFromSearchGraph(folder: TFolder, shouldHide: boolean): Promise<void> {
	await syncFolderManualHiddenFilenameSuffix(folder, shouldHide);
}
