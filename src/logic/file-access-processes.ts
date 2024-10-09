import { TFile } from "obsidian";
import { getGlobals } from "./stores";

///////////
///////////

export function openFileInSameLeaf(file: TFile) {
    const {plugin} = getGlobals();
    let { workspace } = plugin.app;
    let leaf = workspace.getMostRecentLeaf();

    if(!leaf) {
        leaf = workspace.getLeaf();
    }

    leaf.openFile(file);
}

export async function openFileInBackgroundTab(file: TFile) {
    const {plugin} = getGlobals();
    let { workspace } = plugin.app;
    let curLeaf = workspace.getMostRecentLeaf();
    let newLeaf = workspace.getLeaf(true);

    // Open new tab
    await newLeaf.openFile(file);

    // switch immediately back to previous tab
    if(curLeaf) workspace.setActiveLeaf(curLeaf);
}