import { StateSettingsModalBase } from "src/modals/state-settings-modal-base/state-settings-modal-base";
import { StateSettings } from "src/types/types-map";

interface NewVisibleProjectPageStateModalProps {
	onSuccess: (newStateSettings: StateSettings) => {},
	onReject?: (reason: string) => {},
}

export class NewVisibleProjectPageStateModal extends StateSettingsModalBase {
	constructor(props: NewVisibleProjectPageStateModalProps) {
		super({
			title: 'Create new visible page state',
			introText: 'Create a new visible page state to categorize project pages.',
			actionButtonLabel: 'Create visible page state',
			onSuccess: props.onSuccess,
			onReject: props.onReject,
		});
	}
}
