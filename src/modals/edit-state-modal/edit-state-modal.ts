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
			title: 'Edit state',
			introText: 'Note: Editing the state\'s name won\'t update existing notes with that state.',
			actionButtonLabel: 'Save state',
			stateSettings: props.stateSettings,
			onSuccess: props.onSuccess,
			onReject: props.onReject
		});
	}
}

