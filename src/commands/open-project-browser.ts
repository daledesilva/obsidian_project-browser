import { ICON_PROJECT_BROWSER } from "src/constants";
import { getGlobals } from "src/logic/stores";
import { newProjectBrowserLeaf } from "src/views/card-browser-view/card-browser-view";

////////
////////

export async function registerOpenProjectBrowserCommand() {
    const {plugin} = getGlobals();

    plugin.addCommand({
		id: 'open-project-browser',
		name: 'Open',
        icon: ICON_PROJECT_BROWSER,
        callback: () => {
            void newProjectBrowserLeaf();
        }
	});
}

export async function registerOpenProjectBrowserRibbonIcon() {
    const {plugin} = getGlobals();

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
    plugin.addRibbonIcon(ICON_PROJECT_BROWSER, 'Open project browser', () => {
        void newProjectBrowserLeaf();
    });
}
