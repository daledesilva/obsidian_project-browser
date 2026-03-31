// import { FOLDER_NAME } from "src/constants";
// import ProjectCardsPlugin from "src/main";

import { App, DataWriteOptions, FileManager, TAbstractFile, TFile, TFolder, Vault, normalizePath } from "obsidian";
import { folderPathSanitize, parseFilepath, sanitizeFileFolderName } from "./string-processes";
import { getFilePrioritySettings, getFileStateSettings, setFilePriority, setFileState } from "src/logic/frontmatter-processes";
import { FOLDER_SETTINGS_FILENAME } from "src/constants";
import { getGlobals } from "src/logic/stores";
import { DEFAULT_FOLDER_SETTINGS, DEFAULT_SETTINGS, FolderSettings, PrioritySettings, StateSettings } from "src/types/types-map";
import { getProjectPageStateByName, getStateByName } from "src/logic/get-state-by-name";
import { getPriorityByName } from "src/logic/get-priority-by-name";

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

const PAGE_NAME_PATTERN = /page\s*(\d+)/i;

/**
 * Returns the next available "Page N" name for a project folder.
 * Scans existing file basenames for "Page #" (case- and space-insensitive),
 * finds the max number, and returns "Page " + (max + 1). Returns "Page 1" if none match.
 */
function getNextPageNameInProject(folder: TFolder): string {
    const children = folder.children;
    if (!children) return 'Page 1';

    const pageNumbers: number[] = [];
    for (const child of children) {
        if (!(child instanceof TFile)) continue;
        const basename = child.basename;
        const match = basename.match(PAGE_NAME_PATTERN);
        if (match) pageNumbers.push(parseInt(match[1], 10));
    }

    const maxNumber = pageNumbers.length > 0 ? Math.max(...pageNumbers) : 0;
    return `Page ${maxNumber + 1}`;
}

interface CreateProjectProps {
    parentFolder: TFolder,
    projectName: string,
    stateName?: string,
}

function normalizeFolderSettings(rawFolderSettings: FolderSettings & { _description?: string; stateName?: string; priorityName?: string }): FolderSettings {
    const normalizedFolderSettings: FolderSettings = {
        ...rawFolderSettings,
    };

    if (!normalizedFolderSettings.aboutThisFile && rawFolderSettings._description) {
        normalizedFolderSettings.aboutThisFile = rawFolderSettings._description;
    }

    if (!normalizedFolderSettings.state && rawFolderSettings.stateName) {
        normalizedFolderSettings.state = rawFolderSettings.stateName;
    }

    if (!normalizedFolderSettings.priority && rawFolderSettings.priorityName) {
        normalizedFolderSettings.priority = rawFolderSettings.priorityName;
    }

    delete (normalizedFolderSettings as FolderSettings & { _description?: string })._description;
    delete (normalizedFolderSettings as FolderSettings & { stateName?: string }).stateName;
    delete (normalizedFolderSettings as FolderSettings & { priorityName?: string }).priorityName;

    return normalizedFolderSettings;
}

export async function createProject(props: CreateProjectProps): Promise<TFile> {
    const v = props.parentFolder.vault;
    const globals = getGlobals();

    const folderSettings = await getFolderSettings(v, props.parentFolder);
    const parentIsProject = folderSettings.isProject === true;
    const usePageNaming = parentIsProject && props.projectName === 'Untitled';

    const projectName = usePageNaming ? getNextPageNameInProject(props.parentFolder) : props.projectName;
    const primaryProjectFile = await createDefaultMarkdownFile(v, props.parentFolder, projectName);
    const getScopedStateByName = parentIsProject ? getProjectPageStateByName : getStateByName;
    const defaultStateName = parentIsProject
        ? globals.plugin.settings.defaultProjectPageState
        : globals.plugin.settings.defaultState;

    if(props.stateName) {
        const stateSettings = getScopedStateByName(props.stateName);
        if(stateSettings) {
            await setFileState(primaryProjectFile, stateSettings);
        }
    } else if(defaultStateName) {
        const stateSettings = getScopedStateByName(defaultStateName);
        if(stateSettings) {
            await setFileState(primaryProjectFile, stateSettings);
        }
    }

    return primaryProjectFile;
}


export async function createFolder(folderPath: string): Promise<TFolder> {
    const {plugin} = getGlobals();
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
    const {folderpath} = parseFilepath(file.path);
    let newPathAndName = safeName;

    if(file.extension) {
        newPathAndName = `${safeName}.${file.extension}`;
    }

    if (folderpath) {
        newPathAndName = `${folderpath}/${newPathAndName}`;
    }

    try {
        await file.vault.rename(file, newPathAndName);
        return newPathAndName;
    } catch(e) {
        console.log(e)
        return null;
    }
}

export async function renameTFolder(folder: TFolder, safeName: string): Promise<string|null> {
    const { folderpath } = parseFilepath(folder.path);
    let newPathAndName = safeName;
    if (folderpath) {
        newPathAndName = `${folderpath}/${safeName}`;
    }

    try {
        await folder.vault.rename(folder, newPathAndName);
        return newPathAndName;
    } catch(e) {
        console.log(e)
        return null;
    }
}

/**
 * Moves a file into the target folder. Returns the new path on success, null on failure.
 */
export async function moveFileToFolder(file: TFile, targetFolder: TFolder): Promise<string | null> {
    const newPath = targetFolder.path ? `${targetFolder.path}/${file.name}` : file.name;
    try {
        await file.vault.rename(file, newPath);
        return newPath;
    } catch (e) {
        console.log(e);
        return null;
    }
}

/**
 * Creates a project from a note that is outside a project: creates a new project folder,
 * moves the note into it, marks it as a project, adds a second page, and returns that new page.
 */
export async function createProjectFromNote(note: TFile, parentFolder: TFolder): Promise<TFile> {
    const vault = parentFolder.vault;
    const baseName = sanitizeFileFolderName(note.basename);
    const noteStateSettings = getFileStateSettings(note);
    const notePrioritySettings = getFilePrioritySettings(note);

    if (!baseName) {
        throw new Error('Note basename is empty after sanitization');
    }

    let folderName = baseName;
    let version = 1;
    let newFolderPath = parentFolder.path ? `${parentFolder.path}/${folderName}` : folderName;

    while (vault.getAbstractFileByPath(newFolderPath)) {
        version += 1;
        folderName = `${baseName} (${version})`;
        newFolderPath = parentFolder.path ? `${parentFolder.path}/${folderName}` : folderName;
    }

    const newFolder = await createFolder(newFolderPath);
    const moved = await moveFileToFolder(note, newFolder);
    if (!moved) {
        throw new Error(`Failed to move note into project folder`);
    }

    // Rename the moved note to "Page 1" so the second page can be "Page 2"
    await renameTFile(note, 'Page 1');

    await setFolderAsProject(newFolder);

    if (noteStateSettings) {
        await setFolderState(newFolder, noteStateSettings);
    }

    if (notePrioritySettings) {
        await setFolderPriority(newFolder, notePrioritySettings);
    }

    await setFileState(note, null);
    await setFilePriority(note, null);

    const secondPage = await createProject({
        parentFolder: newFolder,
        projectName: 'Untitled',
    });

    return secondPage;
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
    const filename = sanitizeFileFolderName(title);

    // @ts-ignore
    return await createNewMarkdownFile(vault, folder, filename);
}

/**
 * Creates an empty markdown file and returns it. If the file exists already it creates a new one and appends a version number.
 * Don't include file extension unless it should appear in the note's title.
 */
async function createNewMarkdownFile(
    vault: Vault,
    folder: TFolder,
    filename: string,
    writeOptions?: DataWriteOptions,
    version: number = 1
): Promise<TFile | null> {
    let pathAndVersionedBasename: string;
    let fileRef: TFile | null = null;

    try {
        if (version === 1) {
            pathAndVersionedBasename = `${folder.path}/${filename}`;
        } else {
            pathAndVersionedBasename = `${folder.path}/${filename} (${version})`;
        }

        if (await vault.adapter.exists(`${pathAndVersionedBasename}.md`)) {
            fileRef = await createNewMarkdownFile(
                vault,
                folder,
                filename,
                writeOptions,
                version + 1
            );
        } else {
            fileRef = await vault.create(`${pathAndVersionedBasename}.md`, '', writeOptions);
        }
    } catch (reason) {
        console.log(reason);
    }

    return fileRef;
}


export async function getFolderSettings(vault: Vault, folder: TFolder) : Promise<FolderSettings> {
    let settingsFile: TFile | null = null;
    let folderSettings: FolderSettings = JSON.parse(JSON.stringify(DEFAULT_FOLDER_SETTINGS));
    const filename = `${folder.path}/${FOLDER_SETTINGS_FILENAME}`;

    try {
        settingsFile = vault.getFileByPath(filename);
    } catch (e) {}

    if(settingsFile) {
        try {
            folderSettings = normalizeFolderSettings({
                ...folderSettings,
                ...JSON.parse( await vault.read(settingsFile) )
            } as FolderSettings & { _description?: string; stateName?: string; priorityName?: string });
        } catch(e) {
            console.log(`Error reading folder settings`, e);
            console.log(`Creating empty settings`);
        }
    }
	
	return folderSettings;
}

export async function saveFolderSettings(vault: Vault, folder: TFolder, settings: FolderSettings) {
    let settingsFile: TFile | null = null;
    const filename = `${folder.path}/${FOLDER_SETTINGS_FILENAME}`;
    const normalizedFolderSettings = normalizeFolderSettings(settings as FolderSettings & { _description?: string; stateName?: string; priorityName?: string });

    try {
        settingsFile = vault.getFileByPath(filename);
    } catch (e) {}

    if(settingsFile) {
        try {
            await vault.modify(settingsFile, JSON.stringify(normalizedFolderSettings, null, 2) );
        } catch(e) {
            console.log(`Error writing to folder settings file`, e);
        }

    } else {
        try {
            await vault.create(filename, JSON.stringify(normalizedFolderSettings, null, 2));
        } catch(e) {
            console.log(`Error creating folder settings file`, e);
        }
    }
}


export async function hideFolder(folder: TFolder): Promise<void> {
    const {plugin} = getGlobals();
    const folderSettings = await getFolderSettings(plugin.app.vault, folder);
    folderSettings.isHidden = true;
    saveFolderSettings(plugin.app.vault, folder, folderSettings);
}

export async function unhideFolder(folder: TFolder): Promise<void> {
    const {plugin} = getGlobals();
    const folderSettings = await getFolderSettings(plugin.app.vault, folder);
    delete folderSettings.isHidden;
    saveFolderSettings(plugin.app.vault, folder, folderSettings);
}

export async function setFolderAsProject(folder: TFolder): Promise<void> {
    const {plugin} = getGlobals();
    const folderSettings = await getFolderSettings(plugin.app.vault, folder);
    folderSettings.isProject = true;
    delete folderSettings.state;
    delete folderSettings.priority;
    await saveFolderSettings(plugin.app.vault, folder, folderSettings);
    plugin.refreshFileDependants();
}

export async function setFolderAsFolder(folder: TFolder): Promise<void> {
    const {plugin} = getGlobals();
    const folderSettings = await getFolderSettings(plugin.app.vault, folder);
    folderSettings.isProject = false;
    delete folderSettings.state;
    delete folderSettings.priority;
    await saveFolderSettings(plugin.app.vault, folder, folderSettings);
    plugin.refreshFileDependants();
}

export async function setFolderState(folder: TFolder, stateSettings: StateSettings | null): Promise<void> {
    const {plugin} = getGlobals();
    const folderSettings = await getFolderSettings(plugin.app.vault, folder);
    if (stateSettings === null) {
        delete folderSettings.state;
    } else {
        folderSettings.state = stateSettings.name;
    }
    await saveFolderSettings(plugin.app.vault, folder, folderSettings);
    plugin.refreshFileDependants();
}

export async function setFolderPriority(folder: TFolder, prioritySettings: PrioritySettings | null): Promise<void> {
    const {plugin} = getGlobals();
    const folderSettings = await getFolderSettings(plugin.app.vault, folder);
    const currentPriorityName = folderSettings.priority ?? null;

    if (prioritySettings === null) {
        delete folderSettings.priority;
    } else if (currentPriorityName === prioritySettings.name) {
        delete folderSettings.priority;
    } else {
        folderSettings.priority = prioritySettings.name;
    }
    await saveFolderSettings(plugin.app.vault, folder, folderSettings);
    plugin.refreshFileDependants();
}

export async function getFolderStateName(folder: TFolder): Promise<string | null> {
    const {plugin} = getGlobals();
    const folderSettings = await getFolderSettings(plugin.app.vault, folder);
    return folderSettings.state ?? null;
}

export async function getFolderPriorityName(folder: TFolder): Promise<string | null> {
    const {plugin} = getGlobals();
    const folderSettings = await getFolderSettings(plugin.app.vault, folder);
    return folderSettings.priority ?? null;
}

export async function getFolderPrioritySettings(folder: TFolder): Promise<PrioritySettings | null> {
    const priorityName = await getFolderPriorityName(folder);
    if (!priorityName) return null;
    return getPriorityByName(priorityName);
}

