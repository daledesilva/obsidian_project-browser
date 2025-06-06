import { TAbstractFile, TFile, TFolder } from "obsidian";
import { getFilePrioritySettings } from "src/logic/frontmatter-processes";

//////////////////
//////////////////

export function sortItemsByName(items: Array<TAbstractFile>, direction: 'ascending' | 'descending'): TAbstractFile[] {
    const sortedItems = [...items];

    sortedItems.sort( (a: TAbstractFile, b: TAbstractFile) => {
        if(direction === 'ascending') {
            return a.name.localeCompare(b.name);
        } else {
            return a.name.localeCompare(b.name) * -1;
        }
    });

    return sortedItems;
}

export function sortItemsByCreationDate(items: Array<TAbstractFile>, direction: 'ascending' | 'descending'): TAbstractFile[] {
    const sortedItems = [...items];

    sortedItems.sort( (a: TAbstractFile, b: TAbstractFile) => {
        if(!(a instanceof TFile) || !(b instanceof TFile)) return 0;

        const aCtime = (a as TFile).stat.ctime;
        const bCtime = (b as TFile).stat.ctime;

        if(direction === 'ascending') {
            return aCtime - bCtime;
        } else {
            return bCtime - aCtime;
        }
    });

    return sortedItems;
}

export function sortItemsByModifiedDate(items: Array<TAbstractFile>, direction: 'ascending' | 'descending'): TAbstractFile[] {
    const sortedItems = [...items];

    sortedItems.sort( (a: TAbstractFile, b: TAbstractFile) => {
        if(!(a instanceof TFile) || !(b instanceof TFile)) return 0;

        const aMtime = (a as TFile).stat.mtime;
        const bMtime = (b as TFile).stat.mtime;

        if(direction === 'ascending') {
            console.log('ascending', aMtime, bMtime);
            return aMtime - bMtime;
        } else {
            console.log('descending', aMtime, bMtime);
            return bMtime - aMtime;
        }
    });

    return sortedItems;
}

export function sortItemsByPriority(items: Array<TAbstractFile>): TAbstractFile[] {
    const sortedItems = [...items];

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

export function sortItemsByNameAndPriority(items: Array<TAbstractFile>, direction: 'ascending' | 'descending'): TAbstractFile[] {
    const itemsSortedByName = sortItemsByName(items, direction);
    const itemsSortedByNameAndPriority = sortItemsByPriority(itemsSortedByName);
    return itemsSortedByNameAndPriority;
}

export function sortItemsByCreationDateAndPriority(items: Array<TAbstractFile>, direction: 'ascending' | 'descending'): TAbstractFile[] {
    const itemsSortedByCreationDate = sortItemsByCreationDate(items, direction);
    const itemsSortedByCreationDateAndPriority = sortItemsByPriority(itemsSortedByCreationDate);
    return itemsSortedByCreationDateAndPriority;
}

export function sortItemsByModifiedDateAndPriority(items: Array<TAbstractFile>, direction: 'ascending' | 'descending'): TAbstractFile[] {
    const itemsSortedByModifiedDate = sortItemsByModifiedDate(items, direction);
    const itemsSortedByModifiedDateAndPriority = sortItemsByPriority(itemsSortedByModifiedDate);
    return itemsSortedByModifiedDateAndPriority;
}

