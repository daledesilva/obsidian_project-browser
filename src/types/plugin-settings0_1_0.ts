export enum StateViewMode_0_1_0 {
	DetailedCards = 'Detailed Cards',
	SimpleCards = 'Simple Cards',
	SmallCards = 'Small Cards',
	List = 'List',
}

export enum FolderViewMode_0_1_0 {
	Small = 'Small',
}

export interface PluginStateSettings_0_1_0 {
	name: string,
	defaultView: StateViewMode_0_1_0,
	link?: boolean,
}

export interface PluginFolderSettings {
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
		launchFolder: string,
	}
	useAliases: boolean,
	showStateMenu: boolean,
	loopStatesWhenCycling: boolean,
	folders: PluginFolderSettings,
	states: {
		visible: PluginStateSettings_0_1_0[],
		hidden: PluginStateSettings_0_1_0[],
	},
	stateless: PluginStateSettings_0_1_0,
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
		launchFolder: '/',
	},
	useAliases: true,
	showStateMenu: true,
	loopStatesWhenCycling: true,
	folders: {
		defaultView: FolderViewMode_0_1_0.Small,
	},
	states: {
		visible: [
			{
				name: 'Idea',
				defaultView: StateViewMode_0_1_0.SmallCards,
				link: true,
			},
			{
				name: 'Shortlisted',
				defaultView: StateViewMode_0_1_0.SmallCards,
				link: true,
			},
			{
				name: 'Drafting',
				defaultView: StateViewMode_0_1_0.DetailedCards,
				link: true,
			},
			{
				name: 'Focus',
				defaultView: StateViewMode_0_1_0.SimpleCards,
				link: true,
			},
			{
				name: 'Final',
				defaultView: StateViewMode_0_1_0.SmallCards,
				link: true,
			},
		],
		hidden: [
			{
				name: 'Archived',
				defaultView: StateViewMode_0_1_0.SmallCards,
				link: true,
				},
			{
				name: 'Cancelled',
				defaultView: StateViewMode_0_1_0.DetailedCards,
				link: true,
			},
		],
	},
	stateless: {
		name: '',
		defaultView: StateViewMode_0_1_0.List,
	},
}