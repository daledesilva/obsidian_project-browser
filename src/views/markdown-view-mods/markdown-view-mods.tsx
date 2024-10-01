import './markdown-view-mods.scss';
import { ItemView } from "obsidian";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { StateMenu } from 'src/components/state-menu/state-menu';
import { getGlobals } from 'src/logic/stores';

//////////
//////////

const stateMenuContainerClassName = 'ddc_pb_state-menu-container';

//////////

export function registerMarkdownViewMods() {
    const {plugin} = getGlobals();

    // NOTE: Opening a different file in the same leaf counts as an active-leaf-change, but the header gets replaced, it updates.
    plugin.registerEvent(plugin.app.workspace.on('active-leaf-change', (leaf) => {
        if(!leaf) return;

		const viewType = leaf.view.getViewType();
		if(viewType === 'markdown') {
            if(plugin.settings.showStateMenu) addStateHeader();
        }
	}));
}

function addStateHeader() {
    const {plugin} = getGlobals();
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
            <StateMenu file={activeFile}/>
        )
    }

}