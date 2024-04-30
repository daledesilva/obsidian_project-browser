import ProjectBrowserPlugin from "src/main";
import { FileView, ItemView, MarkdownView, TFolder, View, ViewState, ViewStateResult, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import CardBrowser from "src/components/card-browser/card-browser";
import { createContext } from 'react';
import { PluginContext } from "src/utils/plugin-context";
import { CurrentFolderMenu } from "src/components/current-folder-menu/current-folder-menu";
import { isEmpty } from "src/utils/misc";

//////////
//////////

export const CARD_BROWSER_VIEW_TYPE = "card-browser-view";

export interface CardBrowserViewState {
    path: string;
}

export function setCardBrowserViewStateDefaults(plugin: ProjectBrowserPlugin): CardBrowserViewState {
    return {
        path: plugin.app.vault.getRoot().path,
    }
}

export function registerCardBrowserView (plugin: ProjectBrowserPlugin) {
    plugin.registerView(
        CARD_BROWSER_VIEW_TYPE,
        (leaf) => new ProjectCardsView(leaf, plugin)
    );
}

export function loadCardBrowserOnNewTab(plugin: ProjectBrowserPlugin) {
	plugin.registerEvent(plugin.app.workspace.on('active-leaf-change', (leaf) => {
        if(!leaf) return;
        
		const viewType = leaf.view.getViewType();
		if(viewType === 'empty') {
            replaceLeaf(leaf, plugin);
        }
	}));
}

export function newProjectBrowserLeaf(plugin: ProjectBrowserPlugin) {
    const leaf = plugin.app.workspace.getLeaf(true);
    new ProjectCardsView(leaf, plugin);
    plugin.app.workspace.setActiveLeaf(leaf)
}

// This works but you can't click back.
export function replaceLeaf(leaf: WorkspaceLeaf, plugin: ProjectBrowserPlugin) {
    new ProjectCardsView(leaf, plugin);
}

export function replaceMostRecentLeaf(plugin: ProjectBrowserPlugin) {
    const leaf = plugin.app.workspace.getMostRecentLeaf();
    if(leaf) {
        leaf.open(new ProjectCardsView(leaf, plugin));
    }
}

export class ProjectCardsView extends ItemView {
    root: Root;
    plugin: ProjectBrowserPlugin;
    internalClick: boolean = false;
    
    // CardBrowserViewState properties
    state: CardBrowserViewState;

    constructor(leaf: WorkspaceLeaf, plugin: ProjectBrowserPlugin) {
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

        if(!this.state || isEmpty(this.state)) {
            this.state = setCardBrowserViewStateDefaults(this.plugin);
        }

        if(!this.root) this.root = createRoot(contentEl);

        // REVIEW: Need to use this.registerInterval?
        setTimeout( () => {
            this.renderView();
        }, 50); // Wait for a split second because the state updates asynchronously
    }

    // Called by Obsidian to fetch the state from your view
    // Done automatically when leaf navigates away from your view (ie. onClose)
    // Return your state here to provide it to Obsidian
    getState(): CardBrowserViewState {
        return this.state;
    }
    
    // Called by Obsidian to provide your view with the state
    // Called automatically when the leaf opens your view
    // Set your state here from what's passed in
    setState(state: any, result: ViewStateResult): Promise<void> {
        result.history = true;

        // this.state.path = state.path;   // This line fucks up the navigation history (Even if you think you're overwriting it with the other line)
        this.state = state;   // this line works - you have to replace the whole object for navigation history to work properly
        
        this.renderView();
        return super.setState(this.state, result);
    }

    async onClose() {
        // Nothing to clean up.
    }

    ////////

    renderView() {
        this.root.render(
            <PluginContext.Provider value={this.plugin}>
                <CardBrowser
                    plugin = {this.plugin}
                    path = {this.state.path}
                    updateState = {(statePartial: any) => this.updateState(statePartial)}
                />
            </PluginContext.Provider>
        );
    }

    // My function that I call to navigate to a new folder
    async updateState(statePartial: any) {
        
        const nextState = {...this.state, ...statePartial};
        this.leaf.setViewState({
            type: CARD_BROWSER_VIEW_TYPE,
            state: nextState,
        });
    }
}

// NOTE: When Obsidian calls getState, it automatically adds your view to the history stack.
// But if you change your view internally, you should call setViewState to add the entry you need.