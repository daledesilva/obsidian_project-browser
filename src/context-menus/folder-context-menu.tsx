import { Menu, TFolder } from "obsidian";
import { deleteFolderWithConfirmation, renameFileOrFolderInPlace, renameFolderInPlace } from "src/logic/file-processes";
import ProjectBrowserPlugin from "src/main";

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
                    console.log('el', folderBtnEl);
                    renameFileOrFolderInPlace(folder, folderBtnEl)
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
