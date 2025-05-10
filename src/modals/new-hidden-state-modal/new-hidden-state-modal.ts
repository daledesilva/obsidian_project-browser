import { StateSettingsModalBase } from "src/modals/state-settings-modal-base/state-settings-modal-base";
import { StateSettings } from "src/types/types-map";

interface NewHiddenStateModalProps {
	onSuccess: (newStateSettings: StateSettings) => {},
	onReject?: (reason: string) => {},
}

export class NewHiddenStateModal extends StateSettingsModalBase {
	constructor(props: NewHiddenStateModalProps) {
		super({
			title: 'Create new hidden state',
			introText: 'Create a new hidden state to categorize your notes.',
			actionButtonLabel: 'Create hidden state',
			onSuccess: props.onSuccess,
			onReject: props.onReject
		});
	}
} 