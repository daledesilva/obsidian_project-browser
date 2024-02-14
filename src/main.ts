import { Editor, MarkdownViewModeType, Notice, Plugin, WorkspaceLeaf } from 'obsidian';
import { PluginSettings } from 'src/types/PluginSettings';
import { MySettingsTab } from './tabs/settings-tab/settings-tab';
import { openInkFile } from './utils/open-file';
import { openCardBrowserInNewTab } from './views/CardBrowserView/CardBrowserView';


export const DEFAULT_SETTINGS: PluginSettings = {
	
}




export default class InkPlugin extends Plugin {
	settings: PluginSettings;


	async onload() {
		await this.loadSettings();

		// this.app.emulateMobile(false);

		// registerProjectCardView(this);
		registerOpenCardBrowserAction(this);
		
		// For testing only
		// implementHandwrittenNoteAction(this)
		// implementHandDrawnNoteAction(this)
		
		// TODO: Convert this to registerSettingsTab
		registerSettingsTab(this);
		
		// // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// // Using this function will automatically remove the event listener when this plugin is disabled.
		// // this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// // 	console.log('click', evt);
		// // });
	}
	

	onunload() {
		// TODO: Make sure to stop anything here

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	// async saveSettings() {
	// 	await this.saveData(this.settings);
	// }

	// async resetSettings() {
	// 	this.settings = JSON.parse( JSON.stringify(DEFAULT_SETTINGS) );
	// 	this.saveSettings();
	// 	new Notice('Plugin settings reset');
	// }
}



// export function registerProjectCardView (plugin: InkPlugin) {
//     plugin.registerView(
//         CARD_BROWSER_VIEW_TYPE,
//         (leaf) => new DrawingView(leaf, plugin)
//     );
//     plugin.registerExtensions([DRAW_FILE_EXT], DRAWING_VIEW_TYPE);
// }


function registerOpenCardBrowserAction(plugin: InkPlugin) {
	plugin.addCommand({
		id: 'ddc_browse-projects',
		name: 'Browse projects',
		callback: async () => {
			openCardBrowserInNewTab(plugin);
		}
	});
	plugin.addRibbonIcon('dice', 'Browse projects', async () => {
		openCardBrowserInNewTab(plugin);
	});
}


function registerSettingsTab(plugin: InkPlugin) {
	this.addSettingTab(new MySettingsTab(this.app, this));
}
