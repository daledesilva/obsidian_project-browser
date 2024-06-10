import ProjectBrowserPlugin from "src/main";
import { FileView, ItemView, MarkdownView, TFile, TFolder, View, ViewState, ViewStateResult, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import CardBrowser from "src/components/card-browser/card-browser";
import { createContext } from 'react';
import { PluginContext } from "src/utils/plugin-context";
import { CurrentFolderMenu } from "src/components/current-folder-menu/current-folder-menu";
import { isEmpty } from "src/utils/misc";
import { PLUGIN_ICON } from "src/constants";

//////////
//////////

export const CARD_BROWSER_VIEW_TYPE = "card-browser-view";

export interface CardBrowserViewState {
    path: string;
}
export type PartialCardBrowserViewState = Partial<CardBrowserViewState>;

export interface CardBrowserViewEState {
    scrollOffset?: number,
    lastOpenFilePath?: string,
}
export type PartialCardBrowserViewEState = Partial<CardBrowserViewEState>;



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
    eState: CardBrowserViewEState;

    constructor(leaf: WorkspaceLeaf, plugin: ProjectBrowserPlugin) {
        super(leaf);
        this.plugin = plugin;
        this.navigation = true;
        this.icon = PLUGIN_ICON;
        
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

        // Wait for a split second because the state updates asynchronously
        setTimeout( () => {
            this.renderView();
            if(this.eState?.scrollOffset) {
                this.contentEl.scrollTo(0, this.eState.scrollOffset);
            }
            if(this.eState?.lastOpenFilePath) {
                // this.contentEl.scrollTo(0, this.eState.scrollOffset);
            }
        }, 50);
        // Lower than 50ms and it might run before hte page has loaded fully.
        // REVIEW: Need to reasses. Perhaps it should continually run while page is loading?

        
        contentEl.addEventListener('scrollend', (e) => {
            this.saveScrollOffset();
        })


    }

    // Called by Obsidian to fetch the state from your view
    // Done automatically when leaf navigates away from your view (ie. onClose)
    // Return your state here to provide it to Obsidian
    getState(): CardBrowserViewState {
        // console.log('SAVING state');
        return this.state;
    }
    getEphemeralState(): CardBrowserViewEState {
        // console.log('SAVING Ephemeral State');
        return this.eState;
    }
    
    // Called by Obsidian to provide your view with the state
    // Called automatically when the leaf opens your view
    // Set your state here from what's passed in
    setState(state: any, result: ViewStateResult): Promise<void> {
        // console.log('LOADING state');
        result.history = true;

        // this.state.path = state.path;   // This line fucks up the navigation history (Even if you think you're overwriting it with the other line)
        this.state = state;   // this line works - you have to replace the whole object for navigation history to work properly

        this.renderView();
        return super.setState(this.state, result);
    }

    setEphemeralState(state: any): void {
        // console.log('LOADING Ephemeral State:', state);
        this.eState = state;
        return super.setEphemeralState(this.state);
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
                    setCardBrowserState = {(statePartial: PartialCardBrowserViewState) => this.setCardBrowserState(statePartial)}
                    saveScrollOffset = {this.saveScrollOffset}
                />
            </PluginContext.Provider>
        );
    }

    // My function that I call to navigate to a new folder
    async setCardBrowserState(statePartial: PartialCardBrowserViewState) {        
        const nextState = {...this.state, ...statePartial};
        this.leaf.setViewState({
            type: CARD_BROWSER_VIEW_TYPE,
            state: nextState,
        });
    }

    saveScrollOffset = async () => {
        const scrollOffset = this.contentEl.scrollTop;
        
        // Not sure what ephemeral state actually does.
        // State seems to be tied to view type, while ephemeral state is tied to view instance?
        // Which would explain why subfolders don't adopt the scroll position
        this.leaf.setEphemeralState({
            scrollOffset,
        });
    }
}

// NOTE: When Obsidian calls getState, it automatically adds your view to the history stack.
// But if you change your view internally, you should call setViewState to add the entry you need.