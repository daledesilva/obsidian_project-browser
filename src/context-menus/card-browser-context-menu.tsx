import { useAtomValue } from "jotai";
import { Menu, TFolder } from "obsidian";
import { EventHandler } from "react";
import { deviceMemoryStore, getShowHiddenFolders, hideHiddenFolders, unhideHiddenFolders } from "src/logic/device-memory";
import { deleteFolderWithConfirmation } from "src/logic/file-processes";
import ProjectBrowserPlugin from "src/main";
import { NewFolderModal } from "src/modals/new-folder-modal/new-folder-modal";
import { createProject } from "src/utils/file-manipulation";

////////
////////

export function registerCardBrowserContextMenu(plugin: ProjectBrowserPlugin, el: HTMLElement, baseFolder: TFolder, commands: {
    openFile: Function,
    getCurFolder: () => TFolder,
}) {
    el.addEventListener('contextmenu', contextMenuHandler);
    
    function contextMenuHandler(e) {
        
        // Prevent container divs opening their context menus
        e.stopPropagation();

        // Close other menus (Only works on iOS for some reason, but also only needed there)
        document.body.click();

        const showHiddenFolders = getShowHiddenFolders();

        const menu = new Menu();
        if(showHiddenFolders) {
            menu.addItem((item) =>
                item.setTitle("Hide hidden folders")
                    .onClick(() => {
                        hideHiddenFolders();
                    })
            );
        } else {
            menu.addItem((item) =>
                item.setTitle("Show hidden folders")
                    .onClick(() => {
                        unhideHiddenFolders();
                    })
            );
        }
        menu.addItem((item) =>
            item.setTitle("Set as launch folder")
                .onClick(() => {
                    plugin.settings.access.launchFolder = commands.getCurFolder().path;
                    plugin.saveSettings();
                })
        );
        menu.addSeparator();
        menu.addItem((item) =>
            item.setTitle("New note")
                .onClick(async () => {
                    const newFile = await createProject(commands.getCurFolder(), 'Untitled');
                    setTimeout( () => commands.openFile(newFile), 500);
                })
        );
        menu.addItem((item) =>
            item.setTitle("New folder")
                .onClick(() => {
                    new NewFolderModal({
                        plugin,
                        baseFolder: commands.getCurFolder(),
                    }).showModal()
                })
        );
        menu.showAtMouseEvent(e);

    }

}