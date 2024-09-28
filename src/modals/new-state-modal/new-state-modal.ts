import { Keyboard } from "lucide-react";
import { App, Modal, Notice, Setting, TFile, TFolder } from "obsidian";
import { singleOrPlural } from "src/logic/string-processes";
import ProjectBrowserPlugin from "src/main";
import MyPlugin from "src/main";
import { PluginStateSettings_0_0_5, StateViewMode_0_0_5 } from "src/types/plugin-settings0_0_5";
import { createProject } from "src/utils/file-manipulation";

/////////
/////////

interface NewStateModalProps {
    plugin: ProjectBrowserPlugin,
	title?: string,
	onSuccess: (newState: PluginStateSettings_0_0_5) => {},
	onReject?: (reason: string) => {},
}

export class NewStateModal extends Modal {
    plugin: ProjectBrowserPlugin;
	title: string;
	onSuccess: (newState: PluginStateSettings_0_0_5) => {};
	onReject: ((reason: string) => {}) | undefined;
	////
    resolveModal: (state: PluginStateSettings_0_0_5) => void;
	rejectModal: (reason: string) => void;
	state: PluginStateSettings_0_0_5 = {
		name: '',
		defaultView: StateViewMode_0_0_5.DetailedCards
	}

	constructor(props: NewStateModalProps) {
		super(props.plugin.app);
		this.plugin = props.plugin;
		this.title = props.title ? props.title : 'Create new state'
		this.onSuccess = props.onSuccess;
		this.onReject = props.onReject;
	}

    /**
	 * Opens the modal and returns a promise
	 */
	public showModal(): Promise<PluginStateSettings_0_0_5 | string> {
		return new Promise((resolve, reject) => {
			this.open();
			this.resolveModal = resolve;
			this.rejectModal = reject;
		})
	}

	public onOpen() {
		const {titleEl, contentEl} = this;

		titleEl.setText(this.title);
        
        new Setting(contentEl)
            .setClass('ddc_pb_setting')
            .setName('Enter name of new state')
            .addText((text) => {
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
			confirmBtn.setButtonText('Create state');
			confirmBtn.onClick( () => {
				if(!this.state.name) return;	// TODO: Put in proper field validation and feedback
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

    private async initCreateState() {
        // const file = await createProject(this.folder, this.projectName)
        this.resolveModal(this.state);
        this.close();
    }
}

