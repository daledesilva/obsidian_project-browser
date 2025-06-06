import { TAbstractFile, TFile, TFolder } from "obsidian";
import { Section, getStateSettings, orderSections } from "./section-processes";
import { getFileFrontmatter, getFileStateSettings, getFileStateName, getFilePrioritySettings } from "./frontmatter-processes";
import { getFileExcerpt } from "./file-processes";
import { getGlobals } from "./stores";

///////////
///////////


export const isProjectFolder = async (folder: TFolder): Promise<boolean> => {
    const {plugin} = getGlobals();
    const itemsInFolder = getItemsInFolder(folder);
    if(!itemsInFolder)  return false;

    // TODO:
    // if(markedAsProjectFolder(folder)) {
        // return true
    // } else if(markedAsCategoryFolder(folder)) {
        // return false
    // } else
    if(contentsIndicatesProject(folder)) {
        return true
    }

    return false;
}

function contentsIndicatesProject(folder: TFolder): boolean {
    const itemsInFolder = getItemsInFolder(folder);
    const fileStatesFound: string[] = [];
    
    itemsInFolder?.forEach( (item) => {

        if(item instanceof TFile) {
            const rawState = getFileStateSettings(item);
            if(rawState) {
                fileStatesFound.push(rawState);
            }
        }

    })

    const directFilesExist = fileStatesFound.length > 0;
    const multipleDirectFilesHaveState = fileStatesFound.length > 1;

    return directFilesExist && !multipleDirectFilesHaveState;
}

// Returns first state found in folder
// use isProjectFolder to ensure it's a project first
function getProjectState(folder: TFolder): null | string {
    const itemsInFolder = getItemsInFolder(folder);
    if(!itemsInFolder) return null;
    
    for(let i=0; i<itemsInFolder.length; i++) {
        const item = itemsInFolder[i];
        if(item instanceof TFile) {
            const rawState = getFileStateSettings(item);
            if(rawState) {
                return rawState;
            }
        }
    }

    return null;
}

export const getProjectExcerpt = async (folder: TFolder): Promise<null|string> => {
    const itemsInFolder = getItemsInFolder(folder);
    if(!itemsInFolder)  return null;
    
    for(let i=0; i<itemsInFolder.length; i++) {
        const item = itemsInFolder[i];
        if(item instanceof TFile) {
            const rawState = getFileStateSettings(item);
            if(rawState) {
                return await getFileExcerpt(item);
            }
        }
    }

    return null;
}

export const getSortedSectionsInFolder = (folder: TFolder): Section[] => {
    const {plugin} = getGlobals();
    const itemsInFolder = getItemsInFolder(folder);
    
    interface ItemsBySectionMap {
        [key: string]: Array<TFile | TFolder>
    }

    const itemsBySection: ItemsBySectionMap = {};
    itemsInFolder?.forEach( (item) => {
        if(item instanceof TFolder) {

            // TODO: Use isProject somewhere here to simplify

            // TODO: If it's in the "treat as folder" list
            // if((item)) { }

            // TODO: If it's in the "treat as project" list

            // TODO: If it contains multiple files with states or it's subfolders contain multiple files with states
            // if(contentsIndicatesProject(item)) {
            //     // Visually treat as a file/project
            //     const state = getProjectState(item);
            //     if(state) {
            //         if(!itemsBySection[state]) itemsBySection[state] = [];
            //         itemsBySection[state].push(item);
            //     } else {
            //         if(!itemsBySection[' ']) itemsBySection[' '] = [];
            //         itemsBySection[' '].push(item);
            //     }

            // } else {
                // Treat all other folders as folders
                if(!itemsBySection['folders']) itemsBySection['folders'] = [];
                itemsBySection['folders'].push(item);
            // }

        } else if(item instanceof TFile) {
            // Don't show Project Browser settings files
            if(item.extension.toLowerCase() === 'pbs') return;

            const displayState = getFileStateName(item);
            if(displayState) {
                if(!itemsBySection[displayState]) itemsBySection[displayState] = [];
                itemsBySection[displayState].push(item);
            } else {
                if(!itemsBySection[' ']) itemsBySection[' '] = [];
                itemsBySection[' '].push(item);
            }

            

        }
        
    })

    let itemsBySectionArr: Section[] = [];
    for (const [key, value] of Object.entries(itemsBySection)) {
        if(key === 'folders') {
            itemsBySectionArr.push({
                title: key,
                type: 'folders',
                items: value,
                settings: plugin.settings.folders,
            })
        } else if(key == ' ') {
            itemsBySectionArr.push({
                title: key,
                type: 'stateless',
                items: value,
                settings: plugin.settings.stateless,
            })
        } else {
            itemsBySectionArr.push({
                title: key,
                type: 'state',
                items: value,
                settings: getStateSettings(key),
            })
        }
    }
    
    itemsBySectionArr = orderSections(itemsBySectionArr);

    return itemsBySectionArr;
}

export function filterSectionsByString(sections: Section[], searchStr: string) {
    sections.forEach( (section) => {
        if(section.type !== 'folders') filterSectionByString(section, searchStr);
    })
}

export function filterSectionByString(section: Section, searchStr: string) {
    section.items = section.items.filter( (item) => {
        return item.name.toLowerCase().contains(searchStr.toLowerCase())
    })
}

export const getItemsInFolder = (folder: TFolder): null | TAbstractFile[] => {
    const v = folder.vault;
    const curFiles = folder.children;

    // TODO: Filter for markdown files and folders???
    // This would help prevent images showing up, but might also filter items that shouldn't be... ie. Ink files?
    // There should be a setting somewhere that lets you filter anything not md or folder, or manually select what you want to filter.
    // It would automatically show any filetype that it can see in the vault.
    
    return curFiles;
}

export const refreshFolderReference = async (folder: TFolder): Promise<TFolder> => {
    
    // TODO: This is redundant since it's already passing in a TFolder
    const v = folder.vault;
    const refreshedFolder = v.getAbstractFileByPath(folder.path) as TFolder;

    // NOTE: Returns a promise with an artificial delay because getAbstractFilePath seems to take a sec to refresh the folder.
    return new Promise(
        (resolve) => setTimeout( () => {
            resolve(refreshedFolder)
        }, 10)
    );
}
