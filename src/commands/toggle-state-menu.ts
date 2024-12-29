import { getGlobals, getStateMenuSettings, setStateMenuSettings } from "src/logic/stores";
import { debug } from "src/utils/log-to-console";

////////
////////

export async function registerToggleStateMenuCommand() {
    const {plugin} = getGlobals();

    plugin.addCommand({
		id: 'toggle-state-menu',
		name: 'Toggle state menu',
        icon: 'file-check',
        hotkeys: [
            {
                modifiers: ['Shift'],
                key: 'space',
            }
        ],
        callback: () => {
            const stateMenuSettings = getStateMenuSettings();
            const newStateMenuSettings = JSON.parse(JSON.stringify(stateMenuSettings));
            newStateMenuSettings.visible = !newStateMenuSettings.visible;
            setStateMenuSettings(newStateMenuSettings);
        }
	});
}
