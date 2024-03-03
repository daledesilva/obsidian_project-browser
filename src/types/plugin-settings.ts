export interface PluginSettings {
	states: {
        visible: string[],
        hidden: string[],
    }
}

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