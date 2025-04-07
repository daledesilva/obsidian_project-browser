import { Keyboard } from "lucide-react";
import { App, Modal, Notice, Setting, TextComponent, TFile, TFolder, ToggleComponent } from "obsidian";
import { getGlobals } from "src/logic/stores";
import { PluginStateSettings, StateViewMode } from "src/types/types-map";
import { createProject } from "src/utils/file-manipulation";
import { sanitizeInternalLinkName } from "src/utils/string-processes";

/////////
/////////

interface NewStateModalProps {
	title?: string,
	onSuccess: (newState: PluginStateSettings) => {},
	onReject?: (reason: string) => {},
}

export class NewStateModal extends Modal {
	title: string;
	onSuccess: (newState: PluginStateSettings) => {};
	onReject: ((reason: string) => {}) | undefined;
	////
    resolveModal: (state: PluginStateSettings) => void;
	rejectModal: (reason: string) => void;
	stateSettings: PluginStateSettings = {
		name: '',
		defaultView: StateViewMode.DetailedCards,
		link: true,
	}
	//
	nameInputEl: TextComponent;
	linkInputEl: ToggleComponent;

	constructor(props: NewStateModalProps) {
		const {plugin} = getGlobals();
		super(plugin.app);
		this.title = props.title ? props.title : 'Create new state'
		this.onSuccess = props.onSuccess;
		this.onReject = props.onReject;
	}

    /**
	 * Opens the modal and returns a promise
	 */
	public showModal(): Promise<PluginStateSettings | string> {
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
				this.nameInputEl = text;
                text.setValue(this.stateSettings.name);
                text.inputEl.addEventListener('blur', async (e) => {
					this.sanitizeStateNameAndLink(text.getValue());
                });
                text.inputEl.addEventListener('keydown', (event) => {
                    if ((event as KeyboardEvent).key === "Enter") {
                        this.sanitizeStateNameAndLink(text.getValue());
                    }
                });
            });

		new Setting(contentEl)
            .setClass('ddc_pb_setting')
            .setName('Default view')
			.addDropdown((dropdown) => {
				Object.values(StateViewMode).map((viewModeStr: StateViewMode) => {
					dropdown.addOption(viewModeStr, viewModeStr);
				});
				dropdown.setValue(this.stateSettings.defaultView.toString());
				dropdown.selectEl.addEventListener('change', (event) => {
                    this.stateSettings.defaultView = dropdown.getValue() as StateViewMode;
                });
			})

		new Setting(contentEl)
		.setClass('ddc_pb_setting')
		.setName('Treat as link')
		.setDesc(`This will input states as internal Obsidian links so that they can be opened and will appear in the graph view as nodes.`)
		.addToggle((toggle) => {
			this.linkInputEl = toggle;
			toggle.setValue(this.stateSettings.link ?? false);
			toggle.onChange(async (value) => {
				this.stateSettings.link = value;
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
				if(!this.stateSettings.name) return;	// TODO: Put in proper field validation and feedback
				this.close();
				this.onSuccess(this.stateSettings);
			})
		})

	}

	public onClose() {
		const {titleEl, contentEl} = this;
		titleEl.empty();
		contentEl.empty();
	}

    // Helper functions
    ///////////////////

	sanitizeStateNameAndLink(rawInput: string) {
		const trimmedName = rawInput.trim();
		const delinkedName = sanitizeInternalLinkName(trimmedName);
		this.nameInputEl.setValue(delinkedName);
		this.stateSettings.name = delinkedName;

		if(trimmedName !== delinkedName) {
			// it was input as a link, so remember that seeting seeing as it's now stripped from the name
			this.stateSettings.link = true;
			this.linkInputEl.setValue(true);
		}
	}
}

