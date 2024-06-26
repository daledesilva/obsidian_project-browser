import { Notice, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS_0_0_5, PluginSettings_0_0_5 } from 'src/types/plugin-settings0_0_5';
import { loadCardBrowserOnNewTab, registerCardBrowserView } from './views/card-browser-view/card-browser-view';
import { registerMarkdownViewMods } from './views/markdown-view-mods/markdown-view-mods';
import { registerSettingsTab } from './tabs/settings-tab/settings-tab';
import { registerOpenProjectBrowserCommand, registerOpenProjectBrowserRibbonIcon } from './commands/open-project-browser';
import { migrateOutdatedSettings } from './types/plugin-settings-migrations';

/////////
/////////
export default class ProjectBrowserPlugin extends Plugin {
	settings: PluginSettings_0_0_5;

	async onload() {
		await this.loadSettings();
		
		// this.app.emulateMobile(false);

		registerCardBrowserView(this)
		registerMarkdownViewMods(this)

		if(this.settings.access.replaceNewTab)		loadCardBrowserOnNewTab(this);
		if(this.settings.access.enableRibbonIcon)	registerOpenProjectBrowserRibbonIcon(this);
		if(this.settings.access.enableCommand)		registerOpenProjectBrowserCommand(this);

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
		this.settings = await this.loadData();

		if(Object.isEmpty(this.settings)) {
			this.settings = Object.assign({}, DEFAULT_SETTINGS_0_0_5, this.settings);
		} else {
			this.settings = migrateOutdatedSettings(this.settings);
			this.saveSettings();
		}	
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async resetSettings() {
		this.settings = JSON.parse( JSON.stringify(DEFAULT_SETTINGS_0_0_5) );
		this.saveSettings();
		new Notice('Project Browser plugin settings reset');
	}

}
