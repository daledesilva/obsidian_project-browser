import { StateSettingsModalBase } from "src/modals/state-settings-modal-base/state-settings-modal-base";
import { StateSettings } from "src/types/types-map";

interface NewVisibleStateModalProps {
	onSuccess: (newStateSettings: StateSettings) => {},
	onReject?: (reason: string) => {},
}

export class NewVisibleStateModal extends StateSettingsModalBase {
	constructor(props: NewVisibleStateModalProps) {
		super({
			title: 'Create new visible project state',
			introText: 'Create a new visible project state to categorize your projects.',
			actionButtonLabel: 'Create visible project state',
			onSuccess: props.onSuccess,
			onReject: props.onReject,
		});
	}
} 