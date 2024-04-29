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
    // 'wallet-cards'
    plugin.addRibbonIcon('book-copy', 'Open project browser', () => {
        newProjectBrowserLeaf(plugin)
    });
}
