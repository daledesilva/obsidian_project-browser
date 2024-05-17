import { PLUGIN_ICON } from "src/constants";
import ProjectBrowserPlugin from "src/main";
import { newProjectBrowserLeaf, replaceMostRecentLeaf } from "src/views/card-browser-view/card-browser-view";

////////
////////

export async function registerOpenProjectBrowserCommand(plugin: ProjectBrowserPlugin) {
    plugin.addCommand({
		id: 'open-project-browser',
		name: 'Open',
        callback: () => newProjectBrowserLeaf(plugin)
	});
}

export async function registerOpenProjectBrowserRibbonIcon(plugin: ProjectBrowserPlugin) {
    // 'align-vertical-justify-start'
    // 'align-vertical-justify-center'
    // 'layout-list'
    // 'book'
    // 'album'
    // 'book-copy'
    // 'captions'
    // 'gallery-vertical-end'
    // 'archive'
    // 'book-text'
    // 'wallet-cards'
    plugin.addRibbonIcon(PLUGIN_ICON, 'Open project browser', () => {
        newProjectBrowserLeaf(plugin)
    });
}
