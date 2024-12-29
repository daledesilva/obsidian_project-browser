import { Editor } from "obsidian";
import { getFileState, setFileState } from "src/logic/frontmatter-processes";
import { getGlobals, getStateMenuSettings, setStateMenuSettings } from "src/logic/stores";
import { PluginStateSettings_0_1_0 } from "src/types/plugin-settings0_1_0";
import { debug } from "src/utils/log-to-console";

////////
////////

let cycleStateTimeout: NodeJS.Timeout | null = null;

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
            const origStateMenuSettings = getStateMenuSettings();
            if(!origStateMenuSettings.visible || cycleStateTimeout) {
                const newStateMenuSettings = JSON.parse(JSON.stringify(origStateMenuSettings));
                newStateMenuSettings.visible = true;
                setStateMenuSettings(newStateMenuSettings);

                if(cycleStateTimeout) clearTimeout(cycleStateTimeout);
                cycleStateTimeout = setTimeout(() => {
                    const curStateMenuSettings = getStateMenuSettings();
                    const newStateMenuSettings = JSON.parse(JSON.stringify(curStateMenuSettings));
                    newStateMenuSettings.visible = false;
                    setStateMenuSettings(newStateMenuSettings);
                }, 1000);

                const file = plugin.app.workspace.getActiveFile();
                if(!file) return;
                
                const curState = getFileState(file);
                const allStates = [...plugin.settings.states.visible, ...plugin.settings.states.hidden];
                
                let curStateIndex = -1;
                if(curState) {
                    curStateIndex = allStates.findIndex(state => state.name === curState);
                }
                const newStateIndex = (curStateIndex + 1) % allStates.length;
                const newState = allStates[newStateIndex];
                setFileState(file, newState.name);
            }
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
            const origStateMenuSettings = getStateMenuSettings();
            if(!origStateMenuSettings.visible || cycleStateTimeout) {
                const newStateMenuSettings = JSON.parse(JSON.stringify(origStateMenuSettings));
                newStateMenuSettings.visible = true;
                setStateMenuSettings(newStateMenuSettings);
                
                if(cycleStateTimeout) clearTimeout(cycleStateTimeout);
                cycleStateTimeout = setTimeout(() => {
                    const curStateMenuSettings = getStateMenuSettings();
                    const newStateMenuSettings = JSON.parse(JSON.stringify(curStateMenuSettings));
                    newStateMenuSettings.visible = false;
                    setStateMenuSettings(newStateMenuSettings);
                }, 1000);


                const file = plugin.app.workspace.getActiveFile();
                if(!file) return;
                
                const curState = getFileState(file);
                const allStates = [...plugin.settings.states.visible, ...plugin.settings.states.hidden];
                
                let curStateIndex = -1;
                if(curState) {
                    curStateIndex = allStates.findIndex(state => state.name === curState);
                }
                let newStateIndex = (curStateIndex - 1);
                if(newStateIndex < 0) newStateIndex = allStates.length - 1;
                const newState = allStates[newStateIndex];
                setFileState(file, newState.name);
            }
        }
	});
}
