import { TFile } from "obsidian";
import { StateSettings } from "src/types/types-map";
import { getFileStateScope, getStateByNameForScope } from "./project-page-states";

//////////////////
//////////////////

export function getStateByName(stateName: string): StateSettings | null {
    return getStateByNameForScope(stateName, 'standardNote');
}

export function getProjectPageStateByName(stateName: string): StateSettings | null {
    return getStateByNameForScope(stateName, 'projectPage');
}

export async function getStateByNameForFile(file: TFile, stateName: string): Promise<StateSettings | null> {
    const scope = await getFileStateScope(file);
    return getStateByNameForScope(stateName, scope);
}
