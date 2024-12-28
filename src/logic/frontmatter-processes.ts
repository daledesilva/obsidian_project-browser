import { FrontMatterCache, TFile } from "obsidian";
import { getGlobals } from "./stores";

////////////
////////////

export const getFileFrontmatter = (file: TFile): {} | FrontMatterCache => {
    const {plugin} = getGlobals();
    let frontmatter: {} | FrontMatterCache = {};
    
    let metadataCache;
    if(plugin.app.metadataCache) metadataCache = plugin.app.metadataCache;
    
    let fileCache;
    if(metadataCache) fileCache = metadataCache.getFileCache(file);

    if(fileCache) {
        let tempFrontmatter = fileCache.frontmatter;
        if(tempFrontmatter) {
            frontmatter = tempFrontmatter;
        } else {
            frontmatter = {};
        }
    }

    return frontmatter;
}

export const setFileFrontmatter = (file: TFile, newFrontmatter: FrontMatterCache) => {
    const {plugin} = getGlobals();
    plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
        frontmatter = newFrontmatter;
    });
}

export const getFileState = (file: TFile): null | string => {
    const {plugin} = getGlobals();
    const frontmatter = getFileFrontmatter(file);
    if(!frontmatter) return null;

    if((frontmatter as FrontMatterCache).state) {
        const state = (frontmatter as FrontMatterCache).state;
        return state;
    }
    return null;
}

export const setFileState = (file: TFile, state: null | string) => {
    const {plugin} = getGlobals();
    plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
        if(state) {
            frontmatter['state'] = state;
        } else {
            frontmatter['state'] = undefined;
            // delete frontmatter['state']; // This doesn't work
        }
    });
    plugin.refreshFileDependants();
}