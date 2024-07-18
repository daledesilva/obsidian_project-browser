import { Menu, TFolder } from "obsidian";
import { deleteFolderWithConfirmation } from "src/logic/file-processes";
import ProjectBrowserPlugin from "src/main";
import { NewFolderModal } from "src/modals/new-folder-modal/new-folder-modal";
import { createProject } from "src/utils/file-manipulation";

////////
////////

export function registerStateSectionContextMenu(plugin: ProjectBrowserPlugin, el: HTMLElement, baseFolder: TFolder, state: string, commands: {openFile: Function}) {
    
    el.addEventListener('contextmenu', function(event) {
        
        const menu = new Menu();

        menu.addItem((item) =>
            item.setTitle("New note")
                .onClick(async () => {
                    const newFile = await createProject(baseFolder, 'Untitled', {
                        plugin,
                        state,
                    });
                    // TODO: This delay should be set as a constant globally to guarantee it's longer than other delay of file appear
                    setTimeout( () => commands.openFile(newFile), 500);
                })
        );

        menu.showAtMouseEvent(event);

    }, false);

}