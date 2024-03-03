import { App, PluginSettingTab, Setting } from "obsidian";
import MyPlugin, { DEFAULT_SETTINGS } from "src/main";
import { ConfirmationModal } from "src/modals/confirmation-modal/confirmation-modal";



export class MySettingsTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h1', {text: 'Project Cards'});
		containerEl.createEl('p', {text: 'Project Cards replaces your new tab window with a browseable layout of the files and folders in your vault.'});
		
		containerEl.createEl('hr');
		containerEl.createEl('p', {text: 'Find information about features at <a href="http://www.designdebt.club>designdebt.club</a>'});
		containerEl.createEl('p', {text: 'There are currently no customisable settings.'});
		
		// containerEl.createEl('hr');
		// containerEl.createEl('h2', {text: 'Basics'});
				
		// new Setting(containerEl)
		// 	.setClass('uo_setting')
		// 	.setName('Note import folder')
		// 	.addText((text) => {
		// 		text.setValue(this.plugin.settings.folderNames.notes);
		// 		text.onChange(async (value) => {
		// 			this.plugin.settings.folderNames.notes = value;
		// 			await this.plugin.saveSettings();
		// 		});
		// 	});

		// containerEl.createEl('hr');

		// new Setting(containerEl)
		// 	.addButton( (button) => {
		// 		button.setButtonText('Reset settings');
		// 		button.onClick(() => {
		// 			new ConfirmationModal({
		// 				plugin: this.plugin,
		// 				title: 'Please confirm',
		// 				message: 'Revert to default settings for Google Keep Import?',
		// 				confirmLabel: 'Reset settings',
		// 				confirmAction: async () => {
		// 					await this.plugin.resetSettings();
		// 					this.display();
		// 				}
		// 			}).open();
		// 		})
		// 	})

	}
}