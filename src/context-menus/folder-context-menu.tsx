import { Menu, TFolder } from "obsidian";
import { deleteFolderWithConfirmation } from "src/logic/file-processes";
import { getGlobals } from "src/logic/stores";
import { RenameFolderModal } from "src/modals/rename-folder-modal/rename-folder-modal";
import { getFolderSettings, hideFolder, unhideFolder } from "src/utils/file-manipulation";

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
