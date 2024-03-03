import './markdown-view-mods.scss';
import ProjectCardsPlugin from "src/main";
import { ItemView } from "obsidian";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { PluginContext } from "src/utils/plugin-context";
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