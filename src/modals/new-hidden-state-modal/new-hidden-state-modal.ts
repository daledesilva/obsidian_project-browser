import { StateSettingsModalBase } from "src/modals/state-settings-modal-base/state-settings-modal-base";
import { StateSettings } from "src/types/types-map";

interface NewHiddenStateModalProps {
	onSuccess: (newStateSettings: StateSettings) => {},
	onReject?: (reason: string) => {},
}

export class NewHiddenStateModal extends StateSettingsModalBase {
	constructor(props: NewHiddenStateModalProps) {
		super({
			title: 'Create new hidden project state',
			introText: 'Create a new hidden project state to categorize your projects.',
			actionButtonLabel: 'Create hidden project state',
			onSuccess: props.onSuccess,
			onReject: props.onReject
		});
	}
} 