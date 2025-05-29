
// So it's accessible as a const and a type
export const StateViewMode_0_0_5 = {
    DetailedCards: 'Detailed Cards',
    SimpleCards: 'Simple Cards',
    SmallCards: 'Small Cards',
    List: 'List'
} as const;
export type StateViewMode_0_0_5 = typeof StateViewMode_0_0_5[keyof typeof StateViewMode_0_0_5];

export type FolderViewMode_0_0_5 = 'Small';

export interface StateSettings_0_0_5 {
	name: string,
	defaultView: StateViewMode_0_0_5,
}
export interface FolderSectionSettings_0_0_5 {
	defaultView: FolderViewMode_0_0_5,
}

/////////////
/////////////

export interface PluginSettings_0_0_5 {
	settingsVersion: string,
	access: {
		replaceNewTab: boolean,
		enableRibbonIcon: boolean,
		enableCommand: boolean,
	}
	showStateMenu: boolean,
	folders: FolderSectionSettings_0_0_5,
	states: {
		visible: StateSettings_0_0_5[],
		hidden: StateSettings_0_0_5[],
	},
	stateless: StateSettings_0_0_5,
}

/////////////
/////////////

export const DEFAULT_PLUGIN_SETTINGS_0_0_5: PluginSettings_0_0_5 = {
	settingsVersion: '0.0.5',	// Settings version aligns with the version number of the plugin it was updated in
	access: {
		replaceNewTab: true,
		enableRibbonIcon: true,
		enableCommand: true,
	},
	showStateMenu: true,
	folders: {
		defaultView: 'Small',
	},
	states: {
		visible: [
			{
				name: 'Idea',
				defaultView: 'Small Cards',
			},
			{
				name: 'Shortlisted',
				defaultView: 'Small Cards',
			},
			{
				name: 'Drafting',
				defaultView: 'Detailed Cards',
			},
			{
				name: 'Focus',
				defaultView: 'Simple Cards',
			},
			{
				name: 'Final',
				defaultView: 'Small Cards',
			},
		],
		hidden: [
			{
				name: 'Archived',
				defaultView: 'Small Cards',
			},
			{
				name: 'Cancelled',
				defaultView: 'Detailed Cards',
			},
		],
	},
	stateless: {
		name: '',
		defaultView: 'List',
	},
}