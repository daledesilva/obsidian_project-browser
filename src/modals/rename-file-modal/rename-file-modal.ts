import { Keyboard } from "lucide-react";
import { App, Modal, Notice, Setting, TFile } from "obsidian";
import { singleOrPlural } from "src/logic/string-processes";
import ProjectBrowserPlugin from "src/main";
import MyPlugin from "src/main";
import { createFolder, createProject, renameTFile } from "src/utils/file-manipulation";
import { folderPathSanitize, sanitizeFileFolderName } from "src/utils/string-processes";

/////////
/////////

interface RenameFileModalProps {
    plugin: ProjectBrowserPlugin,
    file: TFile,
}

export class RenameFileModal extends Modal {
    plugin: ProjectBrowserPlugin;
    file: TFile;
    name: string;
    resolveModal: (file: TFile) => void;
	rejectModal: (reason: string) => void;

	constructor(props: RenameFileModalProps) {
		super(props.plugin.app);
		this.plugin = props.plugin;
		this.file = props.file;
		this.name = props.file.basename;
	}

    /**
	 * Opens the modal and returns the file that was renamed.
	 */
	public showModal(): Promise<TFile> {
		return new Promise((resolve, reject) => {
			this.open();
			this.resolveModal = resolve;
			this.rejectModal = reject;
		})
	}

	public onOpen() {
		const {titleEl, contentEl} = this;

		titleEl.setText('Rename file');
		contentEl.createEl('p', {text: `Don't include file extension.`});
		
        const inputSetting = new Setting(contentEl)
            .setClass('project-browser_setting')
            .setName('File name')
            .addText((text) => {
                text.setValue(this.name);
                text.inputEl.addEventListener('blur', async (e) => {
                    this.name = sanitizeFileFolderName(text.getValue());
					if(this.name.trim() === '') this.name = 'Unnamed';
					text.inputEl.value = this.name;
                });
                text.inputEl.addEventListener('keyup', async (event) => {
                    if ((event as KeyboardEvent).key === "Enter") {
						this.name = sanitizeFileFolderName(text.getValue());
						if(this.name.trim() === '') this.name = 'Unnamed';
                        renameTFile(this.file, this.name);
						this.resolveModal(this.file);
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
				renameTFile(this.file, this.name);	// TODO: If this fails, the modal should report a fail
				this.resolveModal(this.file);
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

