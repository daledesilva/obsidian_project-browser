import { Menu, Notice, TFile } from "obsidian";
import * as React from "react";
import { deleteFileWithConfirmation, renameFileOrFolderInPlace } from "src/logic/file-processes";
import { refreshFolderReference } from "src/logic/folder-processes";
import { getFileState, setFileState } from "src/logic/frontmatter-processes";
import { getGlobals } from "src/logic/stores";
import { ConfirmationModal } from "src/modals/confirmation-modal/confirmation-modal";
import { RenameFileModal } from "src/modals/rename-file-modal/rename-file-modal";
import { PluginContext } from "src/utils/plugin-context";
import { CARD_BROWSER_VIEW_TYPE, newProjectBrowserLeaf } from "src/views/card-browser-view/card-browser-view";

////////
////////

interface registerFileContextMenuProps {
    fileButtonEl: HTMLElement,
    file: TFile,
    onFileChange: Function,
}

export function registerFileContextMenu(props: registerFileContextMenuProps) {
    const {plugin} = getGlobals();
    const fileState = getFileState(props.file);
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
        visibleStates.forEach( (state) => {
            menu.addItem((item) => {
                item.setTitle(state.name);
                if(state.name === fileState) item.setChecked(true);
                item.onClick(() => {
                    setFileState(props.file, state.name);
                    props.onFileChange();
                });
            });
        })
        menu.addSeparator();
        hiddenStates.forEach( (state) => {
            menu.addItem((item) => {
                item.setTitle(state.name);
                if(state.name === fileState) item.setChecked(true);
                item.onClick(() => {
                    setFileState(props.file, state.name);
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