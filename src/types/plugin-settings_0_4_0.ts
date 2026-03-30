import {
    DEFAULT_PLUGIN_SETTINGS_0_3_0,
    PluginSettings_0_3_0,
    StateSettings_0_3_0,
} from "./plugin-settings_0_3_0";

///////////
///////////

export type FileTypeSurface = 'projectBrowser' | 'pageMenu';

export interface StateCollectionSettings_0_4_0 {
    visible: StateSettings_0_3_0[];
    hidden: StateSettings_0_3_0[];
}

/** Per-surface file type visibility. Project Browser and Page Menu each have their own visible/hidden lists. */
export interface FileTypeSettings_0_4_0 {
    projectBrowser: { visible: string[]; hidden: string[] };
    pageMenu: { visible: string[]; hidden: string[] };
}

/** Project Browser defaults: full list of Obsidian-supported types visible. */
const DEFAULT_PROJECT_BROWSER_FILE_TYPES = {
    visible: [
        'md',
        'canvas',
        'base',
        'pdf',
        'avif',
        'bmp',
        'gif',
        'jpeg',
        'jpg',
        'png',
        'svg',
        'webp',
        'flac',
        'm4a',
        'mp3',
        'ogg',
        'oga',
        'opus',
        'wav',
        'webm',
        '3gp',
        'mkv',
        'mov',
        'mp4',
        'ogv',
    ],
    hidden: ['pbs'],
};

/** Page Menu defaults: only Note, Canvas, Base visible; everything else hidden. */
const DEFAULT_PAGE_MENU_FILE_TYPES = {
    visible: ['md', 'canvas', 'base'],
    hidden: [
        'pbs',
        'pdf',
        'avif',
        'bmp',
        'gif',
        'jpeg',
        'jpg',
        'png',
        'svg',
        'webp',
        'flac',
        'm4a',
        'mp3',
        'ogg',
        'oga',
        'opus',
        'wav',
        'webm',
        '3gp',
        'mkv',
        'mov',
        'mp4',
        'ogv',
    ],
};

export const DEFAULT_FILE_TYPE_SETTINGS_0_4_0: FileTypeSettings_0_4_0 = {
    projectBrowser: { ...DEFAULT_PROJECT_BROWSER_FILE_TYPES },
    pageMenu: { ...DEFAULT_PAGE_MENU_FILE_TYPES },
};

///////////

export const DEFAULT_PROJECT_PAGE_STATE_SETTINGS_0_4_0: StateCollectionSettings_0_4_0 = {
    visible: [
        {
            name: 'First Draft',
            link: true,
            defaultViewMode: 'Small Cards',
            defaultViewOrder: 'AliasOrFilename',
            defaultViewPriorityVisibility: true,
            defaultViewPriorityGrouping: false,
        },
        {
            name: 'Work in Progress',
            link: true,
            defaultViewMode: 'Detailed Cards',
            defaultViewOrder: 'AliasOrFilename',
            defaultViewPriorityVisibility: true,
            defaultViewPriorityGrouping: false,
        },
        {
            name: 'Proofingreading',
            link: true,
            defaultViewMode: 'List',
            defaultViewOrder: 'ModifiedDate',
            defaultViewPriorityVisibility: false,
            defaultViewPriorityGrouping: false,
        },
        {
            name: 'Ready',
            link: true,
            defaultViewMode: 'List',
            defaultViewOrder: 'ModifiedDate',
            defaultViewPriorityVisibility: false,
            defaultViewPriorityGrouping: false,
        },
    ],
    hidden: [
        {
            name: 'Abandoned',
            link: true,
            defaultViewMode: 'List',
            defaultViewOrder: 'ModifiedDate',
            defaultViewPriorityVisibility: false,
            defaultViewPriorityGrouping: false,
        },
    ],
};

export const DEFAULT_PROJECT_PAGE_STATELESS_SETTINGS_0_4_0: StateSettings_0_3_0 = {
    name: '',
    link: true,
    defaultViewMode: 'List',
    defaultViewOrder: 'ModifiedDate',
    defaultViewPriorityVisibility: true,
    defaultViewPriorityGrouping: false,
};

///////////

export interface PluginSettings_0_4_0 extends PluginSettings_0_3_0 {
    settingsVersion: '0.4.0';
    fileTypes: FileTypeSettings_0_4_0;
    projectPageStates: StateCollectionSettings_0_4_0;
    projectPageStateless: StateSettings_0_3_0;
    defaultProjectPageState?: string;
    loopProjectPageStatesWhenCycling: boolean;
    /** When true, show the rename popup when a new page is created so the user can immediately rename it. Default: true. */
    showRenamePopupOnNewPage?: boolean;
}

export const DEFAULT_PLUGIN_SETTINGS_0_4_0: PluginSettings_0_4_0 = {
    ...DEFAULT_PLUGIN_SETTINGS_0_3_0,
    settingsVersion: '0.4.0',
    fileTypes: { ...DEFAULT_FILE_TYPE_SETTINGS_0_4_0 },
    projectPageStates: {
        visible: [...DEFAULT_PROJECT_PAGE_STATE_SETTINGS_0_4_0.visible],
        hidden: [...DEFAULT_PROJECT_PAGE_STATE_SETTINGS_0_4_0.hidden],
    },
    projectPageStateless: { ...DEFAULT_PROJECT_PAGE_STATELESS_SETTINGS_0_4_0 },
    defaultProjectPageState: undefined,
    loopProjectPageStatesWhenCycling: true,
    showRenamePopupOnNewPage: true,
};
