import { Menu, TFolder } from "obsidian";
import { openNewPageAndSelectTitle } from "src/logic/file-access-processes";
import { getGlobals, getShowHiddenFolders, hideHiddenFolders, unhideHiddenFolders } from "src/logic/stores";
import { NewFolderModal } from "src/modals/new-folder-modal/new-folder-modal";
import { createProject, createSubproject, getFolderSettings, setFolderAsProject, setFolderAsFolder } from "src/utils/file-manipulation";

////////
////////

export function registerCardBrowserContextMenu(el: HTMLElement, baseFolder: TFolder, commands: {
    openFile: Function,
    getCurFolder: () => TFolder,
}) {
    const {plugin} = getGlobals();
    el.addEventListener('contextmenu', contextMenuHandler);
    
    async function contextMenuHandler(e) {
        // Prevent container divs opening their context menus
        e.stopPropagation();

        // Close other menus (Only works on iOS for some reason, but also only needed there)
        document.body.click();

        const curFolder = commands.getCurFolder();
        const folderSettings = await getFolderSettings(plugin.app.vault, curFolder);
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
                    plugin.settings.access.launchFolder = curFolder.path;
                    void plugin.saveSettings();
                })
        );
        if (folderSettings.isProject) {
            menu.addItem((item) =>
                item.setTitle("Convert to folder")
                    .onClick(async () => {
                        await setFolderAsFolder(curFolder);
                    })
            );
        } else {
            menu.addItem((item) =>
                item.setTitle("Convert to project")
                    .onClick(async () => {
                        await setFolderAsProject(curFolder);
                    })
            );
        }
        menu.addSeparator();
        const newFileLabel = folderSettings.isProject ? 'New page' : 'New project';
        menu.addItem((item) =>
            item.setTitle(newFileLabel)
                .onClick(async () => {
                    const newFile = await createProject({
                        parentFolder: commands.getCurFolder(),
                        projectName: 'Untitled'
                    });
                    window.setTimeout( () => openNewPageAndSelectTitle(newFile), 500);
                })
        );
        if (folderSettings.isProject) {
            menu.addItem((item) =>
                item.setTitle("New subproject")
                    .onClick(async () => {
                        const newFile = await createSubproject(commands.getCurFolder());
                        window.setTimeout( () => openNewPageAndSelectTitle(newFile), 500);
                    })
            );
        }
        menu.addItem((item) =>
            item.setTitle("New folder")
                .onClick(() => {
                    void new NewFolderModal({
                        baseFolder: commands.getCurFolder(),
                    }).showModal()
                })
        );
        menu.showAtMouseEvent(e);

    }

}