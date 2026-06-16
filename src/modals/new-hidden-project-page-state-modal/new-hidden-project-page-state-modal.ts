import { StateSettingsModalBase } from "src/modals/state-settings-modal-base/state-settings-modal-base";
import { StateSettings } from "src/types/types-map";

interface NewHiddenProjectPageStateModalProps {
	onSuccess: (newStateSettings: StateSettings) => {},
	onReject?: (reason: string) => {},
}

export class NewHiddenProjectPageStateModal extends StateSettingsModalBase {
	constructor(props: NewHiddenProjectPageStateModalProps) {
		super({
			title: 'Create new hidden page state',
			introText: 'Create a new hidden page state to categorize project pages.',
			actionButtonLabel: 'Create hidden page state',
			onSuccess: props.onSuccess,
			onReject: props.onReject
		});
	}
}
