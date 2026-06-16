import { Modal, Setting, TFile, TFolder } from "obsidian";
import { getGlobals } from "src/logic/stores";
import { createSubproject } from "src/utils/file-manipulation";
import { sanitizeFileFolderName } from "src/utils/string-processes";

/////////
/////////

interface NewSubprojectModalProps {
    parentFolder: TFolder,
}

export class NewSubprojectModal extends Modal {
    parentFolder: TFolder;
    name: string;
    resolveModal: (file: TFile) => void;
	rejectModal: (reason: string) => void;

	constructor(props: NewSubprojectModalProps) {
		const {plugin} = getGlobals();
		super(plugin.app);
		this.parentFolder = props.parentFolder;
		this.name = 'New subproject';
	}

    /**
	 * Opens the modal and returns the first page created in the new subproject.
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

		titleEl.setText('Create new subproject');

        new Setting(contentEl)
            .setClass('project-browser_setting')
            .setName('Project name')
            .addText((text) => {
                text.setValue(this.name);
                text.inputEl.addEventListener('blur', async () => {
                    this.name = sanitizeFileFolderName(text.getValue());
					if(this.name.trim() === '') this.name = 'Unnamed';
					text.setValue(this.name);
                });
                text.inputEl.addEventListener('keydown', (event) => {
                    if (event.key === "Enter") {
                        this.name = sanitizeFileFolderName(text.getValue());
						if(this.name.trim() === '') this.name = 'Unnamed';
						text.setValue(this.name);
                        void this.initCreateSubproject();
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
			confirmBtn.setButtonText('Create subproject');
			confirmBtn.onClick( () => { void this.initCreateSubproject(); } )
		})

	}

	public onClose() {
		const {titleEl, contentEl} = this;
		titleEl.empty();
		contentEl.empty();
	}

    ////////

    private async initCreateSubproject() {
        const file = await createSubproject(this.parentFolder, this.name);
        this.resolveModal(file);
        this.close();
    }
}
