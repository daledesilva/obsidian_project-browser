import { DEFAULT_FOLDER_SETTINGS_0_1_2, FolderSettings_0_1_2 } from "./folder-settings_0_1_2";
import { 
    DEFAULT_SETTINGS_0_1_0, 
    FolderViewMode_0_1_0, 
    StateViewMode_0_1_0,
    PluginSettings_0_1_0,
    PluginStateSettings_0_1_0
} from "./plugin-settings_0_1_0";

///////////////
///////////////

export interface PluginSettings extends PluginSettings_0_1_0 {}
export const DEFAULT_SETTINGS = DEFAULT_SETTINGS_0_1_0;

export type FolderSettings = FolderSettings_0_1_2;
export const DEFAULT_FOLDER_SETTINGS = DEFAULT_FOLDER_SETTINGS_0_1_2;

export interface PluginStateSettings extends PluginStateSettings_0_1_0 {}

export const StateViewMode = StateViewMode_0_1_0;
export type StateViewMode = StateViewMode_0_1_0

export type FolderViewMode = FolderViewMode_0_1_0