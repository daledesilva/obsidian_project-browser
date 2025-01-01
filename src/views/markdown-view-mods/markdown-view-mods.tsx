import './markdown-view-mods.scss';
import { ItemView, MarkdownView, Menu, MenuItem, View } from "obsidian";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { StateMenu } from 'src/components/state-menu/state-menu';
import { getGlobals, getStateMenuSettings } from 'src/logic/stores';
import { toggleStateMenu } from 'src/logic/toggle-state-menu';
import { debug } from 'src/utils/log-to-console';

//////////
//////////

const stateMenuContainerClassName = 'ddc_pb_state-menu-container';

//////////

export function registerMarkdownViewMods() {
    const {plugin} = getGlobals();

    addViewMenuOptions();

    // NOTE: Opening a different file in the same leaf counts as an active-leaf-change, but the header gets replaced, it updates.
    plugin.registerEvent(plugin.app.workspace.on('active-leaf-change', (leaf) => {
        if(!leaf) return;

		const viewType = leaf.view.getViewType();
		if(viewType === 'markdown') {
            addStateHeader();
        }
	}));
}

function addViewMenuOptions() {
    const {plugin} = getGlobals();
    plugin.app.workspace.on('file-menu', (menu, file, source) => {
        if(source !== 'more-options') return;
        menu.addItem((item: MenuItem) => {
            item.setTitle('Toggle State Menu');
            item.setChecked(getStateMenuSettings().visible);
            item.onClick(toggleStateMenu);
            item.setSection('pane');
            item.setIcon('file-check');
        });
    });
}

function addActionButtons(view: View) {
    // TODO: Currently adding an extra button every time the view is clicked in.
    if (!(view instanceof MarkdownView)) return;
    const element = view.addAction('file-stack', 'Toggle State Menu', toggleStateMenu);
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