import { TAbstractFile, TFile, TFolder } from "obsidian";
import { getFilePrioritySettings } from "src/logic/frontmatter-processes";

//////////////////
//////////////////

export function sortItemsByName(items: Array<TAbstractFile>, sortType: 'ascending' | 'descending'): TAbstractFile[] {
    const sortedItems = [...items];

    sortedItems.sort( (a: TAbstractFile, b: TAbstractFile) => {
        if(sortType === 'ascending') {
            return a.name.localeCompare(b.name);
        } else {
            return a.name.localeCompare(b.name) * -1;
        }
    });

    return sortedItems;
}

export function sortItemsByNameAndPriority(items: Array<TAbstractFile>, sortType: 'ascending' | 'descending'): TAbstractFile[] {
    const sortedItems = [...items];

    // Sort by alias or filename first
    sortedItems.sort( (a: TAbstractFile, b: TAbstractFile) => {
        if(sortType === 'ascending') {
            return a.name.localeCompare(b.name);
        } else {
            return a.name.localeCompare(b.name) * -1;
        }
    });

    // The sort by priority
    sortedItems.sort( (a: TAbstractFile, b: TAbstractFile) => {
        // Don't sort if either aren't files as non-files don't have priorities.
        if(a instanceof TFolder || b instanceof TFolder) return 0;

        const aPriority = getFilePrioritySettings(a as TFile);
        const bPriority = getFilePrioritySettings(b as TFile);

        if(aPriority && !bPriority) {
            // b is null
            if(aPriority.name === 'High') {
                return -1;
            } else {
                return 1;
            }
        }

        if(!aPriority && bPriority) {
            // a is null
            if(bPriority.name === 'High') {
                return 1;
            } else {
                return -1;
            }
        }
        
        if(aPriority && bPriority) {
            if(aPriority.name === bPriority.name) return 0;
            else if(aPriority.name === 'High' && bPriority.name === 'Low') return -1;
            else if(aPriority.name === 'Low' && bPriority.name === 'High') return 1;
        }

        return 0;
    })

    return sortedItems;
}

