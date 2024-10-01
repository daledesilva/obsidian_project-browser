import { insertStateEditor } from 'src/components/state-editor/state-editor';
import 'src/shared/settings.scss';
import { App, PluginSettingTab, Setting } from "obsidian";
import InkPlugin from "src/main";
import MyPlugin from "src/main";
import { ConfirmationModal } from "src/modals/confirmation-modal/confirmation-modal";
import { folderPathSanitize } from 'src/utils/string-processes';
import { getGlobals } from 'src/logic/stores';

/////////
/////////

export function registerSettingsTab() {
	const {plugin} = getGlobals();
	plugin.addSettingTab(new MySettingsTab(plugin.app, plugin));
}

export class MySettingsTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display = (): void => {
		const {containerEl} = this;

		containerEl.empty();

		// insertPrereleaseWarning(containerEl);
		// containerEl.createEl('hr');
		
		insertMoreInfoLinks(containerEl);
		insertAccessSettings(containerEl, this.plugin, this.display);
		insertStateSettings(containerEl, this.plugin, this.display);
		insertNoteSettings(containerEl, this.plugin, this.display);
			
		// TODO: Collapsible change log
		// containerEl.createEl('p', {
		// 	text: 'Alpha v0.0.359 changes',
		// 	cls: 'ddc_pb_text-warning',
		// });		
		
		// insertAccessSettings(containerEl, this.plugin, () => this.display());
	
		new Setting(containerEl)
			.addButton( (button) => {
				button.setButtonText('Reset settings');
				button.onClick(() => {
					new ConfirmationModal({
						plugin: this.plugin,
						title: 'Please confirm',
						message: 'Revert all Project Browser settings to defaults??',
						confirmLabel: 'Reset settings',
						confirmAction: async () => {
							await this.plugin.resetSettings();
							this.display();
						}
					}).open();
				})
			})
		

	}
}

function insertMoreInfoLinks(containerEl: HTMLElement) {
	const sectionEl = containerEl.createDiv('ddc_pb_settings-section');
	sectionEl.createEl('p', { text: `For information on this plugin's development, visit the links below. Feel free to leave comments in the development diaries on YouTube.` });
	const list = sectionEl.createEl('ul');
	list.createEl('li').createEl('a', {
		href: 'https://github.com/daledesilva/obsidian_project-browser/releases',
		text: 'Latest changes'
	});
	list.createEl('li').createEl('a', {
		href: 'https://github.com/daledesilva/obsidian_project-browser',
		text: 'Roadmap'
	});
	list.createEl('li').createEl('a', {
		href: 'https://youtube.com/playlist?list=PLAiv7XV4xFx3_JUHGUp_vrqturMTsoBUZ&si=VO6nlt2v0KG224cY',
		text: 'Development diaries.'
	});
	list.createEl('li').createEl('a', {
		href: 'https://github.com/daledesilva/obsidian_project-browser/issues',
		text: 'Request feature / Report bug.'
	});
}

function insertAccessSettings(containerEl: HTMLElement, plugin: InkPlugin, refresh: Function) {

	const sectionEl = containerEl.createDiv('ddc_pb_settings-section');

	new Setting(sectionEl)
		.setClass('ddc_pb_setting')
		.setName('Replace empty tab')
		.setDesc('Create a new, empty tab to access the Project Browser.')
		.addToggle((toggle) => {
			toggle.setValue(plugin.settings.access.replaceNewTab);
			toggle.onChange(async (value) => {
				plugin.settings.access.replaceNewTab = value;
				await plugin.saveSettings();
				refresh();
			});
		});

	new Setting(sectionEl)
		.setClass('ddc_pb_setting')
		.setName('Enable ribbon icon')
		.setDesc('Click an icon in the Obsidian ribbon menu bar to open the Project Browser in a new tab.')
		.addToggle((toggle) => {
			toggle.setValue(plugin.settings.access.enableRibbonIcon);
			toggle.onChange(async (value) => {
				plugin.settings.access.enableRibbonIcon = value;
				await plugin.saveSettings();
				refresh();
			});
		});

	new Setting(sectionEl)
		.setClass('ddc_pb_setting')
		.setName('Enable command')
		.setDesc('Run a command from the Command Palette at any time to open the Project Browser in a new tab.')
		.addToggle((toggle) => {
			toggle.setValue(plugin.settings.access.enableCommand);
			toggle.onChange(async (value) => {
				plugin.settings.access.enableCommand = value;
				await plugin.saveSettings();
				refresh();
			});
		});

	new Setting(sectionEl)
		.setClass('ddc_pb_setting')
		.setName('Launch folder')
		.setDesc('Which folder should new Project Browser tabs open in.')
		.addText((text) => {
			text.setValue(plugin.settings.access.launchFolder);
			text.inputEl.addEventListener( 'blur', (e) => {
				const safeValue = folderPathSanitize(text.getValue());
				text.setValue(safeValue);
				plugin.settings.access.launchFolder = safeValue;
				plugin.saveSettings();
			})
		})

}

function insertStateSettings(containerEl: HTMLElement, plugin: InkPlugin, refresh: Function) {
	const sectionEl = containerEl.createDiv('ddc_pb_settings-section ddc_pb_controls-section');
	sectionEl.createEl('h2', { text: 'States' });
	sectionEl.createEl('p', { text: `This is the list of categories that Project Browser will help assign notes and group by in the Browser view. Add new states and drag them to reorder or delete.` });
	// sectionEl.createEl('p', { text: `Notes states will appear in reverse order in the Browser view so that more progressed notes are shown higher. Hidden states will not show.` });
	insertStateEditor(sectionEl, plugin);
}

function insertNoteSettings(containerEl: HTMLElement, plugin: InkPlugin, refresh: Function) {
	const sectionEl = containerEl.createDiv('ddc_pb_settings-section ddc_pb_controls-section');
	sectionEl.createEl('h2', { text: 'Notes' });
	sectionEl.createEl('p', { text: 'This section defines how Project Browser features are integrated on screen when your markdown notes display.' });
	new Setting(sectionEl)
		.setClass('ddc_pb_setting')
		.setName('Show state menu in notes')
		.addToggle((toggle) => {
			toggle.setValue(plugin.settings.showStateMenu);
			toggle.onChange(async (value) => {
				plugin.settings.showStateMenu = value;
				await plugin.saveSettings();
				refresh();
			});
		});

}

function insertDrawingSettings(containerEl: HTMLElement) {
	const sectionEl = containerEl.createDiv('ddc_pb_settings-section ddc_pb_controls-section');
	sectionEl.createEl('h2', { text: 'Drawing' });
	sectionEl.createEl('p', { text: `While editing a Markdown file, run the action 'Insert new hand drawn section' to embed a drawing canvas.` });
}

function insertWritingSettings(containerEl: HTMLElement) {
	const sectionEl = containerEl.createDiv('ddc_pb_settings-section ddc_pb_controls-section');
	sectionEl.createEl('h2', { text: 'Writing' });
	sectionEl.createEl('p', { text: `While editing a Markdown file, run the action 'Insert new handwriting section' to embed a section for writing with a stylus.` });
	insertWritingLimitations(sectionEl);
}

function insertWritingLimitations(containerEl: HTMLElement) {
	const sectionEl = containerEl.createDiv('ddc_pb_settings-section ddc_pb_current-limitations-section');
	const accordion = sectionEl.createEl('details');
	accordion.createEl('summary', { text: `Notable writing limitations (Expand for details)` });
	accordion.createEl('p', { text: `Only the last 300 strokes will be visible while writing (Others will dissapear). This is because the plugin currently experiences lag while displaying long amounts of writing that degrades pen fluidity.` });
	accordion.createEl('p', { text: `All your writing is still saved, however, and will appear in full whenever the embed is locked.` });
}

function insertPrereleaseWarning(containerEl: HTMLElement) {
	const sectionEl = containerEl.createDiv('ddc_pb_settings-section ddc_pb_prerelease-warning-section');
	const accordion = sectionEl.createEl('details', {cls: 'ddc_pb_settings-section-warning'});
	accordion.createEl('summary', { text: `This plugin is in an Alpha state (Expand for details)` });
	accordion.createEl('p', { text: `What does Alpha mean? Development of products like this plugin often involve moving through multiple different stages (e.g. Alpha, Beta, then Standard Release).` });
	accordion.createEl('p', { text: `Alpha, the current stage, means that this plugin is in early development and may undergo large changes that break or change previous functionality.` });
	accordion.createEl('p', { text: `While in Alpha, please exercise caution while using the plugin, however, note that I (The developer of this plugin) am proceeding with caution to help ensure any files created in this version will be compatible or converted to work with future versions (My own vaults depend on it as well).` });
}

function insertGenericWarning(containerEl: HTMLElement, text: string) {
	const sectionEl = containerEl.createDiv('ddc_pb_settings-section ddc_pb_generic-warning-section');
	const warningEl = sectionEl.createDiv('ddc_pb_settings-section-warning');
	warningEl.createEl('p', {text});
}
