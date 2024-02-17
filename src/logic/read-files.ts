import { TAbstractFile, TFile } from "obsidian";

/////////
/////////

export const fetchExcerpt = async (item: TAbstractFile) => {
    const v = item.vault;
    let excerpt;

    // TODO: Use shortSummary property if present
    // Otherwise do all below (createExcerpt)

    if(item instanceof TFile) {
        excerpt = await v.cachedRead(item);
    } else {
        excerpt = 'folder';
    }

    // TODO:
    // Remove an code blocks
    // Collapse lines


    return excerpt;
}