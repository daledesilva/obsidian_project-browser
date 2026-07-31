// The PBS file format

export interface FolderSettings_0_1_2 {
	aboutThisFile: string,
    isHidden?: boolean,
    isProject?: boolean,
    state?: string,
    priority?: string,
    /**
     * Project-card excerpt source: basename of a markdown page in this folder (e.g. `Page 1.md`).
     * When unset, the first markdown page alphabetically is used.
     */
    excerptSource?: string,
    /**
     * Optional markdown excerpt stored on the project itself (for synthesized summaries later).
     * When set, this takes priority over `excerptSource` / alphabetical default for card previews.
     */
    excerpt?: string,
}

export const DEFAULT_FOLDER_SETTINGS_0_1_2: FolderSettings_0_1_2 = {
	aboutThisFile: `Obsidian Project Browser folder settings`
}
