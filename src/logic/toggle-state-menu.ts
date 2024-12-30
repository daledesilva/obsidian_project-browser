import { getGlobals, getStateMenuSettings, setStateMenuSettings } from "./stores";

//////////////////
//////////////////

export function toggleStateMenu() {
    const {plugin} = getGlobals();
    const stateMenuSettings = getStateMenuSettings();
    const newStateMenuSettings = JSON.parse(JSON.stringify(stateMenuSettings));
    newStateMenuSettings.visible = !newStateMenuSettings.visible;
    setStateMenuSettings(newStateMenuSettings);
    
    plugin.settings.showStateMenu = newStateMenuSettings.visible;
    plugin.saveSettings();
}

//////////////////

let cycleStateTimeout: NodeJS.Timeout | null = null;
let openedByFunction = false;

export function openStateMenuIfClosed() {
    const curStateMenuSettings = getStateMenuSettings();
    if(curStateMenuSettings.visible) return;
    const newStateMenuSettings = JSON.parse(JSON.stringify(curStateMenuSettings));
    newStateMenuSettings.visible = true;
    setStateMenuSettings(newStateMenuSettings);
    openedByFunction = true;
}

export function returnStateMenuAfterDelay() {
    if(cycleStateTimeout) clearTimeout(cycleStateTimeout);
    cycleStateTimeout = setTimeout(() => {
        if(!openedByFunction) return;
        openedByFunction = false;
        const curStateMenuSettings = getStateMenuSettings();
        const newStateMenuSettings = JSON.parse(JSON.stringify(curStateMenuSettings));
        newStateMenuSettings.visible = false;
        setStateMenuSettings(newStateMenuSettings);
    }, 1000);
}

