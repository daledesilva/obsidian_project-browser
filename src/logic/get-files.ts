import { TAbstractFile, TFolder } from "obsidian";




export const getSortedNotesInFolder = (folder: TFolder): null | TAbstractFile[] => {
    const states = getOrderedStates();
    const notesInFolder = getItemsInFolder(folder);
    // build object of states and cards
    // populate each state with cards

    return notesInFolder;
}

const getOrderedStates = (): null | String[] => {
    
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