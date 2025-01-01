import { ICON_STATE_MENU } from "src/constants";
import { getGlobals, getStateMenuSettings, setStateMenuSettings } from "src/logic/stores";
import { toggleStateMenu } from "src/logic/toggle-state-menu";
import { debug } from "src/utils/log-to-console";

////////
////////

export async function registerToggleStateMenuCommand() {
    const {plugin} = getGlobals();

    plugin.addCommand({
		id: 'toggle-state-menu',
		name: 'Toggle state menu',
        icon: ICON_STATE_MENU,
        hotkeys: [
            {
                modifiers: ['Meta', 'Shift'],
                key: 's',
            }
        ],
        callback: toggleStateMenu
	});
}
