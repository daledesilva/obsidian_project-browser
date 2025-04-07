import { useAtomValue } from "jotai";
import { Menu, TFolder } from "obsidian";
import { EventHandler } from "react";
import { openFileInSameLeaf } from "src/logic/file-access-processes";
import { deleteFolderWithConfirmation } from "src/logic/file-processes";
import { getGlobals, getShowHiddenFolders, hideHiddenFolders, unhideHiddenFolders } from "src/logic/stores";
import { NewFolderModal } from "src/modals/new-folder-modal/new-folder-modal";
import { createProject } from "src/utils/file-manipulation";

////////
////////

export function registerCardBrowserContextMenu(el: HTMLElement, baseFolder: TFolder, commands: {
    openFile: Function,
    getCurFolder: () => TFolder,
}) {
    const {plugin} = getGlobals();
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
                    const newFile = await createProject({
                        parentFolder: commands.getCurFolder(),
                        projectName: 'Untitled'
                    });
                    setTimeout( () => openFileInSameLeaf(newFile), 500);
                })
        );
        menu.addItem((item) =>
            item.setTitle("New folder")
                .onClick(() => {
                    new NewFolderModal({
                        baseFolder: commands.getCurFolder(),
                    }).showModal()
                })
        );
        menu.showAtMouseEvent(e);

    }

}