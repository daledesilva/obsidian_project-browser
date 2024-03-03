import { Plugin } from 'obsidian';
import { PluginSettings, defaultPluginSettings } from 'src/types/plugin-settings';
import { registerCardBrowserView } from './views/card-browser-view/card-browser-view';
import { registerMarkdownViewMods } from './views/markdown-view-mods/markdown-view-mods';

/////////
/////////
export default class ProjectCardsPlugin extends Plugin {
	settings: PluginSettings;


	async onload() {
		await this.loadSettings();

		// this.app.emulateMobile(false);

		registerCardBrowserView(this)
		registerMarkdownViewMods(this)
		registerSettingsTab(this);
		
		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });
	}
	

	onunload() {
		// Make sure to stop anything here

	}

	async loadSettings() {
		this.settings = Object.assign({}, defaultPluginSettings, await this.loadData());
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
