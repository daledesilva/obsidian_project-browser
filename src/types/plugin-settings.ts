export interface PluginSettings {
	access: {
		replaceNewTab: boolean,
		enableRibbonIcon: boolean,
		enableCommand: boolean,
	}
	showStateMenu: boolean,
	states: {
        visible: string[],
        hidden: string[],
    }
}

export const DEFAULT_SETTINGS: PluginSettings = {
	access: {
		replaceNewTab: true,
		enableRibbonIcon: true,
		enableCommand: true,
	},
	showStateMenu: true,
	states: {
		visible: [
			'Idea',
			'Shortlisted',
			'Drafting',
			'Focus',
			'Final',
		],
		hidden: [
			'Archived',
			'Cancelled',
		]
	},
}