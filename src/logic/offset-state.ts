import { TFile } from "obsidian";
import { getFileRawState } from "./frontmatter-processes";
import { getGlobals } from "./stores";

//////////////////
//////////////////

export function offsetState(file: TFile, offset: number, cycle: boolean = false): {name: string} {
    const {plugin} = getGlobals();
    const curRawState = getFileRawState(file);
    const allRawStates = [...plugin.settings.states.visible, ...plugin.settings.states.hidden];
    const curRawStateIndex = allRawStates.findIndex(state => state.name === curRawState);
    let newRawStateIndex = (curRawStateIndex + offset);
    if(cycle) {
        if(newRawStateIndex < 0) newRawStateIndex = allRawStates.length-1;
        if(newRawStateIndex >= allRawStates.length) newRawStateIndex = 0;
    }
    newRawStateIndex = Math.max(0, newRawStateIndex);
    newRawStateIndex = Math.min(allRawStates.length-1, newRawStateIndex);
    return allRawStates[newRawStateIndex];
}