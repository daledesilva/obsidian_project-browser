import ProjectCardsPlugin from "src/main";
import { FileView, ItemView, MarkdownView, TFolder, ViewState, ViewStateResult, WorkspaceLeaf } from "obsidian";
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
export const CARD_BROWSER_VIEW_STATE_TYPE = "card-browser-view-state";

export interface CardBrowserViewState extends ViewState {
    state: {
        folder: TFolder;
    }
}

export function setCardBrowserViewStateDefaults(plugin: ProjectCardsPlugin): CardBrowserViewState {
    return {
        type: CARD_BROWSER_VIEW_STATE_TYPE,
        state: {
            folder: plugin.app.vault.getRoot(),
        }
    }
}

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
    root: Root;
    plugin: ProjectCardsPlugin;
    
    // CardBrowserViewState properties
    viewState: CardBrowserViewState;

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

        if(!this.viewState || isEmpty(this.viewState)) {
            this.viewState = setCardBrowserViewStateDefaults(this.plugin);
        }

        if(!this.root) this.root = createRoot(contentEl);

        // REVIEW: Need to use this.registerInterval?
        setTimeout( () => {
            this.renderView();
        }, 50); // Wait for a split second because the state updates asynchronously
    }

    // Called by Obsidian to fetch the state from your view
    // Done automatically when leaf navigates to change your view
    // Return your state here to provide it to Obsidian
    getState(): CardBrowserViewState {
        console.log('getState', this.viewState);
        return this.viewState;
    }
    
    // Called by Obsidian to provide your view with the state
    // Called automatically when the leaf opens your view
    // Set your state here from what's passed in
    setState(viewState: any, result: ViewStateResult): Promise<void> {
        console.log('setState');
        if(viewState.state.folder) this.viewState.state.folder = viewState.state.folder;
        return super.setState(viewState, result);
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
                    folder = {this.viewState.state.folder}
                    updateViewState = {(viewStatePartial: any) => this.updateViewState(viewStatePartial)}
                />
            </PluginContext.Provider>
        );
    }

    // My function to update the state
    async updateViewState(viewStatePartial: any) {
        this.viewState = {...this.viewState, ...viewStatePartial};
        this.setState(this.viewState, {history: true});
        
        // this.leaf.open(this);
        // this.renderView();
        // this.plugin.app.workspace.requestSaveLayout();  // Ask the workspace to save all workspce states // NOT NEEDED to save the state (getState is called when the user navigates away anyway)
        // console.log('this.leaf.getViewState()', this.leaf.getViewState())
    }
}