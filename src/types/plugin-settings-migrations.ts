import ProjectBrowserPlugin from "src/main";
import { DEFAULT_SETTINGS_0_0_5, PluginSettings_0_0_5, StateViewMode_0_0_5 } from "./plugin-settings0_0_5";
import { PluginSettings_0_0_4 } from "./plugin-settings0_0_4";

///////////
///////////

export function migrateOutdatedSettings(settings: {settingsVersion: string}): PluginSettings_0_0_5 {
    let updatedSettings = settings;
    
    if(!settings.settingsVersion)    updatedSettings = migrate0_0_4to0_0_5(settings as unknown as PluginSettings_0_0_4);
    
    if(JSON.stringify(updatedSettings) != JSON.stringify(settings)) {
        console.log('Project Browser: Migrated outdated settings');
        console.log('Old Settings', JSON.parse(JSON.stringify(settings)));
        console.log('New Settings', JSON.parse(JSON.stringify(updatedSettings)));
    }

    return updatedSettings as PluginSettings_0_0_5;
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