import { DEFAULT_PLUGIN_SETTINGS_0_0_5, PluginSettings_0_0_5, StateViewMode_0_0_5 } from "./plugin-settings_0_0_5";
import { PluginSettings_0_0_4 } from "./plugin-settings_0_0_4";
import { DEFAULT_PLUGIN_SETTINGS_0_1_0, DEFAULT_STATE_SETTINGS_0_1_0, PluginSettings_0_1_0 } from "./plugin-settings_0_1_0";
import * as semVer from 'semver';
import { PluginSettings } from "./types-map";
import { DEFAULT_PLUGIN_SETTINGS_0_3_0, DEFAULT_STATE_SETTINGS_0_3_0, PluginSettings_0_3_0 } from "./plugin-settings_0_3_0";
import { findItemByProperty } from "./migration-helpers";

///////////
///////////

export function migrateOutdatedSettings(settings: {settingsVersion: string}): PluginSettings {
    let updatedSettings = settings;
    
    if(!settings.settingsVersion)                         updatedSettings = migrate_0_0_4_to_0_0_5(settings as unknown as PluginSettings_0_0_4);
    if(semVer.lt(settings.settingsVersion, '0.1.0'))      updatedSettings = migrate_0_0_5_to_0_1_0(settings as unknown as PluginSettings_0_0_5);
    if(semVer.lt(settings.settingsVersion, '0.3.0'))      updatedSettings = migrate_0_1_0_to_0_3_0(settings as unknown as PluginSettings_0_1_0);
    
    if(JSON.stringify(updatedSettings) != JSON.stringify(settings)) {
        console.log('Project Browser: Migrated outdated settings');
        console.log('Old Settings', JSON.parse(JSON.stringify(settings)));
        console.log('New Settings', JSON.parse(JSON.stringify(updatedSettings)));
    }

    return updatedSettings as PluginSettings;
}

////////////
////////////

function migrate_0_0_4_to_0_0_5(oldSettings: PluginSettings_0_0_4): PluginSettings_0_0_5 {
    
    const newSettings: PluginSettings_0_0_5 = {

        // Apply default settings as backup
        ...DEFAULT_PLUGIN_SETTINGS_0_0_5,

        // Then transfer over all existing user settings 1 by 1 with necessary conversions
        access: {
            replaceNewTab: oldSettings.access.replaceNewTab,
            enableRibbonIcon: oldSettings.access.enableRibbonIcon,
            enableCommand: oldSettings.access.enableCommand,
        },
        showStateMenu: oldSettings.showStateMenu,
        // folders // Didn't previously exist
        states: {
            visible: oldSettings.states.visible.map((stateStr) => ({
                name: stateStr,
                defaultView: getStateDefaultView_0_0_5(stateStr),
            })),
            hidden: oldSettings.states.hidden.map((stateStr) => ({
                name: stateStr,
                defaultView: getStateDefaultView_0_0_5(stateStr),
            })),
        }
        // stateless // Didn't previously exist
    };
    
    return JSON.parse(JSON.stringify(newSettings));
}

function getStateDefaultView_0_0_5(name: string): StateViewMode_0_0_5 {
    const combinedStates = [...DEFAULT_PLUGIN_SETTINGS_0_0_5.states.visible, ...DEFAULT_PLUGIN_SETTINGS_0_0_5.states.hidden];
    const equivalentState = combinedStates.find( (state) => state.name == name );
    let defaultView: StateViewMode_0_0_5 = 'Detailed Cards';
    if(equivalentState) defaultView = equivalentState.defaultView;
    return defaultView;
}

///////////

export function migrate_0_0_5_to_0_1_0(oldSettings: PluginSettings_0_0_5): PluginSettings_0_1_0 {
    
    const newSettings: PluginSettings_0_1_0 = {

        // Apply default settings as backup
        ...DEFAULT_PLUGIN_SETTINGS_0_1_0,

        // Most other settings are the same as 0.0.5
        ...oldSettings,

        // Migrate & overwrite exceptions
        /////////////////////////////////

        access: {
            ...oldSettings.access,
            launchFolder: '/',
        },

        useAliases: DEFAULT_PLUGIN_SETTINGS_0_1_0.useAliases,
        loopStatesWhenCycling: DEFAULT_PLUGIN_SETTINGS_0_1_0.loopStatesWhenCycling,

        states: {
            visible: oldSettings.states.visible.map((stateStr, index) => ({
                name: oldSettings.states.visible[index].name,
                defaultView: oldSettings.states.visible[index].defaultView,
                link: DEFAULT_STATE_SETTINGS_0_1_0.link,
            })),
            hidden: oldSettings.states.hidden.map((stateStr, index) => ({
                name: oldSettings.states.hidden[index].name,
                defaultView: oldSettings.states.hidden[index].defaultView,
                link: DEFAULT_STATE_SETTINGS_0_1_0.link,
            })),
        },

        stateless: {
            name: oldSettings.stateless.name,
            defaultView: oldSettings.stateless.defaultView,
        },

        // Re overwrite settingsVersion
        settingsVersion: DEFAULT_PLUGIN_SETTINGS_0_1_0.settingsVersion,

    };
    
    return JSON.parse(JSON.stringify(newSettings));
}

///////////

export function migrate_0_1_0_to_0_3_0(oldSettings: PluginSettings_0_1_0): PluginSettings_0_3_0 {
    
    const newSettings: PluginSettings_0_3_0 = {

        // Apply default settings as backup
        ...DEFAULT_PLUGIN_SETTINGS_0_3_0,

        // Most other settings are the same as 0.0.5
        ...oldSettings,

        // Migrate & overwrite exceptions
        /////////////////////////////////

        states: {
            visible: oldSettings.states.visible.map((stateStr, index) => ({
                name: oldSettings.states.visible[index].name,
                link: findItemByProperty(oldSettings.states.visible, 'name', oldSettings.states.visible[index].name)?.link ?? DEFAULT_STATE_SETTINGS_0_3_0.link,
                defaultViewMode: findItemByProperty(oldSettings.states.visible, 'name', oldSettings.states.visible[index].name)?.defaultView ?? DEFAULT_STATE_SETTINGS_0_3_0.defaultViewMode,
                defaultViewOrder: findItemByProperty(DEFAULT_PLUGIN_SETTINGS_0_3_0.states.visible, 'name', DEFAULT_PLUGIN_SETTINGS_0_3_0.states.visible[index].name)?.defaultViewOrder ?? DEFAULT_STATE_SETTINGS_0_3_0.defaultViewOrder,
                defaultViewPriorityVisibility: findItemByProperty(DEFAULT_PLUGIN_SETTINGS_0_3_0.states.visible, 'name', DEFAULT_PLUGIN_SETTINGS_0_3_0.states.visible[index].name)?.defaultViewPriorityVisibility ?? DEFAULT_PLUGIN_SETTINGS_0_3_0.stateless.defaultViewPriorityVisibility,
                defaultViewPriorityGrouping: findItemByProperty(DEFAULT_PLUGIN_SETTINGS_0_3_0.states.visible, 'name', DEFAULT_PLUGIN_SETTINGS_0_3_0.states.visible[index].name)?.defaultViewPriorityGrouping ?? DEFAULT_PLUGIN_SETTINGS_0_3_0.stateless.defaultViewPriorityGrouping,
            })),
            hidden: oldSettings.states.hidden.map((stateStr, index) => ({
                name: oldSettings.states.hidden[index].name,
                link: findItemByProperty(oldSettings.states.hidden, 'name', oldSettings.states.hidden[index].name)?.link ?? DEFAULT_STATE_SETTINGS_0_3_0.link,
                defaultViewMode: findItemByProperty(oldSettings.states.hidden, 'name', oldSettings.states.hidden[index].name)?.defaultView ?? DEFAULT_STATE_SETTINGS_0_3_0.defaultViewMode,
                defaultViewOrder: findItemByProperty(DEFAULT_PLUGIN_SETTINGS_0_3_0.states.hidden, 'name', DEFAULT_PLUGIN_SETTINGS_0_3_0.states.hidden[index].name)?.defaultViewOrder ?? DEFAULT_STATE_SETTINGS_0_3_0.defaultViewOrder,
                defaultViewPriorityVisibility: findItemByProperty(DEFAULT_PLUGIN_SETTINGS_0_3_0.states.hidden, 'name', DEFAULT_PLUGIN_SETTINGS_0_3_0.states.hidden[index].name)?.defaultViewPriorityVisibility ?? DEFAULT_PLUGIN_SETTINGS_0_3_0.stateless.defaultViewPriorityVisibility,
                defaultViewPriorityGrouping: findItemByProperty(DEFAULT_PLUGIN_SETTINGS_0_3_0.states.hidden, 'name', DEFAULT_PLUGIN_SETTINGS_0_3_0.states.hidden[index].name)?.defaultViewPriorityGrouping ?? DEFAULT_PLUGIN_SETTINGS_0_3_0.stateless.defaultViewPriorityGrouping,
            })),
        },

        stateless: {
            name: oldSettings.stateless.name,
            defaultViewMode: oldSettings.stateless.defaultView,
            defaultViewOrder: DEFAULT_PLUGIN_SETTINGS_0_3_0.stateless.defaultViewOrder,
            defaultViewPriorityVisibility: DEFAULT_PLUGIN_SETTINGS_0_3_0.stateless.defaultViewPriorityVisibility,
            defaultViewPriorityGrouping: DEFAULT_PLUGIN_SETTINGS_0_3_0.stateless.defaultViewPriorityGrouping,
        },

        // Re overwrite settingsVersion
        settingsVersion: DEFAULT_PLUGIN_SETTINGS_0_3_0.settingsVersion,

    };
    
    return JSON.parse(JSON.stringify(newSettings));
}