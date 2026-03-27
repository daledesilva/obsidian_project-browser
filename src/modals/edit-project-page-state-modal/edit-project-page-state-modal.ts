import { StateSettingsModalBase } from "src/modals/state-settings-modal-base/state-settings-modal-base";
import { StateSettings } from "src/types/types-map";

interface EditProjectPageStateModalProps {
	stateSettings: StateSettings,
	onSuccess: (modifiedStateSettings: StateSettings) => {},
	onReject?: (reason: string) => {},
}

export class EditProjectPageStateModal extends StateSettingsModalBase {
	constructor(props: EditProjectPageStateModalProps) {
		super({
			title: 'Edit page state',
			introText: 'Note: Editing the page state name will not update existing project pages with that page state.',
			actionButtonLabel: 'Save page state',
			stateSettings: props.stateSettings,
			onSuccess: props.onSuccess,
			onReject: props.onReject
		});
	}
}
