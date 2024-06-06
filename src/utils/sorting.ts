import { TAbstractFile } from "obsidian";

//////////////////
//////////////////

export function sortItemsAlphabetically(items: Array<TAbstractFile>, sortType: 'ascending' | 'descending'): TAbstractFile[] {
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