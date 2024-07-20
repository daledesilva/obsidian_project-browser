import { Notice, Plugin } from 'obsidian';
import { loadCardBrowserOnNewTab, registerCardBrowserView } from './views/card-browser-view/card-browser-view';
import { registerMarkdownViewMods } from './views/markdown-view-mods/markdown-view-mods';
import { registerSettingsTab } from './tabs/settings-tab/settings-tab';
import { registerOpenProjectBrowserCommand, registerOpenProjectBrowserRibbonIcon } from './commands/open-project-browser';
import { migrateOutdatedSettings } from './types/plugin-settings-migrations';
import { showOnboardingNotices_maybe } from './notices/onboarding-notices';
import { DEFAULT_SETTINGS_0_1_0, PluginSettings_0_1_0 } from './types/plugin-settings0_1_0';

/////////
/////////
export default class ProjectBrowserPlugin extends Plugin {
	settings: PluginSettings_0_1_0;
	refreshFileDependantsTimeout: NodeJS.Timer;
	fileDependants: {
		[key: string]: Function;
	} = {};

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

		showOnboardingNotices_maybe(this);

		this.app.vault.on('create', () => this.refreshFileDependants())
		this.app.vault.on('delete', () => this.refreshFileDependants())
		this.app.vault.on('rename', () => this.refreshFileDependants())
	}
	

	onunload() {
		// Make sure to stop anything here
		this.app.vault.off('create', () => this.refreshFileDependants())
		this.app.vault.off('delete', () => this.refreshFileDependants())
		this.app.vault.off('rename', () => this.refreshFileDependants())
	}

	async loadSettings() {
		this.settings = await this.loadData();

		if(Object.isEmpty(this.settings)) {
			this.settings = Object.assign({}, DEFAULT_SETTINGS_0_1_0, this.settings);
		} else {
			this.settings = migrateOutdatedSettings(this.settings);
			this.saveSettings();
		}	
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async resetSettings() {
		this.settings = JSON.parse( JSON.stringify(DEFAULT_SETTINGS_0_1_0) );
		this.saveSettings();
		new Notice('Project Browser plugin settings reset');
	}

	addFileDependant(id: string, handler: Function) {
		this.fileDependants[id] = handler;
	}

	removeFileDependant(id: string) {
		delete this.fileDependants[id];
	}

	async refreshFileDependants() {
		// Debounce slightly just so that batch file edits occur once
		
		clearTimeout(this.refreshFileDependantsTimeout);
		this.refreshFileDependantsTimeout = setTimeout(() => {
			Object.entries(this.fileDependants).forEach( ([key, handler]) => {
				try {
					handler()
				} catch(e) {
					// TODO: This is never called because the functions seem to still fire without error even though view no longer exists
					this.removeFileDependant(key)
				}
			})
		}, 100)
	}

}
