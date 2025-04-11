import { FrontMatterCache, TFile } from "obsidian";
import { getGlobals } from "./stores";
import { error } from "src/utils/log-to-console";
import { getStateByName } from "./get-state-by-name";
import { PrioritySettings, StateSettings } from "src/types/types-map";
import { getPriorityByName } from "./get-priority-by-name";

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

export const getFileStateSettings = (file: TFile): null | StateSettings => {
    const frontmatter = getFileFrontmatter(file);
    if(!frontmatter) return null;

    if((frontmatter as FrontMatterCache).state) {
        const stateName = (frontmatter as FrontMatterCache).state;
        if(stateName) {
            return getStateByName(stateName);
        } else {
            return null;
        }
    }
    return null;
}

export const getFilePrioritySettings = (file: TFile): null | PrioritySettings => {
    const frontmatter = getFileFrontmatter(file);
    if(!frontmatter) return null;

    if((frontmatter as FrontMatterCache).priority) {
        const priorityName = (frontmatter as FrontMatterCache).priority;
        if(priorityName) {
            return getPriorityByName(priorityName);
        } else {
            return null;
        }
    }
    return null;
}

export const getFileStateName = (file: TFile): null | string => {
    const stateSettings = getFileStateSettings(file);
    if(!stateSettings) return null;
    return stateSettings.name;
}

export const setFileState = async (file: TFile, stateSettings: null | StateSettings): Promise<boolean> => {
    try {
        const {plugin} = getGlobals();
        await plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
            if(stateSettings) {
                if(stateSettings.link) {
                    frontmatter['state'] = `[[${stateSettings.name}]]`;
                } else {
                    frontmatter['state'] = stateSettings.name;
                }
            } else {
                frontmatter['state'] = undefined;
                // NOTE: delete frontmatter['state']; // This doesn't work
            }
        });
        plugin.refreshFileDependants();
        return true;
    } catch(e) {
        error(e);
        return false;
    }
}

export const setFilePriority = async (file: TFile, prioritySettings: null | PrioritySettings): Promise<boolean> => {
    try {
        const {plugin} = getGlobals();
        await plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
            if(prioritySettings && prioritySettings.name !== 'Medium') {
                if(prioritySettings.link) {
                    frontmatter['priority'] = `[[${prioritySettings.name}]]`;
                } else {
                    frontmatter['priority'] = prioritySettings.name;
                }
            } else {
                frontmatter['priority'] = undefined;
                // NOTE: delete frontmatter['priority']; // This doesn't work
            }
        });
        plugin.refreshFileDependants();
        return true;
    } catch(e) {
        error(e);
        return false;
    }
}

export const getFileAliases = (file: TFile): null | string => {
    const frontmatter = getFileFrontmatter(file);
    if(!frontmatter) return null;

    if((frontmatter as FrontMatterCache).aliases) {
        const aliases = (frontmatter as FrontMatterCache).aliases;
        return aliases;
    }
    return null;
}