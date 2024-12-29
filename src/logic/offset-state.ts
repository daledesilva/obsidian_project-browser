import { TFile } from "obsidian";
import { getFileState } from "./frontmatter-processes";
import { getGlobals } from "./stores";

//////////////////
//////////////////

export function offsetState(file: TFile, offset: number, cycle: boolean = false): {name: string} {
    const {plugin} = getGlobals();
    const curState = getFileState(file);
    const allStates = [...plugin.settings.states.visible, ...plugin.settings.states.hidden];
    const curStateIndex = allStates.findIndex(state => state.name === curState);
    let newStateIndex = (curStateIndex + offset);
    if(cycle) {
        if(newStateIndex < 0) newStateIndex = allStates.length-1;
        if(newStateIndex >= allStates.length) newStateIndex = 0;
    }
    newStateIndex = Math.max(0, newStateIndex);
    newStateIndex = Math.min(allStates.length-1, newStateIndex);
    return allStates[newStateIndex];
}