import { insertStateEditor } from "src/components/state-editor/state-editor";
import { insertProjectPageStateEditor } from "src/components/project-page-state-editor/project-page-state-editor";
import { insertFileTypeEditor } from "src/components/file-type-editor/file-type-editor";
import "src/shared/settings.scss";
import { PluginSettingTab, Setting } from "obsidian";
import MyPlugin from "src/main";
import { ConfirmationModal } from "src/modals/confirmation-modal/confirmation-modal";
import { folderPathSanitize } from "src/utils/string-processes";
import { getGlobals } from "src/logic/stores";
import { StateSettings } from "src/types/types-map";
import { showWelcomeTips } from "src/notices/onboarding-notices";

/////////
/////////

export function registerSettingsTab() {
	const { plugin } = getGlobals();
	plugin.addSettingTab(new MySettingsTab());
}

export class MySettingsTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor() {
		const { plugin } = getGlobals();
		super(plugin.app, plugin);
		this.plugin = plugin;
	}

	display = (): void => {
		const { containerEl } = this;

		containerEl.empty();

		containerEl
			.createEl("p")
			.setText(
				"Displays your projects as a friendly list of cards. Add multiple pages to projects, apply and group by statuses and priorities, customise card appearances, and filter simply by typing.",
			);

		containerEl.createEl("hr");
		insertSetupTroubleshootSection(containerEl);
		insertAccessSettings(containerEl, this.display);
		containerEl.createEl("hr");
		insertStateSettings(containerEl, this.display);
		containerEl.createEl("hr");
		insertProjectPageStateSettings(containerEl, this.display);
		containerEl.createEl("hr");
		insertPrioritySettings(containerEl, this.display);
		containerEl.createEl("hr");
		insertNoteSettings(containerEl, this.display);
		containerEl.createEl("hr");
		insertFileTypeSettings(containerEl, this.display);

		new Setting(containerEl)
			.setClass("ddc_pb_bare-setting")
			.addButton((button) => {
				button.setButtonText("Reset settings…");
				button.onClick(() => {
					new ConfirmationModal({
						title: "Please confirm",
						message:
							"Revert all Project Browser settings to defaults?",
						confirmLabel: "Reset settings",
						confirmAction: async () => {
							await this.plugin.resetSettings();
							this.display();
						},
					}).open();
				});
			});

		containerEl.createEl("hr");
		insertMoreInfoLinks(containerEl);
	};
}

function insertMoreInfoLinks(containerEl: HTMLElement) {
	const wrapperEl = containerEl.createDiv("ddc_pb_section");
	const sectionEl = wrapperEl.createDiv("ddc_pb_controls-section");

	new Setting(sectionEl)
		.setClass("ddc_pb_controls-header")
		.setName("Plugin development")
		.setDesc(
			"For information on this plugin's development, visit the links below.",
		);

	const contentEl = sectionEl.createDiv("ddc_pb_controls-content");
	const tipsGridEl = contentEl.createDiv("ddc_pb_tips-grid");

	const addLinkRow = (
		parent: HTMLElement,
		href: string,
		label: string,
		description: string,
	) => {
		const labelEl = parent.createDiv("ddc_pb_tips-label");
		const link = labelEl.createEl("a", { href, text: label });
		link.setAttribute("target", "_blank");
		link.setAttribute("rel", "noopener");
		parent.createDiv("ddc_pb_tips-desc").setText(description);
	};

	addLinkRow(
		tipsGridEl,
		"https://github.com/daledesilva/obsidian_project-browser/releases",
		"Latest changes",
		"Version history, release notes, and download links for each Project Browser release.",
	);
	addLinkRow(
		tipsGridEl,
		"https://github.com/daledesilva/obsidian_project-browser",
		"Roadmap",
		"Main repository with source code, roadmap, and project information.",
	);
	addLinkRow(
		tipsGridEl,
		"https://youtube.com/playlist?list=PLAiv7XV4xFx3_JUHGUp_vrqturMTsoBUZ&si=VO6nlt2v0KG224cY",
		"Development diaries",
		"Video diaries documenting the plugin's development progress.",
	);
	addLinkRow(
		tipsGridEl,
		"https://github.com/daledesilva/obsidian_project-browser/issues",
		"Request feature / Report bug",
		"Submit feature requests, report bugs, or join the discussion.",
	);
}

function insertSetupTroubleshootSection(containerEl: HTMLElement) {
	const { plugin } = getGlobals();
	const isExpanded = plugin.settings.onboardingSectionExpanded ?? true;

	const wrapperEl = containerEl.createDiv("ddc_pb_section-wrapper");
	if (isExpanded) wrapperEl.classList.add("ddc_pb_expanded");

	const sectionEl = wrapperEl.createDiv("ddc_pb_controls-section");

	const headerSetting = new Setting(sectionEl)
		.setClass("ddc_pb_controls-header")
		.setClass("ddc_pb_controls-header--clickable")
		.setName("Setup & Troubleshoot")
		.setDesc("Configuration tips and getting started resources.");

	const arrowEl = headerSetting.settingEl.createSpan("ddc_pb_collapse-arrow");
	arrowEl.setText("›");
	if (isExpanded) arrowEl.classList.add("ddc_pb_expanded");

	headerSetting.settingEl.addEventListener("click", async () => {
		const expanded = wrapperEl.classList.toggle("ddc_pb_expanded");
		arrowEl.classList.toggle("ddc_pb_expanded", expanded);
		plugin.settings.onboardingSectionExpanded = expanded;
		await plugin.saveSettings();
	});

	const contentEl = sectionEl.createDiv("ddc_pb_controls-content");

	const tipsSectionEl = contentEl.createDiv("ddc_pb_tips-section");
	const tipsGridEl = tipsSectionEl.createDiv("ddc_pb_tips-grid");
	tipsGridEl.createDiv("ddc_pb_tips-label").setText("Obsidian Sync");
	tipsGridEl
		.createDiv("ddc_pb_tips-desc")
		.setText(
			`If using "Obsidian Sync", turn on "Sync all other types" in the Obsidian sync settings. This ensures that your project folder settings are synced across devices.`,
		);

	new Setting(contentEl)
		.setClass("ddc_pb_bare-setting")
		.setClass("ddc_pb_bare-setting--no-bottom-margin")
		.addButton((btn) => {
			btn.setButtonText("Rewatch welcome tips");
			btn.onClick(() => showWelcomeTips());
		});
}

function insertAccessSettings(containerEl: HTMLElement, refresh: () => void) {
	const { plugin } = getGlobals();

	const sectionEl = containerEl.createDiv("ddc_pb_settings-section");

	new Setting(sectionEl)
		.setClass("ddc_pb_setting")
		.setName("Replace empty tab")
		.setDesc("Create a new, empty tab to access the Project Browser.")
		.addToggle((toggle) => {
			toggle.setValue(plugin.settings.access.replaceNewTab);
			toggle.onChange(async (value) => {
				plugin.settings.access.replaceNewTab = value;
				await plugin.saveSettings();
				refresh();
			});
		});

	new Setting(sectionEl)
		.setClass("ddc_pb_setting")
		.setName("Enable ribbon icon")
		.setDesc(
			"Click an icon in the Obsidian ribbon menu bar to open the Project Browser in a new tab.",
		)
		.addToggle((toggle) => {
			toggle.setValue(plugin.settings.access.enableRibbonIcon);
			toggle.onChange(async (value) => {
				plugin.settings.access.enableRibbonIcon = value;
				await plugin.saveSettings();
				refresh();
			});
		});

	new Setting(sectionEl)
		.setClass("ddc_pb_setting")
		.setName("Enable command")
		.setDesc(
			"Run a command from the Command Palette at any time to open the Project Browser in a new tab.",
		)
		.addToggle((toggle) => {
			toggle.setValue(plugin.settings.access.enableCommand);
			toggle.onChange(async (value) => {
				plugin.settings.access.enableCommand = value;
				await plugin.saveSettings();
				refresh();
			});
		});

	new Setting(sectionEl)
		.setClass("ddc_pb_setting")
		.setName("Launch folder")
		.setDesc("Which folder should new Project Browser tabs open in.")
		.addText((text) => {
			text.setValue(plugin.settings.access.launchFolder);
			text.inputEl.addEventListener("blur", (e) => {
				const safeValue = folderPathSanitize(text.getValue());
				text.setValue(safeValue);
				plugin.settings.access.launchFolder = safeValue;
				plugin.saveSettings();
			});
		});

	new Setting(sectionEl)
		.setClass("ddc_pb_setting")
		.setName("Use Aliases")
		.setDesc(
			`Display the first alias of a file as it's name in the Project Browser if available.`,
		)
		.addToggle((toggle) => {
			toggle.setValue(plugin.settings.useAliases);
			toggle.onChange(async (value) => {
				plugin.settings.useAliases = value;
				await plugin.saveSettings();
				refresh();
			});
		});
}

function insertStateSettings(containerEl: HTMLElement, refresh: () => void) {
	const { plugin } = getGlobals();
	const sectionEl = containerEl.createDiv(
		"ddc_pb_controls-section ddc_pb_controls-section--states",
	);

	new Setting(sectionEl)
		.setClass("ddc_pb_controls-header")
		.setName("FIle & Project States")
		.setDesc(
			"This is the list of categories that Project Browser will help assign projects and group by in the Browser view. Add new project states and drag them to reorder or delete.",
		);

	const contentEl = sectionEl.createDiv("ddc_pb_controls-content");

	new Setting(contentEl)
		.setClass("ddc_pb_setting")
		.setName("Loop project states")
		.setDesc(
			"When pressing the hotkeys to step project states forward or backward, should it cycle back to the first or last state when the end is reached?",
		)
		.addToggle((toggle) => {
			toggle.setValue(plugin.settings.loopStatesWhenCycling);
			toggle.onChange(async (value) => {
				plugin.settings.loopStatesWhenCycling = value;
				await plugin.saveSettings();
				refresh();
			});
		});

	insertStateEditor(contentEl);

	new Setting(contentEl)
		.setClass("ddc_pb_setting")
		.setName("Default project state")
		.addDropdown((dropdown) => {
			function updateDropdownOptions() {
				const options: Record<string, string> = {};
				Object.values(plugin.settings.states.visible).map(
					(stateSettings: StateSettings) => {
						options[stateSettings.name] = stateSettings.name;
					},
				);
				Object.values(plugin.settings.states.hidden).map(
					(stateSettings: StateSettings) => {
						options[stateSettings.name] = stateSettings.name;
					},
				);
				options["(None)"] = "(None)";
				dropdown.selectEl.empty();
				dropdown.addOptions(options);
			}
			updateDropdownOptions();
			dropdown.selectEl.addEventListener("focus", (event) => {
				updateDropdownOptions();
			});
			dropdown.selectEl.addEventListener("change", (event) => {
				plugin.settings.defaultState =
					dropdown.getValue() == "(None)"
						? undefined
						: (dropdown.getValue() as string);
				plugin.saveSettings();
			});
		});
}

function insertProjectPageStateSettings(
	containerEl: HTMLElement,
	refresh: () => void,
) {
	const { plugin } = getGlobals();
	const sectionEl = containerEl.createDiv(
		"ddc_pb_controls-section ddc_pb_controls-section--states",
	);

	new Setting(sectionEl)
		.setClass("ddc_pb_controls-header")
		.setName("Page States")
		.setDesc(
			"This is the list of categories that Project Browser will use for markdown pages inside project folders. Add new page states and drag them to reorder or delete.",
		);

	const contentEl = sectionEl.createDiv("ddc_pb_controls-content");

	new Setting(contentEl)
		.setClass("ddc_pb_setting")
		.setName("Loop page states")
		.setDesc(
			"When pressing the hotkeys to step page states forward or backward, should it cycle back to the first or last state when the end is reached?",
		)
		.addToggle((toggle) => {
			toggle.setValue(plugin.settings.loopProjectPageStatesWhenCycling);
			toggle.onChange(async (value) => {
				plugin.settings.loopProjectPageStatesWhenCycling = value;
				await plugin.saveSettings();
				refresh();
			});
		});

	insertProjectPageStateEditor(contentEl);

	new Setting(contentEl)
		.setClass("ddc_pb_setting")
		.setName("Default page state")
		.addDropdown((dropdown) => {
			function updateDropdownOptions() {
				const options: Record<string, string> = {};
				Object.values(plugin.settings.projectPageStates.visible).map(
					(stateSettings: StateSettings) => {
						options[stateSettings.name] = stateSettings.name;
					},
				);
				Object.values(plugin.settings.projectPageStates.hidden).map(
					(stateSettings: StateSettings) => {
						options[stateSettings.name] = stateSettings.name;
					},
				);
				options["(None)"] = "(None)";
				dropdown.selectEl.empty();
				dropdown.addOptions(options);
				dropdown.setValue(
					plugin.settings.defaultProjectPageState ?? "(None)",
				);
			}
			updateDropdownOptions();
			dropdown.selectEl.addEventListener("focus", () => {
				updateDropdownOptions();
			});
			dropdown.selectEl.addEventListener("change", () => {
				plugin.settings.defaultProjectPageState =
					dropdown.getValue() == "(None)"
						? undefined
						: (dropdown.getValue() as string);
				plugin.saveSettings();
			});
		});
}

function createExpandableFileTypeSection(
	parentEl: HTMLElement,
	headerName: string,
	headerDesc: string,
	surface: "projectBrowser" | "pageMenu",
	refresh: () => void,
) {
	const wrapperEl = parentEl.createDiv("ddc_pb_section-wrapper");
	const sectionEl = wrapperEl.createDiv("ddc_pb_controls-section");

	const headerSetting = new Setting(sectionEl)
		.setClass("ddc_pb_controls-header")
		.setClass("ddc_pb_controls-header--clickable")
		.setName(headerName)
		.setDesc(headerDesc);

	const arrowEl = headerSetting.settingEl.createSpan("ddc_pb_collapse-arrow");
	arrowEl.setText("›");

	headerSetting.settingEl.addEventListener("click", () => {
		const expanded = wrapperEl.classList.toggle("ddc_pb_expanded");
		arrowEl.classList.toggle("ddc_pb_expanded", expanded);
	});

	const contentEl = sectionEl.createDiv("ddc_pb_controls-content");
	insertFileTypeEditor(contentEl, refresh, surface);
}

function insertFileTypeSettings(containerEl: HTMLElement, refresh: () => void) {
	const sectionEl = containerEl.createDiv("ddc_pb_section");

	createExpandableFileTypeSection(
		sectionEl,
		"Browser Panel File Visibility",
		"Control which file types appear in the project browser card view.",
		"projectBrowser",
		refresh,
	);

	createExpandableFileTypeSection(
		sectionEl,
		"Page Menu File Visibility",
		"Control which file types appear in the project pages menu.",
		"pageMenu",
		refresh,
	);
}

function insertPrioritySettings(containerEl: HTMLElement, refresh: () => void) {
	const { plugin } = getGlobals();
	const sectionEl = containerEl.createDiv("ddc_pb_controls-section");

	new Setting(sectionEl)
		.setClass("ddc_pb_controls-header")
		.setName("Priorities")
		.setDesc(
			"Files can be given high or low priorities from within the browser panel. This can make notes appear with different styling or as grouped by priority.",
		);

	const contentEl = sectionEl.createDiv("ddc_pb_controls-content");

	new Setting(contentEl)
		.setClass("ddc_pb_setting")
		.setName("Treat priorities as links")
		.setDesc(
			"This will input priorities as internal Obsidian links so that they can be opened and will appear in the graph view as nodes.",
		)
		.addToggle((toggle) => {
			const hasLinkEnabled = plugin.settings.priorities.some(
				(priority) => priority.link,
			);
			toggle.setValue(hasLinkEnabled);
			toggle.onChange(async (value) => {
				plugin.settings.priorities.forEach((priority) => {
					priority.link = value;
				});
				await plugin.saveSettings();
				refresh();
			});
		});
}

function insertNoteSettings(containerEl: HTMLElement, refresh: () => void) {
	const { plugin } = getGlobals();
	const sectionEl = containerEl.createDiv("ddc_pb_controls-section");

	new Setting(sectionEl)
		.setClass("ddc_pb_controls-header")
		.setName("File Overlays")
		.setDesc(
			"This section defines how Project Browser features are integrated on screen when your files are open.",
		);

	const contentEl = sectionEl.createDiv("ddc_pb_controls-content");

	new Setting(contentEl)
		.setClass("ddc_pb_setting")
		.setName("Show state menu in notes")
		.setDesc(
			"This can be toggled any time through a command (Default shortcut: Cmd+Shift+S).",
		)
		.addToggle((toggle) => {
			toggle.setValue(plugin.settings.showStateMenu);
			toggle.onChange(async (value) => {
				plugin.settings.showStateMenu = value;
				await plugin.saveSettings();
				refresh();
			});
		});

	new Setting(contentEl)
		.setClass("ddc_pb_setting")
		.setName("Show extension for non-document files")
		.setDesc(
			"Display the full filename (including extension) for non-document files (e.g. PDF, images). Notes, canvas, and base files always show basename only.",
		)
		.addToggle((toggle) => {
			toggle.setValue(plugin.settings.showFileExtForNonMdFiles);
			toggle.onChange(async (value) => {
				plugin.settings.showFileExtForNonMdFiles = value;
				await plugin.saveSettings();
				refresh();
			});
		});

	new Setting(contentEl)
		.setClass("ddc_pb_setting")
		.setName("Show rename popup when creating new pages")
		.setDesc(
			"When enabled, the renaming popup is shown immediately upon new page creation. Press enter or escape to accept quickly, or disable this setting to prevent the popup showing.",
		)
		.addToggle((toggle) => {
			toggle.setValue(plugin.settings.showRenamePopupOnNewPage ?? true);
			toggle.onChange(async (value) => {
				plugin.settings.showRenamePopupOnNewPage = value;
				await plugin.saveSettings();
				refresh();
			});
		});
}

function insertDrawingSettings(containerEl: HTMLElement) {
	const sectionEl = containerEl.createDiv(
		"ddc_pb_settings-section ddc_pb_controls-section",
	);
	sectionEl.createEl("h2", { text: "Drawing" });
	sectionEl.createEl("p", {
		text: `While editing a Markdown file, run the action 'Insert new hand drawn section' to embed a drawing canvas.`,
	});
}

function insertWritingSettings(containerEl: HTMLElement) {
	const sectionEl = containerEl.createDiv(
		"ddc_pb_settings-section ddc_pb_controls-section",
	);
	sectionEl.createEl("h2", { text: "Writing" });
	sectionEl.createEl("p", {
		text: `While editing a Markdown file, run the action 'Insert new handwriting section' to embed a section for writing with a stylus.`,
	});
	insertWritingLimitations(sectionEl);
}

function insertWritingLimitations(containerEl: HTMLElement) {
	const sectionEl = containerEl.createDiv(
		"ddc_pb_settings-section ddc_pb_current-limitations-section",
	);
	const accordion = sectionEl.createEl("details");
	accordion.createEl("summary", {
		text: `Notable writing limitations (Expand for details)`,
	});
	accordion.createEl("p", {
		text: `Only the last 300 strokes will be visible while writing (Others will dissapear). This is because the plugin currently experiences lag while displaying long amounts of writing that degrades pen fluidity.`,
	});
	accordion.createEl("p", {
		text: `All your writing is still saved, however, and will appear in full whenever the embed is locked.`,
	});
}

function insertPrereleaseWarning(containerEl: HTMLElement) {
	const sectionEl = containerEl.createDiv(
		"ddc_pb_settings-section ddc_pb_prerelease-warning-section",
	);
	const accordion = sectionEl.createEl("details", {
		cls: "ddc_pb_settings-section-warning",
	});
	accordion.createEl("summary", {
		text: `This plugin is in an Alpha state (Expand for details)`,
	});
	accordion.createEl("p", {
		text: `What does Alpha mean? Development of products like this plugin often involve moving through multiple different stages (e.g. Alpha, Beta, then Standard Release).`,
	});
	accordion.createEl("p", {
		text: `Alpha, the current stage, means that this plugin is in early development and may undergo large changes that break or change previous functionality.`,
	});
	accordion.createEl("p", {
		text: `While in Alpha, please exercise caution while using the plugin, however, note that I (The developer of this plugin) am proceeding with caution to help ensure any files created in this version will be compatible or converted to work with future versions (My own vaults depend on it as well).`,
	});
}

function insertGenericWarning(containerEl: HTMLElement, text: string) {
	const sectionEl = containerEl.createDiv(
		"ddc_pb_settings-section ddc_pb_generic-warning-section",
	);
	const warningEl = sectionEl.createDiv("ddc_pb_settings-section-warning");
	warningEl.createEl("p", { text });
}
