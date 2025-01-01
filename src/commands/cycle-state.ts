import { Editor } from "obsidian";
import { ICON_STEP_STATE_BACKWARD, ICON_STEP_STATE_FORWARD } from "src/constants";
import { setFileState } from "src/logic/frontmatter-processes";
import { offsetState } from "src/logic/offset-state";
import { getGlobals } from "src/logic/stores";
import { openStateMenuIfClosed, returnStateMenuAfterDelay } from "src/logic/toggle-state-menu";

////////
////////

export async function registerCycleStateCommands() {
    const {plugin} = getGlobals();

    plugin.addCommand({
        id: 'cycle-state-forward',
		name: `Step note's state forward`,
        icon: ICON_STEP_STATE_FORWARD,
        hotkeys: [
            {
                modifiers: ['Meta', 'Shift'],
                key: 'd',
            }
        ],
        editorCallback: (editor: Editor) => {
            const file = plugin.app.workspace.getActiveFile();
            if(!file) return;
            const wasOpen = openStateMenuIfClosed();
            const delayMs = wasOpen ? 0 : 300; // This timing should match the open time of the menu
            setTimeout(() => {
                const newStateSettings = offsetState(file, 1, plugin.settings.loopStatesWhenCycling);
                setFileState(file, newStateSettings);
            }, delayMs);
            returnStateMenuAfterDelay();
        }
	});

    plugin.addCommand({
        id: 'cycle-state-backward',
		name: `Step note's state backward`,
        icon: ICON_STEP_STATE_BACKWARD,
        hotkeys: [
            {
                modifiers: ['Meta', 'Shift'],
                key: 'a',
            }
        ],
        editorCallback: (editor: Editor) => {
            const file = plugin.app.workspace.getActiveFile();
            if(!file) return;
            const wasOpen = openStateMenuIfClosed();
            const delayMs = wasOpen ? 0 : 300; // This timing should match the open time of the menu
            setTimeout(() => {
                const newStateSettings = offsetState(file, -1, plugin.settings.loopStatesWhenCycling);
                setFileState(file, newStateSettings);
            }, delayMs);
            returnStateMenuAfterDelay();
        }
	});
}

