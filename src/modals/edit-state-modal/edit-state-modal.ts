import { Keyboard } from "lucide-react";
import { App, Modal, Notice, Setting, TFile, TFolder } from "obsidian";
import { singleOrPlural } from "src/logic/string-processes";
import ProjectBrowserPlugin from "src/main";
import MyPlugin from "src/main";
import { StateSettings_0_0_5, StateViewMode_0_0_5 } from "src/types/plugin-settings0_0_5";
import { createProject } from "src/utils/file-manipulation";

/////////
/////////

interface EditStateModalProps {
    plugin: ProjectBrowserPlugin,
	stateSettings: StateSettings_0_0_5,
	onSuccess: (modifiedStateSettings: StateSettings_0_0_5) => {},
	onReject?: (reason: string) => {},
}

export class EditStateModal extends Modal {
    plugin: ProjectBrowserPlugin;
	onSuccess: (modifiedStateSettings: StateSettings_0_0_5) => {};
	onReject: ((reason: string) => {}) | undefined;
	////
    resolveModal: (modifiedStateSettings: StateSettings_0_0_5) => void;
	rejectModal: (reason: string) => void;
	state: StateSettings_0_0_5;

	constructor(props: EditStateModalProps) {
		super(props.plugin.app);
		this.plugin = props.plugin;
		this.state = props.stateSettings;
		this.onSuccess = props.onSuccess;
		this.onReject = props.onReject;
	}

    /**
	 * Opens the modal and returns a promise
	 */
	public showModal(): Promise<StateSettings_0_0_5 | string> {
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
				text.setValue(this.state.name);
                text.inputEl.addEventListener('blur', async (e) => {
                    this.state.name = text.getValue().trim();	// TODO: Put in proper sanitation
                });
                text.inputEl.addEventListener('keydown', (event) => {
                    if ((event as KeyboardEvent).key === "Enter") {
                        this.state.name = text.getValue().trim();	// TODO: Put in proper sanitation
                    }
                });
            });

        new Setting(contentEl)
            .setClass('ddc_pb_setting')
            .setName('Default view')
			.addDropdown((dropdown) => {

				Object.values(StateViewMode_0_0_5).map((viewModeStr) => {
					dropdown.addOption(viewModeStr, viewModeStr);
				});
				dropdown.setValue(this.state.defaultView.toString());
				dropdown.selectEl.addEventListener('change', (event) => {
                    this.state.defaultView = dropdown.getValue() as StateViewMode_0_0_5;
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
				if(!this.state.name) return;
				this.close();
				this.onSuccess(this.state);
			})
		})

	}

	public onClose() {
		const {titleEl, contentEl} = this;
		titleEl.empty();
		contentEl.empty();
	}

    ////////

}

