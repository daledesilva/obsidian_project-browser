import { Menu, TFolder } from "obsidian";
import { deleteFolderWithConfirmation } from "src/logic/file-processes";
import ProjectBrowserPlugin from "src/main";
import { NewFolderModal } from "src/modals/new-folder-modal/new-folder-modal";
import { createProject } from "src/utils/file-manipulation";

////////
////////

export function registerCardBrowserContextMenu(plugin: ProjectBrowserPlugin, el: HTMLElement, baseFolder: TFolder, commands: {openFile: Function}) {
    
    el.addEventListener('contextmenu', function(event) {
        
        const menu = new Menu();

        menu.addItem((item) =>
            item.setTitle("New note")
                .onClick(async () => {
                    const newFile = await createProject(baseFolder, 'Untitled');
                    commands.openFile(newFile);
                })
        );

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