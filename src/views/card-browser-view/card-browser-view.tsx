import { FileView, ItemView, MarkdownView, Notice, TFile, TFolder, View, ViewState, ViewStateResult, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import CardBrowser, { CardBrowserHandlers } from "src/components/card-browser/card-browser";
import { createContext } from 'react';
import { isEmpty } from "src/utils/misc";
import { ICON_PLUGIN } from "src/constants";
import { Provider as JotaiProvider } from 'jotai';
import { globalStore, getGlobals } from "src/logic/stores";

//////////
//////////

export const CARD_BROWSER_VIEW_TYPE = "card-browser-view";

export interface CardBrowserViewState {
    id?: string, // to allow for forcing a refresh
    path: string;
}
export type PartialCardBrowserViewState = Partial<CardBrowserViewState>;

export interface CardBrowserViewEState {
    scrollOffset?: number,
    lastTouchedFilePath?: string,
}
export type PartialCardBrowserViewEState = Partial<CardBrowserViewEState>;



export function setCardBrowserViewStateDefaults(): CardBrowserViewState {
    const {plugin} = getGlobals();

    let launchPath = plugin.settings.access.launchFolder
    if(!plugin.app.vault.getFolderByPath(launchPath)) {
        new Notice('Launch folder not found. Launching in root of vault instead. Update your launch folder in the Project Browser plugin settings.', 10000)
        launchPath = plugin.app.vault.getRoot().path;
    }
    return {
        path: launchPath,
    }
}

export function registerCardBrowserView () {
    const {plugin} = getGlobals();

    plugin.registerView(
        CARD_BROWSER_VIEW_TYPE,
        (leaf) => new ProjectCardsView(leaf)
    );
}

export function loadCardBrowserOnNewTab() {
    const {plugin} = getGlobals();

	plugin.registerEvent(plugin.app.workspace.on('active-leaf-change', (leaf) => {
        if(!leaf) return;
        
		const viewType = leaf.view.getViewType();
		if(viewType === 'empty') {
            replaceLeaf(leaf);
        }
	}));
}

export function newProjectBrowserLeaf() {
    const {plugin} = getGlobals();

    const leaf = plugin.app.workspace.getLeaf(true);
    new ProjectCardsView(leaf);
    plugin.app.workspace.setActiveLeaf(leaf)
}

// This works but you can't click back.
export function replaceLeaf(leaf: WorkspaceLeaf) {
    const {plugin} = getGlobals();
    new ProjectCardsView(leaf);
}

export function replaceMostRecentLeaf() {
    const {plugin} = getGlobals();
    const leaf = plugin.app.workspace.getMostRecentLeaf();
    if(leaf) {
        leaf.open(new ProjectCardsView(leaf));
    }
}



export class ProjectCardsView extends ItemView {
    root: Root;
    internalClick: boolean = false;
    
    // CardBrowserViewState properties
    state: CardBrowserViewState;
    eState: CardBrowserViewEState;
    cardBrowserHandlers: CardBrowserHandlers;
    
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        this.navigation = true;
        this.icon = ICON_PLUGIN;
        
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
            this.state = setCardBrowserViewStateDefaults();
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

        // NOTE: This used to be on scrollend, but it was missing some instances where the user would scroll then quickly click
        this.contentEl.addEventListener('scroll', (e) => {
            this.saveReturnState();
        })

        this.cardBrowserHandlers?.rerender();

        return super.setState(this.state, result);
    }

    setEphemeralState(eState: any): void {
        this.eState = eState;
        this.cardBrowserHandlers?.rerender();
        return super.setEphemeralState(this.eState);
    }

    async onClose() {
        // Nothing to clean up.
    }

    ////////

    renderView() {
        this.root.render(
            <JotaiProvider store={globalStore}>
                <CardBrowser
                    path = {this.state.path}
                    setViewStateWithHistory = {(statePartial: PartialCardBrowserViewState) => this.setViewStateWithHistory(statePartial)}
                    rememberLastTouchedFilepath = {this.rememberLastTouchedFilepath}
                    resetLastTouchedFilepath = {this.resetLastTouchedFilepath}
                    getViewStates = {() => {
                        return {
                            eState: this.eState,
                            state: this.state,
                        }
                    }}
                    passBackHandlers = {this.setCardBrowserHandlers}
                />
            </JotaiProvider>
        );
    }

    setCardBrowserHandlers = (handlers: CardBrowserHandlers) => {
        this.cardBrowserHandlers = handlers;
        this.applyScrollOffset();
    }

    applyScrollOffset = () => {
        setTimeout( () => {
            if(this.eState?.scrollOffset) this.contentEl.scrollTo(0, this.eState.scrollOffset);
        }, 50)
    }

    // My function that I call to navigate to a new folder
    setViewStateWithHistory = (statePartial: PartialCardBrowserViewState) => {
        const nextState = {...this.state, ...statePartial};
        this.leaf.setViewState({
            type: CARD_BROWSER_VIEW_TYPE,
            state: nextState,
        });
    }

    rememberLastTouchedFilepath = (lastTouchedFilePath: string): CardBrowserViewEState => {
        this.eState = {
            ...this.eState,
            lastTouchedFilePath,
        };
        return this.eState;
    }
    resetLastTouchedFilepath = (): CardBrowserViewEState => {
        this.eState = {
            ...this.eState,
            lastTouchedFilePath: '',
        };
        return this.eState;
    }

    saveReturnState = async (props?: {lastTouchedFilePath?: string}) => {
        const scrollOffset = this.contentEl.scrollTop;
        
        // Not sure what ephemeral state actually does.
        // State seems to be tied to view type, while ephemeral state is tied to view instance?
        // Which would explain why subfolders don't adopt the scroll position

        if(props?.lastTouchedFilePath) {
            this.eState = {
                scrollOffset,
                lastTouchedFilePath: props.lastTouchedFilePath,
            };

        } else {
            this.eState = {
                scrollOffset,
            };
        }
    }

}
