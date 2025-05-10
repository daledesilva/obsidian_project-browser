import { StateSettingsModalBase } from "src/modals/state-settings-modal-base/state-settings-modal-base";
import { StateSettings } from "src/types/types-map";

interface NewVisibleStateModalProps {
	onSuccess: (newStateSettings: StateSettings) => {},
	onReject?: (reason: string) => {},
}

export class NewVisibleStateModal extends StateSettingsModalBase {
	constructor(props: NewVisibleStateModalProps) {
		super({
			title: 'Create new visible state',
			introText: 'Create a new visible state to categorize your notes.',
			actionButtonLabel: 'Create visible state',
			onSuccess: props.onSuccess,
			onReject: props.onReject,
		});
	}
} 