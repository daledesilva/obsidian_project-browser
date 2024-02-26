import './markdown-view-mods.scss';
import ProjectCardsPlugin from "src/main";
import { FileView, ItemView, MarkdownView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import CardBrowser from "src/components/card-browser/card-browser";
import { createContext } from 'react';
import { PluginContext } from "src/utils/plugin-context";
import { getFileState } from 'src/logic/read-files';
import { StateMenu } from 'src/components/state-menu/state-menu';

//////////
//////////

const stateMenuContainerClassName = 'project-cards_state-menu-container';

//////////

export function registerMarkdownViewMods(plugin: ProjectCardsPlugin) {
    // NOTE: Opening a different file in the same leaf counts as an active-leaf-change, but the header get replaced, it updates.
    plugin.registerEvent(plugin.app.workspace.on('active-leaf-change', () => {
		const viewType = plugin.app.workspace.getLeaf().view.getViewType();
		if(viewType === 'markdown') {
            // addMarkdownViewHeader(plugin);
            addStateHeader(plugin);
        }
	}));
}

function addStateHeader(plugin: ProjectCardsPlugin) {
    let { workspace } = plugin.app;
    let leaf = workspace.getActiveViewOfType(ItemView)?.leaf;
    if(!leaf) return;

    const activeFile = workspace.getActiveFile();
    if(!activeFile) return;

    const containerEl = leaf.view.containerEl;
    let stateMenuContainerEl = containerEl.find(`.${stateMenuContainerClassName}`)
    if(!stateMenuContainerEl) {
        const headerEl = containerEl.children[0];
        stateMenuContainerEl = headerEl.createDiv(stateMenuContainerClassName);
        headerEl.after(stateMenuContainerEl);
        let stateMenuRoot = createRoot(stateMenuContainerEl);
        stateMenuRoot.render(
            <PluginContext.Provider value={plugin}>
                <StateMenu file={activeFile}/>
            </PluginContext.Provider>
        )
    }

}


// function addMarkdownViewHeader(plugin: ProjectCardsPlugin) {
//     let { workspace } = plugin.app;
//     let leaf = workspace.getActiveViewOfType(ItemView)?.leaf;
//     if(!leaf) return;

//     const containerEl = leaf.view.containerEl;
//     const headerEl = containerEl.children[0];
//     const titleContainerEl = headerEl.find('.view-header-title-container');
//     if(!titleContainerEl) return;

//     const activeFile = workspace.getActiveFile();
//     if(!activeFile) return;
//     const curFileState = getFileState(plugin, activeFile);

//     let statusMenuEl: null | Element;
//     statusMenuEl = titleContainerEl.find(`.${MarkdownHeaderClassName}`);
//     if(!statusMenuEl) {
//         statusMenuEl = titleContainerEl.createDiv(MarkdownHeaderClassName);
//     }
//     statusMenuEl.textContent = curFileState;
    
//     // this.root = createRoot(statusMenuEl);
//     // this.root.render(
//     //     <PluginContext.Provider value={this.plugin}>
//     //         <CardBrowser plugin={this.plugin}/>
//     //     </PluginContext.Provider>
//     // );

// }