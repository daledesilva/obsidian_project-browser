import { Menu, Notice, TFile } from "obsidian";
import { openFileInBackgroundTab, openFileInSameLeaf } from "src/logic/file-access-processes";
import { deleteFileWithConfirmation, renameFileOrFolderInPlace } from "src/logic/file-processes";
import { getFileStateSettings, setFileRawState } from "src/logic/frontmatter-processes";
import { getGlobals } from "src/logic/stores";
import { RenameFileModal } from "src/modals/rename-file-modal/rename-file-modal";
import { PluginStateSettings_0_1_0 } from "src/types/plugin-settings0_1_0";

////////
////////

interface registerFileContextMenuProps {
    fileButtonEl: HTMLElement,
    file: TFile,
    onFileChange: Function,
}

export function registerFileContextMenu(props: registerFileContextMenuProps) {
    const {plugin} = getGlobals();
    const fileRawState = getFileStateSettings(props.file);
    const folder = props.file.parent;

    const visibleStates = JSON.parse(JSON.stringify(plugin.settings.states.visible));
    visibleStates.reverse();
    const hiddenStates = JSON.parse(JSON.stringify(plugin.settings.states.hidden));
    hiddenStates.reverse();

    props.fileButtonEl.addEventListener('contextmenu', function(event) {
        
        // Prevent container divs opening their context menus
        event.stopPropagation();
        
        // Close other menus (Only works on iOS for some reason, but also only needed there)
        document.body.click();
        
        const menu = new Menu();
        menu.addItem((item) => {
            item.setTitle('Open in new tab');
            item.onClick(() => {
                openFileInBackgroundTab(props.file)
            });
        });
        menu.addSeparator();
        visibleStates.forEach( (stateSettings: PluginStateSettings_0_1_0) => {
            menu.addItem((item) => {
                item.setTitle(stateSettings.name);
                if(stateSettings.name === fileRawState) item.setChecked(true);
                item.onClick(() => {
                    setFileRawState(props.file, stateSettings);
                    props.onFileChange();
                });
            });
        })
        menu.addSeparator();
        hiddenStates.forEach( (stateSettings: PluginStateSettings_0_1_0) => {
            menu.addItem((item) => {
                item.setTitle(stateSettings.name);
                if(stateSettings.name === fileRawState) item.setChecked(true);
                item.onClick(() => {
                    setFileRawState(props.file, stateSettings);
                    props.onFileChange();
                })
            });
        })
        menu.addSeparator();
        menu.addItem((item) =>
            item.setTitle("Rename")
            .onClick(() => {
                // renameFileOrFolderInPlace(props.file, props.noteEl);
                new RenameFileModal({
                    file: props.file,
                }).showModal()
                props.onFileChange();
            })
        );
        menu.addItem((item) =>
            item.setTitle("Delete")
            .onClick(() => {
                deleteFileWithConfirmation(props.file);
                props.onFileChange();
            })
        );
        menu.showAtMouseEvent(event);

    }, false);


}