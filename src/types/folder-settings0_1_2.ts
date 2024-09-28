

interface FolderSettings_0_1_2 {
	_description: string,
    isHidden?: boolean,
    isProject?: boolean,
}

export const DEFAULT_FOLDER_SETTINGS_0_1_2: FolderSettings_0_1_2 = {
	_description: `Obsidian Project Browser folder settings`
}

export type FolderSettings = FolderSettings_0_1_2;  // TODO: This should probably exist in a separate file