import ProjectBrowserPlugin from "src/main";
import { FileView, ItemView, MarkdownView, TFile, TFolder, View, ViewState, ViewStateResult, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import CardBrowser, { CardBrowserHandlers } from "src/components/card-browser/card-browser";
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
    lastOpenedFilePath?: string,
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
    cardBrowserHandlers: CardBrowserHandlers;

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

        this.renderView();
    }

    // Called by Obsidian to fetch the state from your view
    // Done automatically when leaf navigates away from your view (ie. onClose)
    // Return your state here to provide it to Obsidian
    getState(): CardBrowserViewState {
        return this.state;
    }
    getEphemeralState(): CardBrowserViewEState {
        return this.eState;
    }
    
    // Called by Obsidian to provide your view with the state
    // Called automatically when the leaf opens your view
    // Set your state here from what's passed in
    setState(state: any, result: ViewStateResult): Promise<void> {
        result.history = true;

        // this.state.path = state.path;   // This line fucks up the navigation history (Even if you think you're overwriting it with the other line)
        this.state = state;   // this line works - you have to replace the whole object for navigation history to work properly

        this.contentEl.addEventListener('scrollend', (e) => {
            this.saveReturnState();
        })

        this.updateCardBrowser();

        return super.setState(this.state, result);
    }

    setEphemeralState(eState: any): void {
        this.eState = eState;
        this.updateCardBrowser();
        return super.setEphemeralState(this.eState);
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
                    setViewStateWithHistory = {(statePartial: PartialCardBrowserViewState) => this.setViewStateWithHistory(statePartial)}
                    saveReturnState = {this.saveReturnState}
                    setHandlers = {(handlers) => this.setCardBrowserHandlers(handlers)}
                />
            </PluginContext.Provider>
        );
    }

    setCardBrowserHandlers(handlers: CardBrowserHandlers) {
        this.cardBrowserHandlers = handlers;
        this.updateCardBrowser();
    }

    updateCardBrowser() {
        if(!this.cardBrowserHandlers) return;
        if(this.state) this.cardBrowserHandlers.setState(this.state);
        if(this.eState) this.cardBrowserHandlers.setEState(this.eState);
        if(this.eState?.scrollOffset) this.contentEl.scrollTo(0, this.eState.scrollOffset);
    }

    // My function that I call to navigate to a new folder
    setViewStateWithHistory(statePartial: PartialCardBrowserViewState) {       
        const nextState = {...this.state, ...statePartial};
        this.leaf.setViewState({
            type: CARD_BROWSER_VIEW_TYPE,
            state: nextState,
        });
    }

    saveReturnState = async (props?: {lastOpenedFilePath?: string}) => {
        const scrollOffset = this.contentEl.scrollTop;
        
        // Not sure what ephemeral state actually does.
        // State seems to be tied to view type, while ephemeral state is tied to view instance?
        // Which would explain why subfolders don't adopt the scroll position

        if(props?.lastOpenedFilePath) {
            this.eState = {
                scrollOffset,
                lastOpenedFilePath: props.lastOpenedFilePath,
            };

        } else {
            this.eState = {
                scrollOffset,
            };
        }
    }

}
