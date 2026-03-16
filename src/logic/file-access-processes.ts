import { Plugin, TFile } from "obsidian";
import { getGlobals } from "./stores";
import { RenameFileModal } from "src/modals/rename-file-modal/rename-file-modal";

///////////
///////////

const pendingTitleSelectPaths = new Set<string>();

const EDIT_FILE_TITLE_COMMAND_IDS = [
    "editor:rename-file",
    "file-explorer:rename-file",
    "workspace:rename-file",
] as const;

export function openFileInSameLeaf(file: TFile) {
    const {plugin} = getGlobals();
    let { workspace } = plugin.app;
    let leaf = workspace.getMostRecentLeaf();

    if(!leaf) {
        leaf = workspace.getLeaf();
    }

    leaf.openFile(file);
}

export async function openFileInBackgroundTab(file: TFile) {
    const {plugin} = getGlobals();
    let { workspace } = plugin.app;
    let curLeaf = workspace.getMostRecentLeaf();
    let newLeaf = workspace.getLeaf(true);

    // Open new tab
    await newLeaf.openFile(file);

    // switch immediately back to previous tab
    if(curLeaf) workspace.setActiveLeaf(curLeaf);
}

/**
 * Opens a newly created page and schedules the filename to be activated for renaming when the file opens.
 * Tries Obsidian's native "Edit file title" command first; falls back to RenameFileModal.
 */
export function openNewPageAndSelectTitle(file: TFile) {
    pendingTitleSelectPaths.add(file.path);
    openFileInSameLeaf(file);
}

function tryExecuteEditFileTitleCommand(plugin: Plugin): boolean {
    const appWithCommands = plugin.app as {
        commands?: {
            commands?: Record<string, { name?: string }>;
            executeCommandById?: (id: string) => void;
        };
    };
    const commands = appWithCommands.commands;
    const executeCommandById = commands?.executeCommandById;
    if (!executeCommandById) return false;

    if (commands?.commands) {
        const editTitleId = Object.entries(commands.commands).find(
            ([, cmd]) =>
                cmd?.name?.toLowerCase().includes("edit") &&
                cmd?.name?.toLowerCase().includes("title")
        )?.[0];
        if (editTitleId) {
            try {
                executeCommandById(editTitleId);
                return true;
            } catch {
                return false;
            }
        }
    }

    for (const id of EDIT_FILE_TITLE_COMMAND_IDS) {
        try {
            executeCommandById(id);
            return true;
        } catch {
            continue;
        }
    }
    return false;
}

/**
 * Registers a file-open handler that activates the filename for renaming when a newly created page opens.
 * Tries Obsidian's "Edit file title" command; falls back to RenameFileModal.
 * Call from plugin onload.
 */
export function registerFileOpenSelectTitleHandler(plugin: Plugin) {
    plugin.registerEvent(
        plugin.app.workspace.on('file-open', (openedFile: TFile | null) => {
            if (!openedFile || !pendingTitleSelectPaths.has(openedFile.path)) return;

            pendingTitleSelectPaths.delete(openedFile.path);

            setTimeout(() => {
                const activeFile = plugin.app.workspace.getActiveFile();
                if (activeFile?.path !== openedFile.path) return;

                const commandSucceeded = tryExecuteEditFileTitleCommand(plugin);
                if (!commandSucceeded) {
                    new RenameFileModal({ file: openedFile }).open();
                }
            }, 50);
        })
    );
}
