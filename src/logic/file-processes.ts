import { Notice, TAbstractFile, TFile, TFolder, Vault } from "obsidian";
import { getProjectExcerpt } from "./folder-processes";
import { ProjectCardsView } from "src/views/card-browser-view/card-browser-view";
import { CARD_BROWSER_VIEW_TYPE } from "src/views/card-browser-view/card-browser-view-constants";
import { ConfirmationModal } from "src/modals/confirmation-modal/confirmation-modal";
import { renameAbstractFile } from "src/utils/file-manipulation";
import { getGlobals } from "./stores";
import { removeCodeBlocks, removeFrontmatter, removeMarkdownCharacters, removeXmlTags, simplifyWhiteSpace } from "src/utils/string-processes";

/////////
/////////

export const getExcerpt = async (item: TAbstractFile): Promise<null|string> => {
    const {plugin} = getGlobals();
    const v = item.vault;
    let excerpt: null | string = null;

    // TODO: Use shortSummary property if present
    // Otherwise do all below (createExcerpt)

    if(item instanceof TFile)           excerpt = await getFileExcerpt(item);
    else if(item instanceof TFolder)    excerpt = await getProjectExcerpt(item)

    return excerpt;
}

export const getFileExcerpt = async (file: TFile): Promise<null|string> => {
    const v = file.vault;
    let excerpt: string = '';

    // TODO: Use shortSummary property if present
    // Otherwise do all below (createExcerpt)

    excerpt = await v.cachedRead(file);
    excerpt = removeFrontmatter(excerpt);
    excerpt = removeCodeBlocks(excerpt);
    excerpt = removeXmlTags(excerpt);
    excerpt = removeMarkdownCharacters(excerpt);
    excerpt = simplifyWhiteSpace(excerpt);

    return excerpt;
}

export function getScrollOffset(): number {
    const {plugin} = getGlobals();
    const editor = plugin.app.workspace.activeEditor?.editor;

    if(!editor) return 0;

    return editor.getScrollInfo().top;
}

export async function deleteFileImmediately(file: TFile) {
    const {plugin} = getGlobals();
    await plugin.app.fileManager.trashFile(file);
    void plugin.refreshFileDependants();
}

export async function deleteFolderImmediately(folder: TFolder) {
    const {plugin} = getGlobals();
    await plugin.app.fileManager.trashFile(folder);
    void plugin.refreshFileDependants();
}

export function deleteFileWithConfirmation(file: TFile) {
    new ConfirmationModal({
        title: 'Delete note?',
        message: `Are you sure you'd like to delete "${file.name}" ?`,
        confirmLabel: 'Delete note',
        confirmAction: async () => {
            await deleteFileImmediately(file);
            new Notice(`Deleted "${file.name}"`);
        }
    }).open();
}

export function deleteFolderWithConfirmation(folder: TFolder) {
    new ConfirmationModal({
        title: 'Delete folder & contents?',
        message: `Are you sure you'd like to delete "${folder.name}" and it's contents?`,
        confirmLabel: 'Delete folder & contents',
        confirmAction: async () => {
            await deleteFolderImmediately(folder);
            new Notice(`Deleted "${folder.name}"`);
        }
    }).open();
}

export function renameFileOrFolderInPlace(abstractFile: TAbstractFile, origEl: HTMLElement) {
    const origName = abstractFile.name;
    const origDisplay = origEl.style.display;

    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.value = origEl.textContent || 'unnamed';
    inputElement.classList.add(...origEl.classList);

    origEl.parentNode?.insertBefore(inputElement, origEl);
    inputElement.focus();
    inputElement.select();
    origEl.style.display = 'none';

    const detectExitKey = (e: KeyboardEvent) => {
        if(e.key === 'Enter') {
            void saveAbstractFile();
            void endRenamingMode();
        } else if(e.key === 'Escape') {
            void endRenamingMode();
        }
    }

    const saveAbstractFile = async () => {
        const savedFilename = await renameAbstractFile(abstractFile, inputElement.value);
        if(savedFilename) {
            new Notice(`Renamed ${origName} to ${savedFilename}`);
        } else {
            new Notice(`Couldn't rename file.`);
        }
    }

    const endRenamingMode = async () => {
        inputElement.parentNode?.removeChild(inputElement);
        origEl.style.display = origDisplay;
    }

    inputElement.addEventListener('keyup', detectExitKey);
    inputElement.addEventListener('blur', endRenamingMode);
}