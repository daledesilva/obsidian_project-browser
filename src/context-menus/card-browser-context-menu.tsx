import { Menu, TFolder } from "obsidian";
import { deleteFolderWithConfirmation } from "src/logic/file-processes";
import ProjectBrowserPlugin from "src/main";
import { NewFolderModal } from "src/modals/new-folder-modal/new-folder-modal";

////////
////////

export function registerCardBrowserContextMenu(plugin: ProjectBrowserPlugin, el: HTMLElement, baseFolder: TFolder) {
    
    el.addEventListener('contextmenu', function(event) {
                
        const menu = new Menu();

        menu.addItem((item) =>
            item.setTitle("New folder")
                .onClick(() => new NewFolderModal({
                    plugin,
                    baseFolder,
                }).showModal())
        );

        menu.showAtMouseEvent(event);

    }, false);

}