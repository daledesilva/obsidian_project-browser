export enum StateViewMode {
	DetailedCards = 'Detailed Cards',
	SimpleCards = 'Simple Cards',
	SmallCards = 'Small Cards',
	List = 'List',
}

export enum FolderViewMode {
	Small = 'Small',
}

export interface StateSettings {
	name: string,
	defaultView: StateViewMode,
}
export interface FolderSettings {
	defaultView: FolderViewMode,
}

export interface PluginSettings {
	access: {
		replaceNewTab: boolean,
		enableRibbonIcon: boolean,
		enableCommand: boolean,
	}
	showStateMenu: boolean,
	folders: FolderSettings,
	states: {
		visible: StateSettings[],
		hidden: StateSettings[],
	},
	stateless: StateSettings,
}

export const DEFAULT_SETTINGS: PluginSettings = {
	access: {
		replaceNewTab: true,
		enableRibbonIcon: true,
		enableCommand: true,
	},
	showStateMenu: true,
	folders: {
		defaultView: FolderViewMode.Small,
	},
	states: {
		visible: [
			{
				name: 'Idea',
				defaultView: StateViewMode.SmallCards,
			},
			{
				name: 'Shortlisted',
				defaultView: StateViewMode.SmallCards,
			},
			{
				name: 'Drafting',
				defaultView: StateViewMode.SimpleCards,
			},
			{
				name: 'Focus',
				defaultView: StateViewMode.DetailedCards,
			},
			{
				name: 'Final',
				defaultView: StateViewMode.SmallCards,
			},
		],
		hidden: [
			{
				name: 'Archived',
				defaultView: StateViewMode.List,
			},
			{
				name: 'Cancelled',
				defaultView: StateViewMode.List,
			},
		],
	},
	stateless: {
		name: '',
		defaultView: StateViewMode.List,
	},
}