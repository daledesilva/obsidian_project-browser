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
            if(!itemsBySection['Folder']) itemsBySection['Folder'] = [];
            itemsBySection['Folder'].push(item);

        } else if(item instanceof TFile) {
            const frontmatter = getFrontmatter(plugin, item);
            // if(frontmatter['tags']) {
            //     frontmatter['tags'].forEach( (tag) => {
            //         if(!itemsByTags[tag]) itemsByTags[tag] = [];
            //         itemsByTags[tag].push(item);
            //     })
            if(frontmatter['state']) {
                const status = frontmatter['state'];
                if(!itemsBySection[status]) itemsBySection[status] = [];
                itemsBySection[status].push(item);
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
    

    // itemsBySectionArr = orderSections(itemsBySectionArr);

    console.log('itemsBySectionArr', itemsBySectionArr)

    return itemsBySectionArr;
}

const orderSections = (sections: Section[]): Section[] => {
    
    return null;
}

const getItemsInFolder = (folder: TFolder): null | TAbstractFile[] => {
    const v = folder.vault;
    const curFiles = folder.children;

    // TODO: Filter for markdown files and folders???
    // This would help prevent images showing up, but might also filter items that shouldn't be... ie. Ink files?
    // There should be a setting somewhere that lets you filter anything not md or folder, or manually select what you want to filter.
    // It would automatically show any filetype that it can see in the vault.
    
    return curFiles;
}