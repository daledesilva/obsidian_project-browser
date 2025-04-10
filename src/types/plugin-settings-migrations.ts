import { DEFAULT_SETTINGS_0_0_5, PluginSettings_0_0_5, StateViewMode_0_0_5 } from "./plugin-settings_0_0_5";
import { PluginSettings_0_0_4 } from "./plugin-settings_0_0_4";
import { DEFAULT_SETTINGS_0_1_0, PluginSettings_0_1_0 } from "./plugin-settings_0_1_0";
import * as semVer from 'semver';
import { PluginSettings } from "./types-map";
import { DEFAULT_SETTINGS_0_3_0, PluginSettings_0_3_0 } from "./plugin-settings_0_3_0";

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
        ...DEFAULT_SETTINGS_0_0_5,

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
    const combinedStates = [...DEFAULT_SETTINGS_0_0_5.states.visible, ...DEFAULT_SETTINGS_0_0_5.states.hidden];
    const equivalentState = combinedStates.find( (state) => state.name == name );
    let defaultView: StateViewMode_0_0_5 = 'Detailed Cards';
    if(equivalentState) defaultView = equivalentState.defaultView;
    return defaultView;
}

///////////

export function migrate_0_0_5_to_0_1_0(oldSettings: PluginSettings_0_0_5): PluginSettings_0_1_0 {
    
    const newSettings: PluginSettings_0_1_0 = {

        // Apply default settings as backup
        ...DEFAULT_SETTINGS_0_1_0,

        // Most other settings are the same as 0.0.5
        ...oldSettings,

        // Transfer exceptions
        access: {
            ...oldSettings.access,
            launchFolder: '/',
        },

        // Re overwrite settingsVersion
        settingsVersion: DEFAULT_SETTINGS_0_1_0.settingsVersion,

    };
    
    return JSON.parse(JSON.stringify(newSettings));
}

///////////

export function migrate_0_1_0_to_0_3_0(oldSettings: PluginSettings_0_1_0): PluginSettings_0_3_0 {
    
    const newSettings: PluginSettings_0_3_0 = {

        // Apply default settings as backup
        ...DEFAULT_SETTINGS_0_3_0,

        // Most other settings are the same as 0.0.5
        ...oldSettings,

        // Migrate & overwrite exceptions
        /////////////////////////////////

        states: {
            visible: oldSettings.states.visible.map((stateStr, index) => ({
                ...oldSettings.states.visible[index],
                
                // Replace old name for new
                defaultView: undefined,
                defaultViewMode: oldSettings.states.visible[index].defaultView,

                // Add new properties
                defaultViewOrder: 'AliasOrFilename',
                defaultViewPriorityVisibility: true,
                defaultViewPriorityGrouping: true,
            })),
            hidden: oldSettings.states.hidden.map((stateStr, index) => ({
                ...oldSettings.states.visible[index],
                
                // Replace old name for new
                defaultView: undefined,
                defaultViewMode: oldSettings.states.visible[index].defaultView,

                // Add new properties
                defaultViewOrder: 'AliasOrFilename',
                defaultViewPriorityVisibility: true,
                defaultViewPriorityGrouping: true,
            })),
        },

        stateless: {
            name: oldSettings.stateless.name,
            link: oldSettings.stateless.link,
            defaultViewMode: oldSettings.stateless.defaultView,
            defaultViewOrder: 'ModifiedDate',
            defaultViewPriorityVisibility: true,
            defaultViewPriorityGrouping: true,
        },

        // Re overwrite settingsVersion
        settingsVersion: DEFAULT_SETTINGS_0_3_0.settingsVersion,

    };
    
    return JSON.parse(JSON.stringify(newSettings));
}