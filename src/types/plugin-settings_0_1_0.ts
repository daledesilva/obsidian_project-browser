import { PluginFolderSettings_0_0_5 } from "./plugin-settings_0_0_5";

////////////////////
////////////////////

// So it's accessible as a const and a type
export const StateViewMode_0_1_0 = {
    DetailedCards: 'Detailed Cards',
    SimpleCards: 'Simple Cards',
    SmallCards: 'Small Cards',
    List: 'List'
};
export type StateViewMode_0_1_0 = typeof StateViewMode_0_1_0[keyof typeof StateViewMode_0_1_0];

export type FolderViewMode_0_1_0 = 'Small';

export interface PluginStateSettings_0_1_0 {
	name: string,
	defaultView: StateViewMode_0_1_0,
	link?: boolean,
}

export interface PluginPrioritySettings_0_1_0 {
	name: string,
	link?: boolean,
}

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
	folders: PluginFolderSettings_0_0_5,
	states: {
		visible: PluginStateSettings_0_1_0[],
		hidden: PluginStateSettings_0_1_0[],
	},
	stateless: PluginStateSettings_0_1_0,
	defaultState?: string,

	// Tracked but not exposed in settings
	priorities: PluginPrioritySettings_0_1_0[],
	defaultPriority: string,
}

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
	defaultState: 'Idea',

	priorities: [
		{
			name: 'High',
			link: true,
		},
		{
			name: 'Medium',
			link: true,
		},
		{
			name: 'Low',
			link: true,
		},
	],
	defaultPriority: 'Medium',
}