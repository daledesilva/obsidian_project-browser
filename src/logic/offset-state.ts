import { TFile } from "obsidian";
import { getFileStateSettings } from "./frontmatter-processes";
import { getGlobals } from "./stores";
import { PluginStateSettings_0_1_0 } from "src/types/plugin-settings0_1_0";

//////////////////
//////////////////

export function offsetState(file: TFile, offset: number, cycle: boolean = false): PluginStateSettings_0_1_0 {
    const {plugin} = getGlobals();
    const curStateSettings = getFileStateSettings(file);
    const allStateSettings = [...plugin.settings.states.visible, ...plugin.settings.states.hidden];
    const curStateIndex = allStateSettings.findIndex(state => state.name === curStateSettings?.name);
    let newStateIndex = (curStateIndex + offset);
    if(cycle) {
        if(newStateIndex < 0) newStateIndex = allStateSettings.length-1;
        if(newStateIndex >= allStateSettings.length) newStateIndex = 0;
    }
    newStateIndex = Math.max(0, newStateIndex);
    newStateIndex = Math.min(allStateSettings.length-1, newStateIndex);
    return allStateSettings[newStateIndex];
}