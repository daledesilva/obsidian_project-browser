import { StateSettingsModalBase } from "src/modals/state-settings-modal-base/state-settings-modal-base";
import { StateSettings } from "src/types/types-map";

/////////
/////////

interface EditStateModalProps {
	stateSettings: StateSettings,
	onSuccess: (modifiedStateSettings: StateSettings) => {},
	onReject?: (reason: string) => {},
}

export class EditStateModal extends StateSettingsModalBase {
	constructor(props: EditStateModalProps) {
		super({
			title: 'Edit project state',
			introText: 'Note: Editing the project state name won\'t update existing projects with that project state.',
			actionButtonLabel: 'Save project state',
			stateSettings: props.stateSettings,
			onSuccess: props.onSuccess,
			onReject: props.onReject
		});
	}
}

