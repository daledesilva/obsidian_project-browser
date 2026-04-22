import { Menu, TFolder } from "obsidian";
import { deleteFolderWithConfirmation } from "src/logic/file-processes";
import { revealInProjectBrowser } from "src/logic/reveal-in-project-browser";
import { getGlobals } from "src/logic/stores";
import { RenameFolderModal } from "src/modals/rename-folder-modal/rename-folder-modal";
import { getFolderSettings, hideFolder, unhideFolder, setFolderAsProject, setFolderAsFolder } from "src/utils/file-manipulation";

////////
////////

interface registerFolderContextMenuProps {
    folderBtnEl: HTMLElement,
    folder: TFolder
    onFolderChange: Function,
}

export function registerFolderContextMenu(props: registerFolderContextMenuProps) {

    props.folderBtnEl.addEventListener('contextmenu', async (event) => {
        const {plugin} = getGlobals();

        // Prevent container divs opening their context menus
        event.stopPropagation();
        
        const folderSettings = await getFolderSettings(plugin.app.vault, props.folder)

        let folderIsInsideAProject = false;
        let ancestor = props.folder.parent;
        while (ancestor) {
            const ancestorSettings = await getFolderSettings(plugin.app.vault, ancestor);
            if (ancestorSettings.isProject) {
                folderIsInsideAProject = true;
                break;
            }
            ancestor = ancestor.parent ?? null;
        }

        // Close other menus (Only works on iOS for some reason, but also only needed there)
        document.body.click();
        
        const menu = new Menu();
        menu.addItem((item) =>
            item.setTitle("Set as launch folder")
                .onClick(() => {
                    plugin.settings.access.launchFolder = props.folder.path;
                    plugin.saveSettings();
                })
        );
        menu.addItem((item) =>
            item.setTitle("Reveal in Project Browser")
                .onClick(() => {
                    void revealInProjectBrowser(props.folder);
                })
        );
        if (folderSettings.isProject) {
            menu.addItem((item) =>
                item.setTitle("Convert to folder")
                    .onClick(async () => {
                        await setFolderAsFolder(props.folder);
                        props.onFolderChange();
                    })
            );
        } else {
            const convertToProjectLabel = folderIsInsideAProject ? 'Convert to subproject' : 'Convert to project';
            menu.addItem((item) =>
                item.setTitle(convertToProjectLabel)
                    .onClick(async () => {
                        await setFolderAsProject(props.folder);
                        props.onFolderChange();
                    })
            );
        }
        if(folderSettings.isHidden) {
            menu.addItem((item) =>
                item.setTitle("Unhide folder")
                    .onClick(async () => {
                        await unhideFolder(props.folder);
                        props.onFolderChange();
                    })
            );
        } else {
            menu.addItem((item) =>
                item.setTitle("Hide folder")
                    .onClick(async () => {
                        await hideFolder(props.folder);
                        props.onFolderChange();
                    })
            );
        }
        menu.addSeparator();
        menu.addItem((item) =>
            item.setTitle("Rename folder")
                .onClick(() => {
                    // renameFileOrFolderInPlace(folder, folderBtnEl)
                    new RenameFolderModal({
                        folder: props.folder,
                    }).showModal()
                })
        );
        menu.addItem((item) =>
            item.setTitle("Delete folder")
                .onClick(() => {
                    deleteFolderWithConfirmation(props.folder)
                })
        );
        menu.showAtMouseEvent(event);

    }, false);

}
