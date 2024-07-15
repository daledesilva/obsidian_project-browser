import { FrontMatterCache, TFile } from "obsidian";
import ProjectBrowserPlugin from "src/main";

////////////
////////////

export const getFileFrontmatter = (plugin: null | ProjectBrowserPlugin, file: TFile): {} | FrontMatterCache => {
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

export const setFileFrontmatter = (plugin: ProjectBrowserPlugin, file: TFile, newFrontmatter: FrontMatterCache) => {
    plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
        frontmatter = newFrontmatter;
    });
}

export const getFileState = (plugin: ProjectBrowserPlugin, file: TFile): null | string => {
    const frontmatter = getFileFrontmatter(plugin,file);
    if(!frontmatter) return null;

    const state = frontmatter['state'];
    return state;
}

export const setFileState = (plugin: ProjectBrowserPlugin, file: TFile, state: null | string) => {
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