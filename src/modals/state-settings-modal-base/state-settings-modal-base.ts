import { Keyboard } from "lucide-react";
import { App, Modal, Notice, Setting, TextComponent, TFile, TFolder, ToggleComponent } from "obsidian";
import { getGlobals } from "src/logic/stores";
import { DEFAULT_STATE_SETTINGS, StateSettings, StateViewMode } from "src/types/types-map";
import { createProject } from "src/utils/file-manipulation";
import { sanitizeInternalLinkName } from "src/utils/string-processes";

/////////
/////////

interface StateSettingsModalBaseProps {
	title?: string,
	introText?: string,
	actionButtonLabel?: string,
	stateSettings?: StateSettings,
	onSuccess: (newState: StateSettings) => {},
	onReject?: (reason: string) => {},
}

export class StateSettingsModalBase extends Modal {
	title: string = 'State settings';
	introText: string;
	actionButtonLabel: string = 'Save state';
	onSuccess: (newState: StateSettings) => {};
	onReject: ((reason: string) => {}) | undefined;
	////
    resolveModal: (state: StateSettings) => void;
	rejectModal: (reason: string) => void;
	stateSettings: StateSettings = {
		...DEFAULT_STATE_SETTINGS,
	}
	//
	nameInputEl: TextComponent;
	linkInputEl: ToggleComponent;

	constructor(props: StateSettingsModalBaseProps) {
		const {plugin} = getGlobals();
		super(plugin.app);
		if(props.title) this.title = props.title;
		if(props.introText) this.introText = props.introText;
		if(props.actionButtonLabel) this.actionButtonLabel = props.actionButtonLabel;
		if(props.stateSettings) this.stateSettings = JSON.parse(JSON.stringify(props.stateSettings));
		this.onSuccess = props.onSuccess;
		this.onReject = props.onReject;
	}

    /**
	 * Opens the modal and returns a promise
	 */
	public showModal(): Promise<StateSettings | string> {
		return new Promise((resolve, reject) => {
			this.open();
			this.resolveModal = resolve;
			this.rejectModal = reject;
		})
	}

	public onOpen() {
		const {titleEl, contentEl} = this;

		titleEl.setText(this.title);
		if(this.introText) {
			contentEl.createEl('p', { text: this.introText });
		}
        
        new Setting(contentEl)
            .setClass('ddc_pb_setting')
            .setName('Enter name of new state')
            .addText((text) => {
				this.nameInputEl = text;
                text.setValue(this.stateSettings.name);
                text.inputEl.addEventListener('blur', async (e) => {
					this.sanitizeStateNameAndLink(text.getValue());
                });
                text.inputEl.addEventListener('keydown', (event) => {
                    if ((event as KeyboardEvent).key === "Enter") {
                        this.sanitizeStateNameAndLink(text.getValue());
                    }
                });
            });

		new Setting(contentEl)
            .setClass('ddc_pb_setting')
            .setName('Default view')
			.addDropdown((dropdown) => {
				Object.values(StateViewMode).map((viewModeStr: StateViewMode) => {
					dropdown.addOption(viewModeStr, viewModeStr);
				});
				dropdown.setValue(this.stateSettings.defaultViewMode.toString());
				dropdown.selectEl.addEventListener('change', (event) => {
                    this.stateSettings.defaultViewMode = dropdown.getValue() as StateViewMode;
                });
			})

		new Setting(contentEl)
		.setClass('ddc_pb_setting')
		.setName('Treat as link')
		.setDesc(`This will input states as internal Obsidian links so that they can be opened and will appear in the graph view as nodes.`)
		.addToggle((toggle) => {
			this.linkInputEl = toggle;
			toggle.setValue(this.stateSettings.link ?? false);
			toggle.onChange(async (value) => {
				this.stateSettings.link = value;
			});
		})

		new Setting(contentEl).addButton(cancelBtn => {
			cancelBtn.setClass('ddc_pb_button');
			cancelBtn.setButtonText('Cancel');
			cancelBtn.onClick( () => {
				this.close();
                if(this.rejectModal) this.rejectModal('cancelled');
			})
		})
		.addButton( confirmBtn => {
			confirmBtn.setClass('ddc_pb_button');
			confirmBtn.setCta();
			confirmBtn.setButtonText(this.actionButtonLabel);
			confirmBtn.onClick( () => {
				if(!this.stateSettings.name) return;	// TODO: Put in proper field validation and feedback
				this.close();
				this.onSuccess(this.stateSettings);
			})
		})

	}

	public onClose() {
		const {titleEl, contentEl} = this;
		titleEl.empty();
		contentEl.empty();
	}

    // Helper functions
    ///////////////////

	sanitizeStateNameAndLink(rawInput: string) {
		const trimmedName = rawInput.trim();
		const delinkedName = sanitizeInternalLinkName(trimmedName);
		this.nameInputEl.setValue(delinkedName);
		this.stateSettings.name = delinkedName;

		if(trimmedName !== delinkedName) {
			// it was input as a link, so remember that seeting seeing as it's now stripped from the name
			this.stateSettings.link = true;
			this.linkInputEl.setValue(true);
		}
	}
}

