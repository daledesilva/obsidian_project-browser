import { TAbstractFile, TFile, TFolder } from "obsidian";
import { getFrontmatter } from "./read-files";
import ProjectCardsPlugin from "src/main";

/////////
/////////

interface ItemsBySectionMap {
    [key: string]: Array<TFile | TFolder>
}
interface Section {
    title: string,
    items: Array<TFile | TFolder>
}

export const getSortedItemsInFolder = (plugin: ProjectCardsPlugin, folder: TFolder): Section[] => {
    const itemsInFolder = getItemsInFolder(folder);
    // build object of states and cards
    // populate each state with cards
    
    const itemsBySection: ItemsBySectionMap = {};
    itemsInFolder?.forEach( (item) => {
        if(item instanceof TFolder) {

            // TODO: Use isProject somewhere here to simplify

            // TODO: If it's in the "treat as folder" list
            // if((item)) { }

            // TODO: If it's in the "treat as project" list

            // TODO: If it contains multiple files with states or it's subfolders contain multiple files with states
            if(contentsIndicatesProject(plugin, item)) {
                // Visually treat as a file/project
                const state = getProjectState(plugin, item);
                if(state) {
                    if(!itemsBySection[state]) itemsBySection[state] = [];
                    itemsBySection[state].push(item);
                } else {
                    if(!itemsBySection[' ']) itemsBySection[' '] = [];
                    itemsBySection[' '].push(item);
                }

            } else {
                // Treat all other folders as folders
                if(!itemsBySection['Folders']) itemsBySection['Folders'] = [];
                itemsBySection['Folders'].push(item);
            }

        } else if(item instanceof TFile) {
            const frontmatter = getFrontmatter(plugin, item);
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
            items: value
        })
    }
    
    itemsBySectionArr = orderSections(itemsBySectionArr);

    return itemsBySectionArr;
}


const orderSections = (sections: Section[]): Section[] => {
    const intendedOrder = ['Folders','Final', 'Drafting', 'Idea', ' ', 'Archived', 'Cancelled']
    
    // Create a map to store the original index of each section title
    const sectionMap = sections.reduce((accumulator, section, index) => {
        accumulator[section.title] = index;
        return accumulator;
    }, {} as Record<string, number>);
    
    // Sort the sections based on their intended order
    let sortedSections = intendedOrder.map((title) => sections[sectionMap[title]]) || [];

    for(let i=sortedSections.length-1; i>=0; i--) {
        if(sortedSections[i] === undefined){
            sortedSections.splice(i,1);
            console.log(sortedSections)
        }
    }
    
    return sortedSections;
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

export function contentsIndicatesProject(plugin: ProjectCardsPlugin, folder: TFolder): boolean {
    const itemsInFolder = getItemsInFolder(folder);
    const fileStatesFound: string[] = [];
    
    itemsInFolder?.forEach( (item) => {

        if(item instanceof TFile) {
            const frontmatter = getFrontmatter(plugin, item);
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
// use contentsIndicatesProjectFolder to ensure it's a project first
function getProjectState(plugin: ProjectCardsPlugin, folder: TFolder): null | string {
    const itemsInFolder = getItemsInFolder(folder);
    
    itemsInFolder?.forEach( (item) => {

        if(item instanceof TFile) {
            const frontmatter = getFrontmatter(plugin, item);
            if(frontmatter['state']) {
                return frontmatter['state'];
            }
        }

    })

    return null;
}