import { Keyboard } from "lucide-react";
import { App, Modal, Notice, Setting, TFile, TFolder } from "obsidian";
import { getGlobals } from "src/logic/stores";
import MyPlugin from "src/main";
import { createFolder, createProject } from "src/utils/file-manipulation";
import { folderPathSanitize, sanitizeFileFolderName } from "src/utils/string-processes";

/////////
/////////

interface NewFolderModalProps {
    baseFolder: TFolder,
}

export class NewFolderModal extends Modal {
    baseFolder: TFolder;
    name: string;
    resolveModal: (file: TFolder) => void;
	rejectModal: (reason: string) => void;

	constructor(props: NewFolderModalProps) {
		const {plugin} = getGlobals();
		super(plugin.app);
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
                text.setValue(this.name);
                text.inputEl.addEventListener('blur', async (e) => {
                    this.name = sanitizeFileFolderName(text.getValue());
					if(this.name.trim() ==='') this.name = 'Unnamed';
					text.setValue(this.name);
                });
                text.inputEl.addEventListener('keyup', async (event) => {
                    if ((event as KeyboardEvent).key === "Enter") {
                        this.name = sanitizeFileFolderName(text.getValue());
						if(this.name.trim() ==='') this.name = 'Unnamed';
						text.setValue(this.name);
						let folderPath = `${this.baseFolder.path}/${this.name}`;
						const newFolder = await createFolder(folderPath);
						this.resolveModal(newFolder);
						this.close();
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
			confirmBtn.onClick( async () => {
				let folderPath = `${this.baseFolder.path}/${this.name}`;
				const newFolder = await createFolder(folderPath);
				this.resolveModal(newFolder);
				this.close();
			} )
		})

	}

	public onClose() {
		const {titleEl, contentEl} = this;
		titleEl.empty();
		contentEl.empty();
	}

}

