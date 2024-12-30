import { Editor } from "obsidian";
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
		name: `Cycle document's state forward`,
        icon: 'file-input',
        hotkeys: [
            {
                modifiers: ['Meta', 'Shift'],
                key: 'd',
            }
        ],
        editorCallback: (editor: Editor) => {
            const file = plugin.app.workspace.getActiveFile();
            if(!file) return;
            openStateMenuIfClosed();
            const newStateSettings = offsetState(file, 1, plugin.settings.loopStatesWhenCycling);
            setFileState(file, newStateSettings);
            returnStateMenuAfterDelay();
        }
	});

    plugin.addCommand({
        id: 'cycle-state-backward',
		name: `Cycle document's state backward`,
        icon: 'file-output',
        hotkeys: [
            {
                modifiers: ['Meta', 'Shift'],
                key: 'a',
            }
        ],
        editorCallback: (editor: Editor) => {
            const file = plugin.app.workspace.getActiveFile();
            if(!file) return;
            openStateMenuIfClosed();
            const newStateSettings = offsetState(file, -1, plugin.settings.loopStatesWhenCycling);
            setFileState(file, newStateSettings);
            returnStateMenuAfterDelay();
        }
	});
}

