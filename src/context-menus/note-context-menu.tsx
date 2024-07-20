import { Menu, Notice, TFile } from "obsidian";
import * as React from "react";
import { deleteFileWithConfirmation } from "src/logic/file-processes";
import { refreshFolderReference } from "src/logic/folder-processes";
import { getFileState, setFileState } from "src/logic/frontmatter-processes";
import ProjectBrowserPlugin from "src/main";
import { ConfirmationModal } from "src/modals/confirmation-modal/confirmation-modal";
import { PluginContext } from "src/utils/plugin-context";
import { CARD_BROWSER_VIEW_TYPE, newProjectBrowserLeaf } from "src/views/card-browser-view/card-browser-view";

////////
////////

interface registerNoteContextMenuProps {
    plugin: ProjectBrowserPlugin,
    noteEl: HTMLElement,
    file: TFile,
}

export function registerNoteContextMenu(props: registerNoteContextMenuProps) {
    const fileState = getFileState(props.plugin, props.file);
    const folder = props.file.parent;

    props.noteEl.addEventListener('contextmenu', function(event) {
                
        const menu = new Menu();

        props.plugin.settings.states.visible.forEach( (state) => {
            menu.addItem((item) => {
                item.setTitle(state.name);
                if(state.name === fileState) item.setChecked(true);
                item.onClick(() => {
                    setFileState(props.plugin, props.file, state.name);
                    props.prepForVisualUpdate();
                });
            });
        })

        menu.addSeparator();

        props.plugin.settings.states.hidden.forEach( (state) => {
            menu.addItem((item) => {
                item.setTitle(state.name);
                if(state.name === fileState) item.setChecked(true);
                item.onClick(() => {
                    setFileState(props.plugin, props.file, state.name);
                    props.prepForVisualUpdate();
                })
            });
        })

        menu.addSeparator();

        menu.addItem((item) =>
            item.setTitle("Delete note")
            .onClick(() => {
                deleteFileWithConfirmation(props.plugin, props.file);
                props.prepForVisualUpdate();
            })
        );

        menu.showAtMouseEvent(event);

    }, false);


}