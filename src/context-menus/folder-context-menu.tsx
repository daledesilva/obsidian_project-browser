import { Menu, TFolder } from "obsidian";
import { deleteFolderWithConfirmation, renameFileOrFolderInPlace, renameFolderInPlace } from "src/logic/file-processes";
import ProjectBrowserPlugin from "src/main";
import { RenameFolderModal } from "src/modals/rename-folder-modal/rename-folder-modal";

////////
////////

export function registerFolderContextMenu(plugin: ProjectBrowserPlugin, folderBtnEl: HTMLElement, folder: TFolder) {
    
    folderBtnEl.addEventListener('contextmenu', function(event) {

        // Prevent container divs opening their context menus
        event.stopPropagation();

        // Close other menus (Only works on iOS for some reason, but also only needed there)
        document.body.click();
        
        const menu = new Menu();
        menu.addItem((item) =>
            item.setTitle("Rename folder")
                .onClick(() => {
                    // renameFileOrFolderInPlace(folder, folderBtnEl)
                    new RenameFolderModal({
                        plugin,
                        folder,
                    }).showModal()
                })
        );
        menu.addItem((item) =>
            item.setTitle("Delete folder")
                .onClick(() => {
                    deleteFolderWithConfirmation(plugin, folder)
                })
        );
        menu.showAtMouseEvent(event);

    }, false);

}
