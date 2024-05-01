import { TAbstractFile, TFile, TFolder } from "obsidian";
import ProjectBrowserPlugin from "src/main";
import { Section, orderSections } from "./section-processes";
import { getFileFrontmatter } from "./frontmatter-processes";
import { getFileExcerpt } from "./file-processes";

///////////
///////////


export const isProjectFolder = async (plugin: ProjectBrowserPlugin, folder: TFolder): Promise<boolean> => {
    const itemsInFolder = getItemsInFolder(folder);
    if(!itemsInFolder)  return false;

    // TODO:
    // if(markedAsProjectFolder(plugin, folder)) {
        // return true
    // } else if(markedAsCategoryFolder(plugin, folder)) {
        // return false
    // } else
    if(contentsIndicatesProject(plugin, folder)) {
        return true
    }

    return false;
}

function contentsIndicatesProject(plugin: ProjectBrowserPlugin, folder: TFolder): boolean {
    const itemsInFolder = getItemsInFolder(folder);
    const fileStatesFound: string[] = [];
    
    itemsInFolder?.forEach( (item) => {

        if(item instanceof TFile) {
            const frontmatter = getFileFrontmatter(plugin, item);
            if(frontmatter['state']) {
                fileStatesFound.push(frontmatter['state']);
            }
        }

    })

    const directFilesExist = fileStatesFound.length > 0;
    const multipleDirectFilesHaveState = fileStatesFound.length > 1;

    return directFilesExist && !multipleDirectFilesHaveState;
}

// Returns first state found in folder
// use isProjectFolder to ensure it's a project first
function getProjectState(plugin: ProjectBrowserPlugin, folder: TFolder): null | string {
    const itemsInFolder = getItemsInFolder(folder);
    if(!itemsInFolder) return null;
    
    for(let i=0; i<itemsInFolder.length; i++) {
        const item = itemsInFolder[i];
        if(item instanceof TFile) {
            const frontmatter = getFileFrontmatter(plugin, item);
            if(frontmatter['state']) {
                return frontmatter['state'];
            }
        }
    }

    return null;
}

export const getProjectExcerpt = async (plugin: ProjectBrowserPlugin, folder: TFolder): Promise<null|string> => {
    const itemsInFolder = getItemsInFolder(folder);
    if(!itemsInFolder)  return null;
    
    for(let i=0; i<itemsInFolder.length; i++) {
        const item = itemsInFolder[i];
        if(item instanceof TFile) {
            const frontmatter = getFileFrontmatter(plugin, item);
            if(frontmatter['state']) {
                return await getFileExcerpt(item);
            }
        }
    }

    return null;
}

export const getSortedItemsInFolder = (plugin: ProjectBrowserPlugin, folder: TFolder): Section[] => {
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
            // if(contentsIndicatesProject(plugin, item)) {
            //     // Visually treat as a file/project
            //     const state = getProjectState(plugin, item);
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
            const frontmatter = getFileFrontmatter(plugin, item);
            // if(frontmatter['tags']) {
            //     frontmatter['tags'].forEach( (tag) => {
            //         if(!itemsByTags[tag]) itemsByTags[tag] = [];
            //         itemsByTags[tag].push(item);
            //     })
            if(frontmatter['state']) {
                const state = frontmatter['state'];
                if(!itemsBySection[state]) itemsBySection[state] = [];
                itemsBySection[state].push(item);
            } else {
                if(!itemsBySection[' ']) itemsBySection[' '] = [];
                itemsBySection[' '].push(item);
            }
        }
        
    })

    let itemsBySectionArr: Section[] = [];
    for (const [key, value] of Object.entries(itemsBySection)) {
        itemsBySectionArr.push({
            title: key,
            type: key === 'folders' ? 'folders' : key == ' ' ? 'stateless' : 'state',
            items: value
        })
    }
    
    itemsBySectionArr = orderSections(itemsBySectionArr, plugin);

    return itemsBySectionArr;
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
    const v = folder.vault;
    const refreshedFolder = v.getAbstractFileByPath(folder.path) as TFolder;

    // NOTE: Returns a proimise with an artificial delay because getAbstractFilePath seems to take a sec to refresh the folder.
    return new Promise(
        (resolve) => setTimeout( () => {
            resolve(refreshedFolder)
        }, 10)
    );
}
