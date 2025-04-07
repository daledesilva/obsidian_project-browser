// So it's accessible as a const and a type
export const StateViewMode_0_1_0 = {
    DetailedCards: 'Detailed Cards',
    SimpleCards: 'Simple Cards',
    SmallCards: 'Small Cards',
    List: 'List'
} as const;
export type StateViewMode_0_1_0 = typeof StateViewMode_0_1_0[keyof typeof StateViewMode_0_1_0];

export type FolderViewMode_0_1_0 = 'Small';

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
		defaultView: 'Small',
	},
	states: {
		visible: [
			{
				name: 'Idea',
				defaultView: 'Small Cards',
				link: true,
			},
			{
				name: 'Shortlisted',
				defaultView: 'Small Cards',
				link: true,
			},
			{
				name: 'Drafting',
				defaultView: 'Detailed Cards',
				link: true,
			},
			{
				name: 'Focus',
				defaultView: 'Simple Cards',
				link: true,
			},
			{
				name: 'Final',
				defaultView: 'Small Cards',
				link: true,
			},
		],
		hidden: [
			{
				name: 'Archived',
				defaultView: 'Small Cards',
				link: true,
				},
			{
				name: 'Cancelled',
				defaultView: 'Detailed Cards',
				link: true,
			},
		],
	},
	stateless: {
		name: '',
		defaultView: 'List',
	},
}