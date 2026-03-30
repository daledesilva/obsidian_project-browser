import { TAbstractFile, TFile, TFolder } from "obsidian";
import { getFilePrioritySettings } from "src/logic/frontmatter-processes";
import { StateSettings, StateViewOrder } from "src/types/types-map";

//////////////////
//////////////////

const naturalNameCollator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base',
});

export function compareItemNamesNaturally(a: Pick<TAbstractFile, 'name'>, b: Pick<TAbstractFile, 'name'>): number {
    return naturalNameCollator.compare(a.name, b.name);
}

export function sortItems(items: Array<TAbstractFile>, stateSettings: StateSettings): TAbstractFile[] {
    let sortedItems: TAbstractFile[] = [];

    if(stateSettings.defaultViewPriorityGrouping) {
        if(stateSettings?.defaultViewOrder === StateViewOrder.AliasOrFilename) {
            sortedItems = sortItemsByPriorityThenName(items, 'ascending');
        } else if(stateSettings?.defaultViewOrder === StateViewOrder.CreationDate) {
            sortedItems = sortItemsByPriorityThenCreationDate(items, 'ascending');
        } else if(stateSettings?.defaultViewOrder === StateViewOrder.ModifiedDate) {
            sortedItems = sortItemsByPriorityThenModifiedDate(items, 'descending');
        } else {
            // Default if no sort order is set for some reason
            sortedItems = sortItemsByPriorityThenName(items, 'ascending');
        }
    } else {
        if(stateSettings?.defaultViewOrder === StateViewOrder.AliasOrFilename) {
            sortedItems = sortItemsByName(items, 'ascending');
        } else if(stateSettings?.defaultViewOrder === StateViewOrder.CreationDate) {
            sortedItems = sortItemsByCreationDate(items, 'ascending');
        } else if(stateSettings?.defaultViewOrder === StateViewOrder.ModifiedDate) {
            sortedItems = sortItemsByModifiedDate(items, 'descending');
        } else {
            // Default if no sort order is set for some reason
            sortedItems = sortItemsByName(items, 'ascending');
        }
    }
    
    return sortedItems;
}

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

function getStatCtime(item: TAbstractFile): number {
    return item.stat?.ctime ?? 0;
}

function getStatMtime(item: TAbstractFile): number {
    return item.stat?.mtime ?? 0;
}

export function sortItemsByCreationDate(items: Array<TAbstractFile>, direction: 'ascending' | 'descending'): TAbstractFile[] {
    const sortedItems = [...items];

    sortedItems.sort( (a: TAbstractFile, b: TAbstractFile) => {
        const aCtime = getStatCtime(a);
        const bCtime = getStatCtime(b);

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
        const aMtime = getStatMtime(a);
        const bMtime = getStatMtime(b);

        if(direction === 'ascending') {
            return aMtime - bMtime;
        } else {
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

export function sortItemsByPriorityThenName(items: Array<TAbstractFile>, direction: 'ascending' | 'descending'): TAbstractFile[] {
    const itemsSortedByName = sortItemsByName(items, direction);
    const itemsSortedByNameAndPriority = sortItemsByPriority(itemsSortedByName);
    return itemsSortedByNameAndPriority;
}

export function sortItemsByPriorityThenCreationDate(items: Array<TAbstractFile>, direction: 'ascending' | 'descending'): TAbstractFile[] {
    const itemsSortedByCreationDate = sortItemsByCreationDate(items, direction);
    const itemsSortedByCreationDateAndPriority = sortItemsByPriority(itemsSortedByCreationDate);
    return itemsSortedByCreationDateAndPriority;
}

export function sortItemsByPriorityThenModifiedDate(items: Array<TAbstractFile>, direction: 'ascending' | 'descending'): TAbstractFile[] {
    const itemsSortedByModifiedDate = sortItemsByModifiedDate(items, direction);
    const itemsSortedByModifiedDateAndPriority = sortItemsByPriority(itemsSortedByModifiedDate);
    return itemsSortedByModifiedDateAndPriority;
}

