import { ICON_STATE_MENU } from "src/constants";
import { getGlobals } from "src/logic/stores";
import { toggleStateMenu } from "src/logic/toggle-state-menu";

////////
////////

export async function registerToggleStateMenuCommand() {
    const {plugin} = getGlobals();

    plugin.addCommand({
		id: 'toggle-state-menu',
		name: 'Toggle state menu',
        icon: ICON_STATE_MENU,
        callback: toggleStateMenu
	});
}
