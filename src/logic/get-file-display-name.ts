import { TFile } from "obsidian";
import { getFileAliases } from "./frontmatter-processes";
import { getGlobals } from "./stores";

//////////////////
//////////////////

export const getFileDisplayName = (file: TFile): string => {
    const {plugin} = getGlobals();
    const aliases = getFileAliases(file);
    if(plugin.settings.useAliases && aliases) {
        return aliases[0];
    } else {
        return file.basename;
    }
}