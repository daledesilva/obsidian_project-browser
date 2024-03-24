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

export interface CardBrowserViewState {
    path: string;
}

export function setCardBrowserViewStateDefaults(plugin: ProjectCardsPlugin): CardBrowserViewState {
    return {
        path: plugin.app.vault.getRoot().path,
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
    state: CardBrowserViewState;

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
    // Done automatically when leaf navigates to change your view
    // Return your state here to provide it to Obsidian
    getState(): CardBrowserViewState {
        // console.log('getState', this.state);
        return this.state;
    }
    
    // Called by Obsidian to provide your view with the state
    // Called automatically when the leaf opens your view
    // Set your state here from what's passed in
    setState(state: any, result: ViewStateResult): Promise<void> {
        if(state.path) this.state.path = state.path;
        result.history = true;
        // console.log('setState, state:', state);\
        this.renderView();
        return super.setState(state, result);
    }

    async onClose() {
        // Nothing to clean up.
    }

    ////////

    renderView() {
        // console.log('renderView');
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

    // My function to update the state
    async updateState(statePartial: any) {

        // Save current state to history before changing
        await this.leaf.setViewState({
            type: CARD_BROWSER_VIEW_TYPE,
            state: this.state,
        })
        
        this.state = {...this.state, ...statePartial};
        this.renderView();

        // console.log('updating state:', JSON.parse(JSON.stringify(this.state)))
        // this.setState(this.state, {history: true});

        
        
        // Doesn't have any effect:
        // this.setState(this.state, {history: true});
        
        // Doesn't have any effect:
        // this.leaf.open(this);
        
        // Doesn't adopt saved state:
        // new ProjectCardsView(this.leaf, this.plugin);

        // This seams to register a navigation point in the history stack but when back is clicked nothing happens:
        // await this.leaf.setViewState({
        //     type: CARD_BROWSER_VIEW_TYPE,
        // })
        
        // Error about converting to circular structure (otherwise same behaviour as above)
        // console.log('newState:', this.state);
        
        // this.leaf.open(this);

        // Ask the workspace to save all workspce states:
        // NOT NEEDED to save the state (getState is called when the user navigates away anyway)
        // this.plugin.app.workspace.requestSaveLayout();
    }
}