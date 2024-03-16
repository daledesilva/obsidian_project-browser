import { App, Modal, Notice, Setting, TFile, TFolder } from "obsidian";
import { singleOrPlural } from "src/logic/string-processes";
import ProjectCardsPlugin from "src/main";
import MyPlugin from "src/main";
import { createProject } from "src/utils/file-manipulation";

/////////
/////////

interface NewProjectModalProps {
    plugin: ProjectCardsPlugin,
    folder: TFolder,
}

export class NewProjectModal extends Modal {
    plugin: ProjectCardsPlugin;
    folder: TFolder;
    projectName: string;
    resolveModal: (file: boolean) => void;
	rejectModal: (reason: string) => void;

	constructor(props: NewProjectModalProps) {
		super(props.plugin.app);
		this.plugin = props.plugin;
		this.folder = props.folder;
	}

    /**
	 * Opens the modal and returns the file created.
	 */
	public showModal(): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.open();
			this.resolveModal = resolve;
			this.rejectModal = reject;
		})
	}

	public onOpen() {
		const {titleEl, contentEl} = this;

		titleEl.setText('Create new project');
		contentEl.createEl('p', {text: 'This will create a project in this location with an article inside it. You can then create other files inside that folder to support the project.'});
        contentEl.createEl('p', {text: '(This will be more customisable and intuitive int he future, this is just the first implementation))'});
		
        new Setting(contentEl)
            .setClass('project-browser_setting')
            .setName('Project name')
            .addText((text) => {
                text.setValue(this.projectName);
                text.inputEl.addEventListener('blur', async (e) => {
                    console.log('on blur');
                    // const value = folderPathSanitize(text.getValue(), plugin.settings);
                    // plugin.settings.folderNames.notes = value;
                    this.projectName = text.getValue();
                    text.setValue(this.projectName);
                    // await plugin.saveSettings();
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
			confirmBtn.onClick( () => {
                createProject(this.folder, this.projectName)
                this.resolveModal(true);
				this.close();
			})
		})

	}

	public onClose() {
		const {titleEl, contentEl} = this;
		titleEl.empty();
		contentEl.empty();
	}

}

