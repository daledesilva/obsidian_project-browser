import ProjectBrowserPlugin from "src/main";
import { DEFAULT_SETTINGS_0_0_5, PluginSettings_0_0_5, StateViewMode_0_0_5 } from "./plugin-settings0_0_5";
import { PluginSettings_0_0_4 } from "./plugin-settings0_0_4";
import { DEFAULT_SETTINGS_0_1_0, PluginSettings_0_1_0 } from "./plugin-settings0_1_0";
import * as semVer from 'semver';

///////////
///////////

export function migrateOutdatedSettings(settings: {settingsVersion: string}): PluginSettings_0_1_0 {
    let updatedSettings = settings;
    
    if(!settings.settingsVersion)               updatedSettings = migrate0_0_4to0_0_5(settings as unknown as PluginSettings_0_0_4);
    // TODO:
    if(settings.settingsVersion < '0.0.1')      updatedSettings = migrate0_0_5to0_1_0(settings as unknown as PluginSettings_0_0_5);
    
    if(JSON.stringify(updatedSettings) != JSON.stringify(settings)) {
        console.log('Project Browser: Migrated outdated settings');
        console.log('Old Settings', JSON.parse(JSON.stringify(settings)));
        console.log('New Settings', JSON.parse(JSON.stringify(updatedSettings)));
    }

    return updatedSettings as PluginSettings_0_1_0;
}

////////////
////////////

function migrate0_0_4to0_0_5(oldSettings: PluginSettings_0_0_4): PluginSettings_0_0_5 {
    
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
                defaultView: getStateDefaultView0_0_5(stateStr),
            })),
            hidden: oldSettings.states.hidden.map((stateStr) => ({
                name: stateStr,
                defaultView: getStateDefaultView0_0_5(stateStr),
            })),
        }
        // stateless // Didn't previously exist
    };
    
    return JSON.parse(JSON.stringify(newSettings));
}

function getStateDefaultView0_0_5(name: string): StateViewMode_0_0_5 {
    const combinedStates = [...DEFAULT_SETTINGS_0_0_5.states.visible, ...DEFAULT_SETTINGS_0_0_5.states.hidden];
    const equivalentState = combinedStates.find( (state) => state.name == name );
    let defaultView = StateViewMode_0_0_5.DetailedCards;
    if(equivalentState) defaultView = equivalentState.defaultView;
    return defaultView;
}

///////////

function migrate0_0_5to0_1_0(oldSettings: PluginSettings_0_0_5): PluginSettings_0_1_0 {
    
    const newSettings = {

        // Apply default settings as backup
        ...DEFAULT_SETTINGS_0_1_0,

        // All other settings are the same as 0.0.5
        ...oldSettings,

        // Re overwrite settingsVersion
        settingsVersion: DEFAULT_SETTINGS_0_1_0.settingsVersion,

    };
    
    return JSON.parse(JSON.stringify(newSettings));
}