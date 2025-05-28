import { Menu, TFolder } from "obsidian";
import { openFileInSameLeaf } from "src/logic/file-access-processes";
import { deleteFolderWithConfirmation } from "src/logic/file-processes";
import { getGlobals } from "src/logic/stores";
import { createProject } from "src/utils/file-manipulation";

////////
////////

export function registerStateSectionContextMenu(el: HTMLElement, baseFolder: TFolder, stateName: string, commands: {openFile?: Function}) {
    const {plugin} = getGlobals();
    
    el.addEventListener('contextmenu', function(event) {

        // Prevent container divs opening their context menus
        event.stopPropagation();

        // Close other menus (Only works on iOS for some reason, but also only needed there)
        document.body.click();

        const menu = new Menu();
        menu.addItem((item) =>
            item.setTitle("New note")
                .onClick(async () => {
                    const newFile = await createProject({
                        parentFolder: baseFolder,
                        projectName: 'Untitled',
                        stateName: stateName
                    });
                    // TODO: This delay should be set as a constant globally to guarantee it's longer than other delay of file appear
                    setTimeout( () => openFileInSameLeaf(newFile), 500);
                })
        );
        menu.showAtMouseEvent(event);

    }, false);

}