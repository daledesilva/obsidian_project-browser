import ProjectCardsPlugin from "src/main";
import { ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { Root, createRoot } from "react-dom/client";

//////////
//////////

export const CARD_BROWSER_VIEW_TYPE = "card-browser-view";

export async function openCardBrowserInNewTab(plugin: ProjectCardsPlugin) {
    let { workspace } = plugin.app;
    let leaf = workspace.getLeaf();
    const projectCardsView = new ProjectCardsView(leaf, plugin)
    leaf.open(projectCardsView);
}

export class ProjectCardsView extends ItemView {
    root: null | Root;
    plugin: ProjectCardsPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: ProjectCardsPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return CARD_BROWSER_VIEW_TYPE;
    }

    getDisplayText() {
        return "Browse projects";
    }

    async onOpen() {
        const viewContent = this.containerEl;
        viewContent.empty();
        // viewContent.setAttr('style', 'padding: 0;');
        
        this.root = createRoot(viewContent);
		this.root.render(
            <p>This is my project card view</p>
        );
    }

    async onClose() {
        // Nothing to clean up.
    }
}