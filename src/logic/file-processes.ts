import { Notice, TAbstractFile, TFile, TFolder, Vault } from "obsidian";
import ProjectBrowserPlugin from "src/main";
import { getProjectExcerpt } from "./folder-processes";
import { CARD_BROWSER_VIEW_TYPE, ProjectCardsView } from "src/views/card-browser-view/card-browser-view";
import { ConfirmationModal } from "src/modals/confirmation-modal/confirmation-modal";
import { renameAbstractFile } from "src/utils/file-manipulation";

/////////
/////////

export const getExcerpt = async (plugin: ProjectBrowserPlugin, item: TAbstractFile): Promise<null|string> => {
    const v = item.vault;
    let excerpt: null | string = null;

    // TODO: Use shortSummary property if present
    // Otherwise do all below (createExcerpt)

    if(item instanceof TFile)           excerpt = await getFileExcerpt(item);
    else if(item instanceof TFolder)    excerpt = await getProjectExcerpt(plugin, item)

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
    excerpt = simplifyWhiteSpace(excerpt);

    return excerpt;
}

// REVIEW: Write tests for this
export function removeFrontmatter(text: string): string {
    const sectionRegex = /---([^`]+?)---(\s*)/g;
    return text.replace(sectionRegex, "");
}

// REVIEW: Write tests for this
export function removeCodeBlocks(text: string): string {
    const sectionRegex = /(\s*)```([^`]+?)```(\s*)/g;
    return text.replace(sectionRegex, "");
}

// REVIEW: Write tests for this
// REVIEW: This isn't properly working with new lines across code blocks and maybe more
export function simplifyWhiteSpace(text: string): string {
    const lineBreakRegex = /(\\n|\\n\s+|\s+\\n)+/;
    return text.replace(lineBreakRegex, '. ');
}

export function getScrollOffset(plugin: ProjectBrowserPlugin): number {
    const editor = plugin.app.workspace.activeEditor?.editor;

    if(!editor) return 0;

    return editor.getScrollInfo().top;
}

export function deleteFileImmediately(plugin: ProjectBrowserPlugin, file: TFile) {
    file.vault.delete(file);
    plugin.refreshFileDependants();
}

export function deleteFolderImmediately(plugin: ProjectBrowserPlugin, folder: TFolder) {
    folder.vault.delete(folder, true);
    plugin.refreshFileDependants();
}

export function deleteFileWithConfirmation(plugin: ProjectBrowserPlugin, file: TFile) {
    new ConfirmationModal({
        plugin,
        title: 'Delete note?',
        message: `Are you sure you'd like to delete "${file.name}" ?`,
        confirmLabel: 'Delete note',
        confirmAction: async () => {
            deleteFileImmediately(plugin, file);
            new Notice(`Deleted "${file.name}"`);
        }
    }).open();
}

export function deleteFolderWithConfirmation(plugin: ProjectBrowserPlugin, folder: TFolder) {
    new ConfirmationModal({
        plugin,
        title: 'Delete folder & contents?',
        message: `Are you sure you'd like to delete "${folder.name}" and it's contents?`,
        confirmLabel: 'Delete folder & contents',
        confirmAction: async () => {
            deleteFolderImmediately(plugin, folder);
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
            saveAbstractFile();
            endRenamingMode();
        } else if(e.key === 'Escape') {
            endRenamingMode();
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