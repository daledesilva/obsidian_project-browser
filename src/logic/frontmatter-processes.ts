import { FrontMatterCache, TFile } from "obsidian";
import ProjectCardsPlugin from "src/main";

////////////
////////////

export const getFileFrontmatter = (plugin: null | ProjectCardsPlugin, file: TFile): {} | FrontMatterCache => {
    if(!plugin) {
        console.log('getFrontmatter returned no frontmatter because plugin was undefined or null.')
        return {};
    }
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

export const setFileFrontmatter = (plugin: ProjectCardsPlugin, file: TFile, newFrontmatter: FrontMatterCache) => {
    plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
        frontmatter = newFrontmatter;
    });
}

export const getFileState = (plugin: ProjectCardsPlugin, file: TFile): null | string => {
    const frontmatter = getFileFrontmatter(plugin,file);
    if(!frontmatter) return null;

    const state = frontmatter['state'];
    return state;
}

export const setFileState = (plugin: ProjectCardsPlugin, file: TFile, state: null | string) => {
    plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
        if(state) {
            frontmatter['state'] = state;
        } else {
            frontmatter['state'] = undefined;
            // delete frontmatter['state']; // This doesn't work
        }
    });
}