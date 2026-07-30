import { TFile } from "obsidian";
import { getFileAliases } from "./frontmatter-processes";
import { stripSearchGraphFilenameSuffixes } from "./filename-suffixes";
import { getGlobals } from "./stores";

//////////////////
//////////////////

const OBSIDIAN_DOCUMENT_EXTENSIONS = new Set(['md', 'canvas', 'base']);

export const getFileDisplayName = (file: TFile): string => {
    const {plugin} = getGlobals();
    const aliases = getFileAliases(file);
    if(plugin.settings.useAliases && aliases) {
        return aliases[0];
    }
    const cleanedBasename = stripSearchGraphFilenameSuffixes(file.basename);
    const ext = (file.extension ?? 'md').toLowerCase();
    if(OBSIDIAN_DOCUMENT_EXTENSIONS.has(ext)) {
        return cleanedBasename;
    }
    if(plugin.settings.showFileExtForNonMdFiles) {
        return file.extension ? `${cleanedBasename}.${file.extension}` : cleanedBasename;
    }
    return cleanedBasename;
}

export interface FileDisplayNameParts {
    basename: string;
    extension: string | null;
}

/** Returns display name split so the extension can be styled separately (e.g. faded). */
export function getFileDisplayNameParts(file: TFile): FileDisplayNameParts {
    const {plugin} = getGlobals();
    const aliases = getFileAliases(file);
    if(plugin.settings.useAliases && aliases) {
        return { basename: aliases[0], extension: null };
    }
    const cleanedBasename = stripSearchGraphFilenameSuffixes(file.basename);
    const ext = (file.extension ?? 'md').toLowerCase();
    if(OBSIDIAN_DOCUMENT_EXTENSIONS.has(ext)) {
        return { basename: cleanedBasename, extension: null };
    }
    if(plugin.settings.showFileExtForNonMdFiles && file.extension) {
        return { basename: cleanedBasename, extension: '.' + file.extension };
    }
    return { basename: cleanedBasename, extension: null };
}