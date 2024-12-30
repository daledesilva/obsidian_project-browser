import { App, Modal, Notice, Setting, TextComponent, TFile, TFolder, ToggleComponent } from "obsidian";
import { getGlobals } from "src/logic/stores";
import { trimLinkBrackets } from "src/logic/trim-link-brackets";
import { PluginStateSettings_0_1_0, StateViewMode_0_1_0 } from "src/types/plugin-settings0_1_0";
import { createProject } from "src/utils/file-manipulation";

/////////
/////////

interface EditStateModalProps {
	stateSettings: PluginStateSettings_0_1_0,
	onSuccess: (modifiedStateSettings: PluginStateSettings_0_1_0) => {},
	onReject?: (reason: string) => {},
}

export class EditStateModal extends Modal {
	onSuccess: (modifiedStateSettings: PluginStateSettings_0_1_0) => {};
	onReject: ((reason: string) => {}) | undefined;
	////
    resolveModal: (modifiedStateSettings: PluginStateSettings_0_1_0) => void;
	rejectModal: (reason: string) => void;
	stateSettings: PluginStateSettings_0_1_0;
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
	public showModal(): Promise<PluginStateSettings_0_1_0 | string> {
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
				Object.values(StateViewMode_0_1_0).map((viewModeStr) => {
					dropdown.addOption(viewModeStr, viewModeStr);
				});
				dropdown.setValue(this.stateSettings.defaultView.toString());
				dropdown.selectEl.addEventListener('change', (event) => {
					this.stateSettings.defaultView = dropdown.getValue() as StateViewMode_0_1_0;
				});
			})

		new Setting(contentEl)
		.setClass('ddc_pb_setting')
		.setName('Treat as link')
		.setDesc(`This will input states as internal Obsidian links so that they can be opened and will appear in the graph view as nodes.`)
		.addToggle((toggle) => {
			this.linkInputEl = toggle;
			toggle.setValue(this.stateSettings.link);
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
		const delinkedName = trimLinkBrackets(trimmedName);
		this.nameInputEl.setValue(delinkedName);
		this.stateSettings.name = delinkedName;

		if(trimmedName !== delinkedName) {
			// it was input as a link, so remember that seeting seeing as it's now stripped from the name
			this.stateSettings.link = true;
			this.linkInputEl.setValue(true);
		}
	}

}

