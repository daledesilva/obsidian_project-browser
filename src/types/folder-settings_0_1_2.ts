// The PBS file format

export interface FolderSettings_0_1_2 {
	_description: string,
    isHidden?: boolean,
    isProject?: boolean,
    stateName?: string,
    priorityName?: string,
}

export const DEFAULT_FOLDER_SETTINGS_0_1_2: FolderSettings_0_1_2 = {
	_description: `Obsidian Project Browser folder settings`
}
