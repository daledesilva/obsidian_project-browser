import { Menu, TFolder } from "obsidian";
import { deleteFolderWithConfirmation } from "src/logic/file-processes";
import ProjectBrowserPlugin from "src/main";

////////
////////

export function registerFolderContextMenu(plugin: ProjectBrowserPlugin, el: HTMLElement, folder: TFolder) {
    
    el.addEventListener('contextmenu', function(event) {

        // Prevent container divs opening their context menus
        event.stopPropagation();

        // Close other menus (Only works on iOS for some reason, but also only needed there)
        document.body.click();
        
        const menu = new Menu();
        menu.addItem((item) =>
            item.setTitle("Delete folder")
                .onClick(() => {
                    deleteFolderWithConfirmation(plugin, folder)
                })
        );
        menu.showAtMouseEvent(event);

    }, false);

}
