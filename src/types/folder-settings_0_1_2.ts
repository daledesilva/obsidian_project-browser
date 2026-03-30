// The PBS file format

export interface FolderSettings_0_1_2 {
	description: string,
    isHidden?: boolean,
    isProject?: boolean,
    state?: string,
    priority?: string,
}

export const DEFAULT_FOLDER_SETTINGS_0_1_2: FolderSettings_0_1_2 = {
	description: `Obsidian Project Browser folder settings`
}
