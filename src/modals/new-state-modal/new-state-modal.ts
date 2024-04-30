import { Keyboard } from "lucide-react";
import { App, Modal, Notice, Setting, TFile, TFolder } from "obsidian";
import { singleOrPlural } from "src/logic/string-processes";
import ProjectBrowserPlugin from "src/main";
import MyPlugin from "src/main";
import { createProject } from "src/utils/file-manipulation";

/////////
/////////

interface NewStateModalProps {
    plugin: ProjectBrowserPlugin,
	title?: string,
	onSuccess: (newState: string) => {},
	onReject?: (newState: string) => {},
}

export class NewStateModal extends Modal {
    plugin: ProjectBrowserPlugin;
	title: string;
	onSuccess: (newState: string) => {};
	onReject: ((newState: string) => {}) | undefined;
	////
    resolveModal: (state: string) => void;
	rejectModal: (reason: string) => void;
	state: string;

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
	public showModal(): Promise<string> {
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
                    // const value = folderPathSanitize(text.getValue(), plugin.settings);
                    // plugin.settings.folderNames.notes = value;
                    this.state = text.getValue();
                    // await plugin.saveSettings();
                });
                text.inputEl.addEventListener('keydown', (event) => {
                    if ((event as KeyboardEvent).key === "Enter") {
                        this.state = text.getValue();
                    }
                });
            });

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

