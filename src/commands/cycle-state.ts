import { Editor } from "obsidian";
import { ICON_STEP_STATE_BACKWARD, ICON_STEP_STATE_FORWARD } from "src/constants";
import { setFileState } from "src/logic/frontmatter-processes";
import { offsetState } from "src/logic/offset-state";
import { getStateSettingsForFile } from "src/logic/project-page-states";
import { getGlobals } from "src/logic/stores";
import { getStateMenuSurfaceForFile, openStateMenuIfClosed, returnStateMenuAfterDelay } from "src/logic/toggle-state-menu";

////////
////////

export async function registerCycleStateCommands() {
    const {plugin} = getGlobals();

    plugin.addCommand({
        id: 'cycle-state-forward',
		name: `Step note's state forward`,
        icon: ICON_STEP_STATE_FORWARD,
        editorCallback: (editor: Editor) => {
            const file = plugin.app.workspace.getActiveFile();
            if(!file) return;
            void cycleFileStateWithMenu(file, 1);
        }
	});

    plugin.addCommand({
        id: 'cycle-state-backward',
		name: `Step note's state backward`,
        icon: ICON_STEP_STATE_BACKWARD,
        editorCallback: (editor: Editor) => {
            const file = plugin.app.workspace.getActiveFile();
            if(!file) return;
            void cycleFileStateWithMenu(file, -1);
        }
	});

    async function cycleFileStateWithMenu(file: import("obsidian").TFile, offset: number) {
        const surface = await getStateMenuSurfaceForFile(file);
        const wasOpen = openStateMenuIfClosed(surface);
        const delayMs = wasOpen ? 0 : 300; // This timing should match the open time of the menu
        window.setTimeout(() => {
            void cycleFileState(file, offset);
        }, delayMs);
        returnStateMenuAfterDelay(surface);
    }

    async function cycleFileState(file: import("obsidian").TFile, offset: number) {
        const scopedSettings = await getStateSettingsForFile(file);
        const newStateSettings = await offsetState(file, offset, scopedSettings.shouldLoopWhenCycling);
        await setFileState(file, newStateSettings);
    }
}

