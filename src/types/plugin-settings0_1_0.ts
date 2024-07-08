export enum StateViewMode_0_1_0 {
	DetailedCards = 'Detailed Cards',
	SimpleCards = 'Simple Cards',
	SmallCards = 'Small Cards',
	List = 'List',
}

export enum FolderViewMode_0_1_0 {
	Small = 'Small',
}

export interface StateSettings_0_1_0 {
	name: string,
	defaultView: StateViewMode_0_1_0,
}
export interface FolderSettings {
	defaultView: FolderViewMode_0_1_0,
}

/////////////
/////////////

export interface PluginSettings_0_1_0 {
	// Helpers
    onboardingNotices: {
		welcomeNoticeRead: boolean,
		lastVersionNoticeRead: string,
	},
	////
	settingsVersion: string,
	access: {
		replaceNewTab: boolean,
		enableRibbonIcon: boolean,
		enableCommand: boolean,
	}
	showStateMenu: boolean,
	folders: FolderSettings,
	states: {
		visible: StateSettings_0_1_0[],
		hidden: StateSettings_0_1_0[],
	},
	stateless: StateSettings_0_1_0,
}

/////////////
/////////////

export const DEFAULT_SETTINGS_0_1_0: PluginSettings_0_1_0 = {
	// Helpers
    onboardingNotices: {
		welcomeNoticeRead: false,
		lastVersionNoticeRead: '',
	},
	settingsVersion: '0.1.0',	// Settings version aligns with the version number of the plugin it was updated in
	access: {
		replaceNewTab: true,
		enableRibbonIcon: true,
		enableCommand: true,
	},
	showStateMenu: true,
	folders: {
		defaultView: FolderViewMode_0_1_0.Small,
	},
	states: {
		visible: [
			{
				name: 'Idea',
				defaultView: StateViewMode_0_1_0.SmallCards,
			},
			{
				name: 'Shortlisted',
				defaultView: StateViewMode_0_1_0.SmallCards,
			},
			{
				name: 'Drafting',
				defaultView: StateViewMode_0_1_0.DetailedCards,
			},
			{
				name: 'Focus',
				defaultView: StateViewMode_0_1_0.SimpleCards,
			},
			{
				name: 'Final',
				defaultView: StateViewMode_0_1_0.SmallCards,
			},
		],
		hidden: [
			{
				name: 'Archived',
				defaultView: StateViewMode_0_1_0.SmallCards,
			},
			{
				name: 'Cancelled',
				defaultView: StateViewMode_0_1_0.DetailedCards,
			},
		],
	},
	stateless: {
		name: '',
		defaultView: StateViewMode_0_1_0.List,
	},
}