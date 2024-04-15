export interface PluginSettings {
	showStateMenu: boolean,
	states: {
        visible: string[],
        hidden: string[],
    }
}

export const DEFAULT_SETTINGS: PluginSettings = {
	showStateMenu: true,
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