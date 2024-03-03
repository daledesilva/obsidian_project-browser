import ProjectCardsPlugin from "src/main";
import { FileView, ItemView, MarkdownView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import CardBrowser from "src/components/card-browser/card-browser";
import { createContext } from 'react';
import { PluginContext } from "src/utils/plugin-context";

//////////
//////////

export const CARD_BROWSER_VIEW_TYPE = "card-browser-view";

export function registerCardBrowserView (plugin: ProjectCardsPlugin) {
    plugin.registerView(
        CARD_BROWSER_VIEW_TYPE,
        (leaf) => new ProjectCardsView(leaf, plugin)
    );
    loadOnNewTab(plugin);
}

function loadOnNewTab(plugin: ProjectCardsPlugin) {
	plugin.registerEvent(plugin.app.workspace.on('active-leaf-change', () => {
		const viewType = plugin.app.workspace.getLeaf().view.getViewType();
		if(viewType === 'empty') {
            replaceActiveLeafWithCardBrowser(plugin);
        }
	}));
}

function replaceActiveLeafWithCardBrowser(plugin: ProjectCardsPlugin) {
    let { workspace } = plugin.app;
    let leaf = workspace.getActiveViewOfType(ItemView)?.leaf;
    if(!leaf) return;

    const projectCardsView = new ProjectCardsView(leaf, plugin);
}

export class ProjectCardsView extends ItemView {
    root: null | Root;
    plugin: ProjectCardsPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: ProjectCardsPlugin) {
        super(leaf);
        this.plugin = plugin;
        this.navigation = true;
        // icon = // Put a card icon here
        
        leaf.open(this);
    }

    getViewType() {
        return CARD_BROWSER_VIEW_TYPE;
    }

    getDisplayText() {
        return "Browse";
    }

    async onOpen() {
        const contentEl = this.contentEl;
        contentEl.empty();
        contentEl.setAttr('style', 'padding: 0;');

        if(!this.root) {
            this.root = createRoot(contentEl);
        }
		this.root.render(
            <PluginContext.Provider value={this.plugin}>
                <CardBrowser plugin={this.plugin}/>
            </PluginContext.Provider>
        );
    }

    async onClose() {
        // Nothing to clean up.
    }
}