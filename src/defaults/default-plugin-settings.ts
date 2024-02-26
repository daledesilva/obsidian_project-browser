import { PluginSettings } from 'src/types/plugin-settings';

export const defaultPluginSettings: PluginSettings = {
	states: {
		visible: [
			'Idea',
			'Drafting',
			'Final',
		],
		hidden: [
			'Archived',
			'Cancelled',
		]
	},
}