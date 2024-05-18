export enum StateViewMode_0_0_5 {
	DetailedCards = 'Detailed Cards',
	SimpleCards = 'Simple Cards',
	SmallCards = 'Small Cards',
	List = 'List',
}

export enum FolderViewMode_0_0_5 {
	Small = 'Small',
}

export interface StateSettings_0_0_5 {
	name: string,
	defaultView: StateViewMode_0_0_5,
}
export interface FolderSettings {
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
	folders: FolderSettings,
	states: {
		visible: StateSettings_0_0_5[],
		hidden: StateSettings_0_0_5[],
	},
	stateless: StateSettings_0_0_5,
}

/////////////
/////////////

export const DEFAULT_SETTINGS_0_0_5: PluginSettings_0_0_5 = {
	settingsVersion: '0.0.5',	// Settings version aligns with the version number of the plugin it was updated in
	access: {
		replaceNewTab: true,
		enableRibbonIcon: true,
		enableCommand: true,
	},
	showStateMenu: true,
	folders: {
		defaultView: FolderViewMode_0_0_5.Small,
	},
	states: {
		visible: [
			{
				name: 'Idea',
				defaultView: StateViewMode_0_0_5.SmallCards,
			},
			{
				name: 'Shortlisted',
				defaultView: StateViewMode_0_0_5.SmallCards,
			},
			{
				name: 'Drafting',
				defaultView: StateViewMode_0_0_5.DetailedCards,
			},
			{
				name: 'Focus',
				defaultView: StateViewMode_0_0_5.SimpleCards,
			},
			{
				name: 'Final',
				defaultView: StateViewMode_0_0_5.SmallCards,
			},
		],
		hidden: [
			{
				name: 'Archived',
				defaultView: StateViewMode_0_0_5.SmallCards,
			},
			{
				name: 'Cancelled',
				defaultView: StateViewMode_0_0_5.DetailedCards,
			},
		],
	},
	stateless: {
		name: '',
		defaultView: StateViewMode_0_0_5.List,
	},
}