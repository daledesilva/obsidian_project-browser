import { FolderSectionSettings_0_0_5, StateViewMode_0_0_5 } from "./plugin-settings_0_0_5";

////////////////
////////////////

// So it's accessible as a const and a type
export const StateViewOrder_0_3_0 = {
    AliasOrFilename: 'Alias or Filename',
    CreationDate: 'Creation Date',
    ModifiedDate: 'Modified Date',
};
export type StateViewOrder_0_3_0 = typeof StateViewOrder_0_3_0[keyof typeof StateViewOrder_0_3_0];

export interface StateSettings_0_3_0 {
	name: string,
	link?: boolean,
	defaultViewMode: StateViewMode_0_0_5,
	defaultViewOrder: StateViewOrder_0_3_0,
	defaultViewPriorityVisibility: boolean,
	defaultViewPriorityGrouping: boolean,
}

export const DEFAULT_STATE_SETTINGS_0_3_0: StateSettings_0_3_0 = {
	name: '',
	link: true,
	defaultViewMode: 'Simple Cards',
	defaultViewOrder: 'AliasOrFilename',
	defaultViewPriorityVisibility: true,
	defaultViewPriorityGrouping: true,
}

export interface PrioritySettings_0_3_0 {
	name: string,
	link?: boolean,
}

export const DEFAULT_PRIORITY_SETTINGS_0_3_0: PrioritySettings_0_3_0 = {
	name: '',
	link: false,
}

/////////////

export interface PluginSettings_0_3_0 {
	settingsVersion: string,
	// Helpers
    onboardingNotices: {
		welcomeNoticeRead: boolean,
		lastVersionNoticeRead: string,
	},
	//
	access: {
		replaceNewTab: boolean,
		enableRibbonIcon: boolean,
		enableCommand: boolean,
		launchFolder: string,
	}
	useAliases: boolean,
	showStateMenu: boolean,
	loopStatesWhenCycling: boolean,
	folders: FolderSectionSettings_0_0_5,
	states: {
		visible: StateSettings_0_3_0[],	// changed
		hidden: StateSettings_0_3_0[],	// changed
	},
	stateless: StateSettings_0_3_0,	// changed
	defaultState?: string,

	// Tracked but not exposed in settings
	priorities: PrioritySettings_0_3_0[],	// new
	defaultPriority?: string,	// new
}

/////////////

export const DEFAULT_PLUGIN_SETTINGS_0_3_0: PluginSettings_0_3_0 = {
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
			...DEFAULT_PRIORITY_SETTINGS_0_3_0,
			name: 'High',
		},
		{
			...DEFAULT_PRIORITY_SETTINGS_0_3_0,
			name: 'Low',
		},
	],
}