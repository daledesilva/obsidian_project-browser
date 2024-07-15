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

export function registerNoteContextMenu(plugin: ProjectBrowserPlugin, el: HTMLElement, file: TFile) {
    const fileState = getFileState(plugin, file);

    const folder = file.parent;

    el.addEventListener('contextmenu', function(event) {
                
        const menu = new Menu();

        plugin?.settings.states.visible.forEach( (state) => {
            menu.addItem((item) => {
                item.setTitle(state.name);
                if(state.name === fileState) item.setChecked(true);
                item.onClick(() => {
                    setFileState(plugin, file, state.name);
                });
            });
        })

        menu.addSeparator();

        plugin?.settings.states.hidden.forEach( (state) => {
            menu.addItem((item) => {
                item.setTitle(state.name);
                if(state.name === fileState) item.setChecked(true);
                item.onClick(() => {
                    setFileState(plugin, file, state.name);
                })
            });
        })

        menu.addSeparator();

        menu.addItem((item) =>
            item.setTitle("Delete note")
            .onClick(() => deleteFileWithConfirmation(plugin, file))
        );

        menu.showAtMouseEvent(event);

    }, false);


}