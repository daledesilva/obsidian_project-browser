import { DEFAULT_FOLDER_SETTINGS_0_1_2, FolderSettings_0_1_2 } from "./folder-settings_0_1_2";
import { FolderViewMode_0_0_5, StateViewMode_0_0_5, FolderSectionSettings_0_0_5 } from "./plugin-settings_0_0_5";
import { DEFAULT_PRIORITY_SETTINGS_0_3_0, DEFAULT_PLUGIN_SETTINGS_0_3_0, DEFAULT_STATE_SETTINGS_0_3_0, PrioritySettings_0_3_0, PluginSettings_0_3_0, StateSettings_0_3_0, StateViewOrder_0_3_0 } from "./plugin-settings_0_3_0";

///////////////
///////////////

export interface PluginSettings extends PluginSettings_0_3_0 {}
export const DEFAULT_SETTINGS = DEFAULT_PLUGIN_SETTINGS_0_3_0;

// The settings for the physical folder on disk
export type FolderSettings = FolderSettings_0_1_2;
export const DEFAULT_FOLDER_SETTINGS = DEFAULT_FOLDER_SETTINGS_0_1_2;

// Folder section display settings
export type FolderSectionSettings = FolderSectionSettings_0_0_5;

export interface StateSettings extends StateSettings_0_3_0 {}
export const DEFAULT_STATE_SETTINGS = DEFAULT_STATE_SETTINGS_0_3_0;

export interface PrioritySettings extends PrioritySettings_0_3_0 {}
export const DEFAULT_PRIORITY_SETTINGS = DEFAULT_PRIORITY_SETTINGS_0_3_0;

export const StateViewMode = StateViewMode_0_0_5;
export type StateViewMode = StateViewMode_0_0_5

export const StateViewOrder = StateViewOrder_0_3_0;
export type StateViewOrder = StateViewOrder_0_3_0;

export type FolderViewMode = FolderViewMode_0_0_5;