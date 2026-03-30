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
            sortedItems = sortItemsByPriorityThenNaturalName(items, 'ascending');
        } else if(stateSettings?.defaultViewOrder === StateViewOrder.CreationDate) {
            sortedItems = sortItemsByPriorityThenCreationDate(items, 'ascending');
        } else if(stateSettings?.defaultViewOrder === StateViewOrder.ModifiedDate) {
            sortedItems = sortItemsByPriorityThenModifiedDate(items, 'descending');
        } else {
            // Default if no sort order is set for some reason
            sortedItems = sortItemsByPriorityThenNaturalName(items, 'ascending');
        }
    } else {
        if(stateSettings?.defaultViewOrder === StateViewOrder.AliasOrFilename) {
            sortedItems = sortItemsByNaturalName(items, 'ascending');
        } else if(stateSettings?.defaultViewOrder === StateViewOrder.CreationDate) {
            sortedItems = sortItemsByCreationDate(items, 'ascending');
        } else if(stateSettings?.defaultViewOrder === StateViewOrder.ModifiedDate) {
            sortedItems = sortItemsByModifiedDate(items, 'descending');
        } else {
            // Default if no sort order is set for some reason
            sortedItems = sortItemsByNaturalName(items, 'ascending');
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

export function sortItemsByNaturalName(items: Array<TAbstractFile>, direction: 'ascending' | 'descending'): TAbstractFile[] {
    const sortedItems = [...items];

    sortedItems.sort((a: TAbstractFile, b: TAbstractFile) => {
        const naturalComparison = compareItemNamesNaturally(a, b);

        if (direction === 'ascending') return naturalComparison;
        return naturalComparison * -1;
    });

    return sortedItems;
}

function getStatCtime(item: TAbstractFile): number {
    return (item as TAbstractFile & { stat?: { ctime?: number } }).stat?.ctime ?? 0;
}

function getStatMtime(item: TAbstractFile): number {
    return (item as TAbstractFile & { stat?: { mtime?: number } }).stat?.mtime ?? 0;
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
        const aPriority = getItemPriorityName(a);
        const bPriority = getItemPriorityName(b);

        if(aPriority && !bPriority) {
            // b is null
            if(aPriority === 'High') {
                return -1;
            } else {
                return 1;
            }
        }

        if(!aPriority && bPriority) {
            // a is null
            if(bPriority === 'High') {
                return 1;
            } else {
                return -1;
            }
        }
        
        if(aPriority && bPriority) {
            if(aPriority === bPriority) return 0;
            else if(aPriority === 'High' && bPriority === 'Low') return -1;
            else if(aPriority === 'Low' && bPriority === 'High') return 1;
        }

        return 0;
    })

    return sortedItems;
}

function getItemPriorityName(item: TAbstractFile): string | null {
    if (item instanceof TFolder) {
        return (item as TFolder & { priorityName?: string }).priorityName ?? null;
    }

    const prioritySettings = getFilePrioritySettings(item as TFile);
    if (!prioritySettings) return null;
    return prioritySettings.name;
}

export function sortItemsByPriorityThenName(items: Array<TAbstractFile>, direction: 'ascending' | 'descending'): TAbstractFile[] {
    const itemsSortedByName = sortItemsByName(items, direction);
    const itemsSortedByNameAndPriority = sortItemsByPriority(itemsSortedByName);
    return itemsSortedByNameAndPriority;
}

export function sortItemsByPriorityThenNaturalName(items: Array<TAbstractFile>, direction: 'ascending' | 'descending'): TAbstractFile[] {
    const itemsSortedByNaturalName = sortItemsByNaturalName(items, direction);
    const itemsSortedByNaturalNameAndPriority = sortItemsByPriority(itemsSortedByNaturalName);
    return itemsSortedByNaturalNameAndPriority;
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

