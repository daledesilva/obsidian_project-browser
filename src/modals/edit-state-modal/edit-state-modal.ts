import { App, Modal, Notice, Setting, TextComponent, TFile, TFolder, ToggleComponent } from "obsidian";
import { getGlobals } from "src/logic/stores";
import { StateViewMode, StateSettings } from "src/types/types-map";
import { sanitizeInternalLinkName } from "src/utils/string-processes";

/////////
/////////

interface EditStateModalProps {
	stateSettings: StateSettings,
	onSuccess: (modifiedStateSettings: StateSettings) => {},
	onReject?: (reason: string) => {},
}

export class EditStateModal extends Modal {
	onSuccess: (modifiedStateSettings: StateSettings) => {};
	onReject: ((reason: string) => {}) | undefined;
	////
    resolveModal: (modifiedStateSettings: StateSettings) => void;
	rejectModal: (reason: string) => void;
	stateSettings: StateSettings;
	//
	nameInputEl: TextComponent;
	linkInputEl: ToggleComponent;

	constructor(props: EditStateModalProps) {
		const {plugin} = getGlobals();
		super(plugin.app);
		this.stateSettings = JSON.parse(JSON.stringify(props.stateSettings));
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

		titleEl.setText('Edit state');

		contentEl.createEl('p', { text: `Note: Editing the state's name won't update existing notes with that state.` });
        
        new Setting(contentEl)
            .setClass('ddc_pb_setting')
            .setName('Name')
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
			confirmBtn.setButtonText('Save state');
			confirmBtn.onClick( () => {
				if(!this.stateSettings.name) return;
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

