import { Editor, MarkdownViewModeType, Notice, Plugin, WorkspaceLeaf } from 'obsidian';
import { PluginSettings } from 'src/types/PluginSettings';
import { MySettingsTab } from './tabs/settings-tab/settings-tab';
import { openInkFile } from './utils/open-file';
import { CARD_BROWSER_VIEW_TYPE, ProjectCardsView, registerCardBrowserView } from './views/CardBrowserView/CardBrowserView';


export const DEFAULT_SETTINGS: PluginSettings = {
	
}




export default class ProjectCardsPlugin extends Plugin {
	settings: PluginSettings;


	async onload() {
		await this.loadSettings();

		// this.app.emulateMobile(false);

		registerCardBrowserView(this)
		registerSettingsTab(this);
		
		// // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// // Using this function will automatically remove the event listener when this plugin is disabled.
		// // this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// // 	console.log('click', evt);
		// // });

		
	}
	

	onunload() {
		// Make sure to stop anything here

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





function registerSettingsTab(plugin: ProjectCardsPlugin) {
	// plugin.addSettingTab(new MySettingsTab(plugin.app, this));
}
