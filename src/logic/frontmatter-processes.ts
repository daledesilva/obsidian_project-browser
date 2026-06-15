import { FrontMatterCache, TFile } from "obsidian";
import { getGlobals } from "./stores";
import { error } from "src/utils/log-to-console";
import { getStateByName } from "./get-state-by-name";
import { PrioritySettings, StateSettings } from "src/types/types-map";
import { getPriorityByName } from "./get-priority-by-name";
import { getStateByNameForFile } from "./get-state-by-name";

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

/**
 * Wrapper for processFrontMatter that preserves the file's modified timestamp
 */
export const processFrontMatterPreserveTimestamp = async (file: TFile, processor: (frontmatter: unknown) => void): Promise<void> => {
    const {plugin} = getGlobals();
    
    // Capture the current modified time
    const origMtime = file.stat.mtime;
    
    // Process the frontmatter (this will update the modified time)
    await plugin.app.fileManager.processFrontMatter(file, processor);
    
    // Restore the original modified time
    // Get a new cache because the file's been modified recently and we have an old reference
    const fileCache = plugin.app.vault.getAbstractFileByPath(file.path);
    const content = await plugin.app.vault.read(fileCache);
    await plugin.app.vault.modify(fileCache, content, {
        mtime: origMtime,
    });
}

/**
 * Wrapper for processFrontMatter that allows the modified timestamp to be updated
 */
export const processFrontMatterUpdateTimestamp = async (file: TFile, processor: (frontmatter: unknown) => void): Promise<void> => {
    const {plugin} = getGlobals();
    await plugin.app.fileManager.processFrontMatter(file, processor);
}

export const setFileFrontmatter = (file: TFile, newFrontmatter: FrontMatterCache) => {
    const {plugin} = getGlobals();
    void plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
        frontmatter = newFrontmatter;
    });
}

export const getFileStateSettings = (file: TFile): null | StateSettings => {
    const frontmatter = getFileFrontmatter(file);
    if(!frontmatter) return null;

    if((frontmatter).state) {
        const stateName = (frontmatter).state;
        if(stateName) {
            return getStateByName(stateName);
        } else {
            return null;
        }
    }
    return null;
}

export const getFileStateSettingsAsync = async (file: TFile): Promise<null | StateSettings> => {
    const frontmatter = getFileFrontmatter(file);
    if (!frontmatter) return null;

    if ((frontmatter).state) {
        const stateName = (frontmatter).state;
        if (stateName) {
            return await getStateByNameForFile(file, stateName);
        }
    }
    return null;
}

export const getFilePrioritySettings = (file: TFile): null | PrioritySettings => {
    const frontmatter = getFileFrontmatter(file);
    if(!frontmatter) return null;

    if((frontmatter).priority) {
        const priorityName = (frontmatter).priority;
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

export const getFileStateNameAsync = async (file: TFile): Promise<null | string> => {
    const stateSettings = await getFileStateSettingsAsync(file);
    if (!stateSettings) return null;
    return stateSettings.name;
}

export const setFileState = async (file: TFile, stateSettings: null | StateSettings): Promise<boolean> => {
    try {
        const {plugin} = getGlobals();
        await processFrontMatterPreserveTimestamp(file, (frontmatter) => {
            
            if(stateSettings) {
                if(frontmatter['state'] === stateSettings.name || frontmatter['state'] === `[[${stateSettings.name}]]`) {
                    // Clicked on same state, remove it
                    frontmatter['state'] = undefined;
                    return;
                } else {
                    // Clicked on different state, set it
                    if(stateSettings.link) {
                        frontmatter['state'] = `[[${stateSettings.name}]]`;
                        return;
                    } else {
                        frontmatter['state'] = stateSettings.name;
                        return;
                    }
                }

            } else {
                frontmatter['state'] = undefined;
                // NOTE: delete frontmatter['state']; // This doesn't work
            }
        });
        void plugin.refreshFileDependants();
        return true;
    } catch(e) {
        error(e);
        return false;
    }
}

export const setFilePriority = async (file: TFile, prioritySettings: null | PrioritySettings): Promise<boolean> => {
    try {
        const {plugin} = getGlobals();
        await processFrontMatterPreserveTimestamp(file, (frontmatter) => {
            if(prioritySettings) {
                if(frontmatter['priority'] === prioritySettings.name || frontmatter['priority'] === `[[${prioritySettings.name}]]`) {
                    // Clicked on same priority, remove it
                    frontmatter['priority'] = undefined;
                    return;
                } else {
                    // Clicked on different priority, set it
                    if(prioritySettings.link) {
                        frontmatter['priority'] = `[[${prioritySettings.name}]]`;
                        return;
                    } else {
                        frontmatter['priority'] = prioritySettings.name;
                        return;
                    }
                }
            } else {
                frontmatter['priority'] = undefined;
                // NOTE: delete frontmatter['priority']; // This doesn't work
            }
        });
        void plugin.refreshFileDependants();
        return true;
    } catch(e) {
        error(e);
        return false;
    }
}

export const getFileAliases = (file: TFile): null | string => {
    const frontmatter = getFileFrontmatter(file);
    if(!frontmatter) return null;

    if((frontmatter).aliases) {
        const aliases = (frontmatter).aliases;
        return aliases;
    }
    return null;
}