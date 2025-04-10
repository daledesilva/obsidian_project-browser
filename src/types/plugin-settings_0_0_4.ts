

export interface PluginSettings_0_0_4 {
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

export const DEFAULT_PLUGIN_SETTINGS_PRE_0_0_5: PluginSettings_0_0_4 = {
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