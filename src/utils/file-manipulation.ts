// import { FOLDER_NAME } from "src/constants";
// import ProjectCardsPlugin from "src/main";

import { App, DataWriteOptions, FileManager, TAbstractFile, TFile, TFolder, Vault, normalizePath } from "obsidian";
import { folderPathSanitize, parseFilepath, sanitizeFileFolderName } from "./string-processes";
import { setFileState } from "src/logic/frontmatter-processes";
import ProjectBrowserPlugin from "src/main";

// //////////
// //////////

// const getNewTimestampedFilepath = async (plugin: ProjectCardsPlugin, ext: string) => {
//     const date = new Date();
//     let monthStr = date.getMonth().toString();
//     let dateStr = date.getDate().toString();
//     let hours = date.getHours();
//     let minutesStr = date.getMinutes().toString();
//     let suffix = 'am';

//     if(minutesStr.length < 2) minutesStr = '0' + minutesStr;
//     let filename = date.getFullYear() + '.' + monthStr + '.' + dateStr + ' - ' + hours + '.' + minutesStr + suffix;

//     const pathAndBasename = FOLDER_NAME + '/' + filename;
//     let version = 1;
//     let pathAndVersionedBasename = pathAndBasename;

//     while( await plugin.app.vault.adapter.exists(`${pathAndVersionedBasename}.${ext}`) ) {
//         version ++;
// 		pathAndVersionedBasename = pathAndBasename + ' (' + version + ')';
//     }

//     return pathAndVersionedBasename + '.' + ext;
// }


interface ProjectDefaults {
    plugin: ProjectBrowserPlugin,
    state?: string
}
export async function createProject(parentFolder: TFolder, projectName: string, defaults?: ProjectDefaults ): Promise<TFile> {
    const v = parentFolder.vault;
        
    // Creating a project folder
    // const projectFolder = await createFolders(v, projectPath);
    // const primaryProjectFile = await createDefaultMarkdownFile(v, projectFolder, 'Article');
    
    const primaryProjectFile = await createDefaultMarkdownFile(v, parentFolder, projectName);

    if(defaults) {
        if(defaults.state) setFileState(defaults.plugin, primaryProjectFile, defaults.state);
    }

    return primaryProjectFile;
}


export async function createFolder(plugin: ProjectBrowserPlugin, folderPath: string): Promise<TFolder> {
    const safeFolderPath = folderPathSanitize(folderPath);
    const folder = await plugin.app.vault.createFolder(safeFolderPath);
    return folder
}

export async function renameAbstractFile(abstractFile: TAbstractFile, newName: string | null): Promise<string|null> {
    if(!newName) return null;
    const safeFilename = sanitizeFileFolderName(newName);
    if(abstractFile instanceof TFile) {
        return await renameTFile(abstractFile, safeFilename);
    } if(abstractFile instanceof TFolder) {
        return await renameTFolder(abstractFile, safeFilename);
    }
    
    console.log('Unknown AbstractFile Type:', abstractFile);
    return null;
}

export async function renameTFile(file: TFile, safeName: string): Promise<string|null> {
    const {ext} = parseFilepath(file.name);
    try {
        if(ext) {
            const safeNameWithExt = `${safeName}.${ext}`;
            file.vault.rename(file, safeNameWithExt);
            return safeNameWithExt;
        } else {
            file.vault.rename(file, `${safeName}`);
            return safeName;
        }
    } catch(e) {
        console.log(e)
        return null;
    }
}

export async function renameTFolder(folder: TFolder, safeName: string): Promise<string|null> {
    try {
        folder.vault.rename(folder, `${safeName}`);
        return safeName;
    } catch(e) {
        console.log(e)
        return null;
    }
}


/**
 * Recursively create folders, if they don't exist.
 */
async function createFolders(vault: Vault, path: string): Promise<TFolder> {
    let normalizedPath = normalizePath(path);

    // TODO: unclashFoldername instead of below
    let folder = vault.getAbstractFileByPath(normalizedPath);
    if (folder && folder instanceof TFolder) {
        return folder;
    }

    // Create folder and check if it exists
    await vault.createFolder(normalizedPath);
    folder = vault.getAbstractFileByPath(normalizedPath);
    if (!(folder instanceof TFolder)) {
        throw new Error(`Failed to create folder at "${path}"`);
    }

    return folder;
}

async function createDefaultMarkdownFile(vault: Vault, folder: TFolder, title: string): Promise<TFile> {
    let filename = sanitizeFileFolderName(title);
    // filename = unclashFileName(filename);

    let content = '';//getDefaultMdFileContent();

    // @ts-ignore
    return await createNewMarkdownFile(vault, folder, filename);
}

/**
 * Creates an empty markdown file and returns it. If the file exists already it creates a new one and appends a version number.
 * Don't include file extension unless it should appear in the note's title.
 */
async function createNewMarkdownFile(vault: Vault, folder: TFolder, filename: string, writeOptions: DataWriteOptions, version: number = 1) : Promise<TFile | null> {
    let pathAndVersionedBasename;
    let fileRef: TFile | null = null;

    try {
    
        if(version == 1) {
            pathAndVersionedBasename = `${folder.path}/${filename}`;
        } else {
            pathAndVersionedBasename = `${folder.path}/${filename} (${version})`;
        }
        
        if( await vault.adapter.exists(`${pathAndVersionedBasename}.md`) ) {
            // File already exists, try appending a number (or higher number)
            fileRef = await createNewMarkdownFile(vault, folder, filename, writeOptions, version+1);
        } else {
            // It doesn't yet exist, so create it
            fileRef = await vault.create(`${pathAndVersionedBasename}.md`, '', writeOptions);
        }

    } catch(reason) {
        console.log(reason)
    }
	
	return fileRef;
}