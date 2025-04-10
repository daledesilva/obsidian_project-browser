import { PluginFolderSettings_0_0_5 } from "./plugin-settings_0_0_5";
import { FolderViewMode_0_1_0, PluginPrioritySettings_0_1_0, StateViewMode_0_1_0 } from "./plugin-settings_0_1_0"

////////////////
////////////////

// So it's accessible as a const and a type
export const StateViewOrder_0_3_0 = {
    AliasOrFilename: 'Alias or Filename',
    CreationDate: 'Creation Date',
    ModifiedDate: 'Modified Date',
};
export type StateViewOrder_0_3_0 = typeof StateViewOrder_0_3_0[keyof typeof StateViewOrder_0_3_0];

export interface PluginStateSettings_0_3_0 {
	name: string,
	link?: boolean,
	defaultViewMode: StateViewMode_0_1_0,
	defaultViewOrder: StateViewOrder_0_3_0,
	defaultViewPriorityVisibility: boolean,
	defaultViewPriorityGrouping: boolean,
}

/////////////

export interface PluginSettings_0_3_0 {
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
		visible: PluginStateSettings_0_3_0[],
		hidden: PluginStateSettings_0_3_0[],
	},
	stateless: PluginStateSettings_0_3_0,
	defaultState?: string,

	// Tracked but not exposed in settings
	priorities: PluginPrioritySettings_0_1_0[],
	defaultPriority: string,
}

/////////////
/////////////

export const DEFAULT_SETTINGS_0_3_0: PluginSettings_0_3_0 = {
	// Helpers
    onboardingNotices: {
		welcomeNoticeRead: false,
		lastVersionNoticeRead: '',
	},
	settingsVersion: '0.3.0',	// Settings version aligns with the version number of the plugin it was updated in
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
				link: true,
				defaultViewMode: 'Small Cards',
				defaultViewOrder: 'AliasOrFilename',
				defaultViewPriorityVisibility: true,
				defaultViewPriorityGrouping: true,
			},
			{
				name: 'Shortlisted',
				link: true,
				defaultViewMode: 'Small Cards',
				defaultViewOrder: 'AliasOrFilename',
				defaultViewPriorityVisibility: true,
				defaultViewPriorityGrouping: true,
			},
			{
				name: 'Drafting',
				link: true,
				defaultViewMode: 'Detailed Cards',
				defaultViewOrder: 'AliasOrFilename',
				defaultViewPriorityVisibility: true,
				defaultViewPriorityGrouping: true,
			},
			{
				name: 'Focus',
				link: true,
				defaultViewMode: 'Simple Cards',
				defaultViewOrder: 'AliasOrFilename',
				defaultViewPriorityVisibility: true,
				defaultViewPriorityGrouping: true,
			},
			{
				name: 'Final',
				link: true,
				defaultViewMode: 'Small Cards',
				defaultViewOrder: 'ModifiedDate',
				defaultViewPriorityVisibility: false,
				defaultViewPriorityGrouping: false,
			},
		],
		hidden: [
			{
				name: 'Archived',
				link: true,
				defaultViewMode: 'Small Cards',
				defaultViewOrder: 'ModifiedDate',
				defaultViewPriorityVisibility: false,
				defaultViewPriorityGrouping: false,
			},
			{
				name: 'Cancelled',
				link: true,
				defaultViewMode: 'Detailed Cards',
				defaultViewOrder: 'ModifiedDate',
				defaultViewPriorityVisibility: false,
				defaultViewPriorityGrouping: false,
			},
		],
	},
	stateless: {
		name: '',
		defaultViewMode: 'List',
		defaultViewOrder: 'ModifiedDate',
		defaultViewPriorityVisibility: true,
		defaultViewPriorityGrouping: true,
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