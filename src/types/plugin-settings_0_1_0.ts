import { FolderSectionSettings_0_0_5, StateViewMode_0_0_5 } from "./plugin-settings_0_0_5";

////////////////////
////////////////////

export interface PluginStateSettings_0_1_0 {
	name: string,
	defaultView: StateViewMode_0_0_5,
	link?: boolean,	// new
}

export const DEFAULT_STATE_SETTINGS_0_1_0: PluginStateSettings_0_1_0 = {
	name: '',
	defaultView: 'Simple Cards',
	link: true,
}

/////////////

export interface PluginSettings_0_1_0 {
	settingsVersion: string,
	// Helpers
    onboardingNotices: { // new
		welcomeNoticeRead: boolean,
		lastVersionNoticeRead: string,
	},
	//
	access: {
		replaceNewTab: boolean,
		enableRibbonIcon: boolean,
		enableCommand: boolean,
		launchFolder: string, // new
	}
	useAliases: boolean, // new
	showStateMenu: boolean,
	loopStatesWhenCycling: boolean, // new
	folders: FolderSectionSettings_0_0_5,
	states: {
		visible: PluginStateSettings_0_1_0[],
		hidden: PluginStateSettings_0_1_0[],
	},
	stateless: PluginStateSettings_0_1_0,
	defaultState?: string, // new
}

/////////////

export const DEFAULT_PLUGIN_SETTINGS_0_1_0: PluginSettings_0_1_0 = {
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
}