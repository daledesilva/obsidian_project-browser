import { Keyboard } from "lucide-react";
import { App, Modal, Notice, Setting, TFile, TFolder } from "obsidian";
import { getGlobals } from "src/logic/stores";
import MyPlugin from "src/main";
import { createProject } from "src/utils/file-manipulation";
import { sanitizeFileFolderName } from "src/utils/string-processes";

/////////
/////////

interface NewProjectModalProps {
    folder: TFolder,
}

export class NewProjectModal extends Modal {
    folder: TFolder;
    name: string;
    resolveModal: (file: TFile) => void;
	rejectModal: (reason: string) => void;

	constructor(props: NewProjectModalProps) {
		const {plugin} = getGlobals();
		super(plugin.app);
		this.folder = props.folder;
	}

    /**
	 * Opens the modal and returns the file created.
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

		titleEl.setText('Create new project');
		contentEl.createEl('p', {text: 'This will create a new note.'});
        contentEl.createEl('p', {text: 'In the future this will be'});
		
        new Setting(contentEl)
            .setClass('project-browser_setting')
            .setName('Project name')
            .addText((text) => {
                text.setValue(this.name);
                text.inputEl.addEventListener('blur', async (e) => {
                    this.name = sanitizeFileFolderName(text.getValue());
					if(this.name.trim() ==='') this.name = 'Unnamed';
					text.setValue(this.name);
                });
                text.inputEl.addEventListener('keydown', (event) => {
                    if ((event as KeyboardEvent).key === "Enter") {
                        this.name = sanitizeFileFolderName(text.getValue());
						if(this.name.trim() ==='') this.name = 'Unnamed';
						text.setValue(this.name);
                        this.initCreateProject();
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
			confirmBtn.setButtonText('Create project');
			confirmBtn.onClick( () => this.initCreateProject() )
		})

	}

	public onClose() {
		const {titleEl, contentEl} = this;
		titleEl.empty();
		contentEl.empty();
	}

    ////////

    private async initCreateProject() {
        const file = await createProject({
            parentFolder: this.folder,
            projectName: this.name
        });
        this.resolveModal(file);
        this.close();
    }
}

