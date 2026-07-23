import { TFile, TFolder } from "obsidian";
import { ICON_STEP_STATE_BACKWARD, ICON_STEP_STATE_FORWARD } from "src/constants";
import { setFileState } from "src/logic/frontmatter-processes";
import { offsetFolderState, offsetState } from "src/logic/offset-state";
import { getStandardNoteStateSettings, getStateSettingsForFile } from "src/logic/project-page-states";
import { getGlobals, StateMenuSurface } from "src/logic/stores";
import { getStateMenuSurfaceForFile, openStateMenuIfClosed, returnStateMenuAfterDelay } from "src/logic/toggle-state-menu";
import { getFolderSettings, setFolderState } from "src/utils/file-manipulation";
import { CARD_BROWSER_VIEW_TYPE } from "src/views/card-browser-view/card-browser-view-constants";

////////
////////

type CycleStateTarget =
    | { kind: 'file'; file: TFile }
    | { kind: 'folder'; folder: TFolder };

export async function registerCycleStateCommands() {
    const {plugin} = getGlobals();

    plugin.addCommand({
        id: 'cycle-state-forward',
		// Generic name: scope (note vs project page vs project root) is resolved at runtime.
		name: 'Apply next state',
        icon: ICON_STEP_STATE_FORWARD,
        // callback (not editorCallback): project-root browse views have no editor, so hotkeys must still fire there.
        callback: () => {
            void cycleActiveTargetState(1);
        }
	});

    plugin.addCommand({
        id: 'cycle-state-backward',
		// Generic name: scope (note vs project page vs project root) is resolved at runtime.
		name: 'Apply previous state',
        icon: ICON_STEP_STATE_BACKWARD,
        callback: () => {
            void cycleActiveTargetState(-1);
        }
	});

    async function cycleActiveTargetState(offset: number) {
        const target = await resolveCycleStateTarget();
        if (!target) return;

        if (target.kind === 'folder') {
            await cycleFolderStateWithMenu(target.folder, offset);
            return;
        }

        await cycleFileStateWithMenu(target.file, offset);
    }

    async function resolveCycleStateTarget(): Promise<CycleStateTarget | null> {
        // Prefer the focused browse view so a leftover active file from another leaf
        // does not steal project-root state cycling.
        const activeLeaf = plugin.app.workspace.activeLeaf;
        if (activeLeaf?.view.getViewType() === CARD_BROWSER_VIEW_TYPE) {
            const viewState = activeLeaf.view.getState() as { path?: string };
            const folderPath = viewState.path ?? '';
            const folder = plugin.app.vault.getFolderByPath(folderPath) ?? plugin.app.vault.getRoot();
            const folderSettings = await getFolderSettings(plugin.app.vault, folder);
            if (folderSettings.isProject === true) {
                return { kind: 'folder', folder };
            }
            return null;
        }

        const file = plugin.app.workspace.getActiveFile();
        if (!file) return null;
        return { kind: 'file', file };
    }

    async function cycleFileStateWithMenu(file: TFile, offset: number) {
        const surface = await getStateMenuSurfaceForFile(file);
        const wasOpen = openStateMenuIfClosed(surface);
        const delayMs = wasOpen ? 0 : 300; // This timing should match the open time of the menu
        window.setTimeout(() => {
            void cycleFileState(file, offset);
        }, delayMs);
        returnStateMenuAfterDelay(surface);
    }

    async function cycleFolderStateWithMenu(folder: TFolder, offset: number) {
        const surface: StateMenuSurface = 'noteAndProject';
        const wasOpen = openStateMenuIfClosed(surface);
        const delayMs = wasOpen ? 0 : 300;
        window.setTimeout(() => {
            void cycleFolderState(folder, offset);
        }, delayMs);
        returnStateMenuAfterDelay(surface);
    }

    async function cycleFileState(file: TFile, offset: number) {
        const scopedSettings = await getStateSettingsForFile(file);
        const newStateSettings = await offsetState(file, offset, scopedSettings.shouldLoopWhenCycling);
        await setFileState(file, newStateSettings);
    }

    async function cycleFolderState(folder: TFolder, offset: number) {
        const scopedSettings = getStandardNoteStateSettings();
        const newStateSettings = await offsetFolderState(folder, offset, scopedSettings.shouldLoopWhenCycling);
        await setFolderState(folder, newStateSettings);
    }
}
