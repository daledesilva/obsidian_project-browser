import { Editor, MarkdownViewModeType, Notice, Plugin, WorkspaceLeaf } from 'obsidian';
import { PluginSettings } from 'src/types/PluginSettings';
import { MySettingsTab } from './tabs/settings-tab/settings-tab';
import { openInkFile } from './utils/open-file';


export const DEFAULT_SETTINGS: PluginSettings = {
	
}




export default class InkPlugin extends Plugin {
	settings: PluginSettings;

	// Function came from Notion like tables code
	private getViewMode = (el: HTMLElement): MarkdownViewModeType | null => {
		const parent = el.parentElement;
		if (parent) {
			return parent.className.includes("cm-preview-code-block")
				? "source"
				: "preview";
		}
		return null;
	};


	async onload() {
		await this.loadSettings();

		// this.app.emulateMobile(false);

		// registerWritingView(this);
		
		registerActionA(this);
		
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



function registerActionA(plugin: InkPlugin) {
	// plugin.addCommand({
	// 	id: 'ddc_create-writing-file',
	// 	name: 'Create new handwritten note',
	// 	callback: async () => {
	// 		const fileRef = await createNewWritingFile(plugin);
	// 		openInkFile(plugin, fileRef);
	// 	}
	// });
	// plugin.addRibbonIcon("pencil", "New handwritten note", async () => {
	// 	const fileRef = await createNewWritingFile(plugin);
	// 	openInkFile(plugin, fileRef);
	// });
}


function registerSettingsTab(plugin: InkPlugin) {
	this.addSettingTab(new MySettingsTab(this.app, this));
}
