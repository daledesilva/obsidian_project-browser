import { Keyboard } from "lucide-react";
import { App, Modal, Notice, Setting, TFolder } from "obsidian";
import { getGlobals } from "src/logic/stores";
import { createFolder, createProject, renameTFile, renameTFolder } from "src/utils/file-manipulation";
import { folderPathSanitize, sanitizeFileFolderName } from "src/utils/string-processes";

/////////
/////////

interface RenameFolderModalProps {
    folder: TFolder,
}

export class RenameFolderModal extends Modal {
    folder: TFolder;
    name: string;
    resolveModal: (file: TFolder) => void;
	rejectModal: (reason: string) => void;

	constructor(props: RenameFolderModalProps) {
		const {plugin} = getGlobals();
		super(plugin.app);
		this.folder = props.folder;
		this.name = props.folder.name;
	}

    /**
	 * Opens the modal and returns the folder that was renamed.
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

		titleEl.setText('Rename folder');
		
        const inputSetting = new Setting(contentEl)
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
                        renameTFolder(this.folder, this.name);	// TODO: If this fails, the modal should report a fail
						this.resolveModal(this.folder);
						this.close();
                    }
                });
				text.inputEl.focus();
				text.inputEl.select();
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
			confirmBtn.setButtonText('Save');
			confirmBtn.onClick(() => {
				renameTFolder(this.folder, this.name);	// TODO: If this fails, the modal should report a fail
				this.resolveModal(this.folder);
				this.close();
			})
		})
	}

	public onClose() {
		const {titleEl, contentEl} = this;
		titleEl.empty();
		contentEl.empty();
	}

	//////

}

