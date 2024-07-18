import { Keyboard } from "lucide-react";
import { App, Modal, Notice, Setting, TFile, TFolder } from "obsidian";
import { singleOrPlural } from "src/logic/string-processes";
import ProjectBrowserPlugin from "src/main";
import MyPlugin from "src/main";
import { createProject } from "src/utils/file-manipulation";
import { folderPathSanitize } from "src/utils/string-processes";

/////////
/////////

interface NewFolderModalProps {
    plugin: ProjectBrowserPlugin,
    baseFolder: TFolder,
}

export class NewFolderModal extends Modal {
    plugin: ProjectBrowserPlugin;
    baseFolder: TFolder;
    folderName: string;
    resolveModal: (file: TFolder) => void;
	rejectModal: (reason: string) => void;

	constructor(props: NewFolderModalProps) {
		super(props.plugin.app);
		this.plugin = props.plugin;
		this.baseFolder = props.baseFolder;
	}

    /**
	 * Opens the modal and returns the file created.
	 */
	public showModal(): Promise<TFolder> {
		return new Promise((resolve, reject) => {
			this.open();
			this.resolveModal = resolve;
			this.rejectModal = reject;
		})
	}

	public onOpen() {
		const {titleEl, contentEl} = this;

		titleEl.setText('Create new folder');
		// contentEl.createEl('p', {text: 'This will create a folder with the name you specify.'});
		
        new Setting(contentEl)
            .setClass('project-browser_setting')
            .setName('Folder name')
            .addText((text) => {
                text.setValue(this.folderName);
                text.inputEl.addEventListener('blur', async (e) => {
                    // const value = folderPathSanitize(text.getValue(), plugin.settings);
                    // plugin.settings.folderNames.notes = value;
                    this.folderName = text.getValue();
                    // await plugin.saveSettings();
                });
                text.inputEl.addEventListener('keydown', (event) => {
                    if ((event as KeyboardEvent).key === "Enter") {
                        this.folderName = text.getValue();
                        this.createFolder();
                    }
                });
            });

		new Setting(contentEl).addButton(cancelBtn => {
			cancelBtn.setClass('project-browser_button');
			cancelBtn.setButtonText('Cancel');
			cancelBtn.onClick( () => {
                this.rejectModal('cancelled');
				this.close();
			})
		})
		.addButton( confirmBtn => {
			confirmBtn.setClass('project-browser_button');
			confirmBtn.setCta();
			confirmBtn.setButtonText('Create folder');
			confirmBtn.onClick( () => this.createFolder() )
		})

	}

	public onClose() {
		const {titleEl, contentEl} = this;
		titleEl.empty();
		contentEl.empty();
	}

    ////////

    private async createFolder() {
		let folderPath = `${this.baseFolder.path}/${this.folderName}`;
		folderPath = folderPathSanitize(folderPath);
		const folder = await this.plugin.app.vault.createFolder(folderPath);
        this.resolveModal(folder);
        this.close();
    }
}

