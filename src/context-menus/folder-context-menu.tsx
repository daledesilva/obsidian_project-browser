import { Menu, Notice, TFile, TFolder } from "obsidian";
import * as React from "react";
import { deleteFileWithConfirmation, deleteFolderWithConfirmation } from "src/logic/file-processes";
import { getFileState, setFileState } from "src/logic/frontmatter-processes";
import ProjectBrowserPlugin from "src/main";

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


export function registerFolderContextMenu(plugin: ProjectBrowserPlugin, el: HTMLElement, folder: TFolder) {
    
    el.addEventListener('contextmenu', function(event) {
                
        const menu = new Menu();

        menu.addItem((item) =>
            item.setTitle("Delete folder")
            .onClick(() => deleteFolderWithConfirmation(plugin, folder))
        );

        menu.showAtMouseEvent(event);

    }, false);


}