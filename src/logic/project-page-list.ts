import { TFile, TFolder } from 'obsidian';
import { getItemsInFolder } from './folder-processes';
import { isExtensionVisible } from './file-type-filter';

/**
 * Files shown in the project page menu (FAB + sidebar): same rules as ProjectPagesFAB pages list.
 */
export function getSortedPageMenuFilesInProjectFolder(folder: TFolder): TFile[] {
    const items = getItemsInFolder(folder);
    if (!items) return [];

    return items
        .filter((item): item is TFile => item instanceof TFile)
        .filter((file) => isExtensionVisible(file.extension, 'pageMenu'))
        .sort((a, b) => a.name.localeCompare(b.name));
}
