import { Menu, Notice, TFile } from "obsidian";
import * as React from "react";
import { refreshFolderReference } from "src/logic/folder-processes";
import { getFileState, setFileState } from "src/logic/frontmatter-processes";
import ProjectBrowserPlugin from "src/main";
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
                    setFileState(plugin, file, state.name)
                    setTimeout(() => {
                        console.log('folder', folder);
                        
                        let { workspace } = plugin.app;
                        let leaf = workspace.getMostRecentLeaf();
                        
                        // if(leaf) {
                        //     leaf.setViewState({
                        //         type: CARD_BROWSER_VIEW_TYPE,
                        //         // state: leaf.getViewState(),
                        //     });
                        // }

                        // leaf?.view.load();

                        // leaf?.view.unload();
                        // leaf?.view.load();

                        // newProjectBrowserLeaf(plugin)

                    }, 1000)
                });
            });
        })

        menu.addSeparator();

        plugin?.settings.states.hidden.forEach( (state) => {
            menu.addItem((item) => {
                item.setTitle(state.name);
                if(state.name === fileState) item.setChecked(true);
                item.onClick(() => {
                    setFileState(plugin, file, state.name)
                    setTimeout(() => {
                        if(folder) refreshFolderReference(folder);
                    }, 1000)
                })
            });
        })

        menu.addSeparator();

        menu.addItem((item) =>
            item.setTitle("Delete note")
            .onClick(() => {
                new Notice("Deleted");
                if(folder) refreshFolderReference(folder);
            })
        );

        


        menu.showAtMouseEvent(event);

    }, false);


}