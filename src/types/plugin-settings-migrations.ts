import { DEFAULT_PLUGIN_SETTINGS_0_0_5, PluginSettings_0_0_5, StateViewMode_0_0_5 } from "./plugin-settings_0_0_5";
import { PluginSettings_0_0_4 } from "./plugin-settings_0_0_4";
import { DEFAULT_PLUGIN_SETTINGS_0_1_0, DEFAULT_STATE_SETTINGS_0_1_0, PluginSettings_0_1_0 } from "./plugin-settings_0_1_0";
import * as semVer from 'semver';
import { PluginSettings } from "./types-map";
import { DEFAULT_PLUGIN_SETTINGS_0_3_0, DEFAULT_STATE_SETTINGS_0_3_0, PluginSettings_0_3_0 } from "./plugin-settings_0_3_0";
import {
    DEFAULT_FILE_TYPE_SETTINGS_0_4_0,
    DEFAULT_PLUGIN_SETTINGS_0_4_0,
    DEFAULT_PROJECT_PAGE_STATELESS_SETTINGS_0_4_0,
    DEFAULT_PROJECT_PAGE_STATE_SETTINGS_0_4_0,
    FileTypeSettings_0_4_0,
    PluginSettings_0_4_0,
} from "./plugin-settings_0_4_0";
import { findItemByProperty } from "./migration-helpers";

///////////
///////////

export function migrateOutdatedSettings(settings: {settingsVersion: string}): PluginSettings {
    let updatedSettings = settings;
    
    if(!settings.settingsVersion)                         updatedSettings = migrate_0_0_4_to_0_0_5(settings as unknown as PluginSettings_0_0_4);
    if(semVer.lt(updatedSettings.settingsVersion, '0.1.0'))      updatedSettings = migrate_0_0_5_to_0_1_0(updatedSettings as unknown as PluginSettings_0_0_5);
    if(semVer.lt(updatedSettings.settingsVersion, '0.3.0'))      updatedSettings = migrate_0_1_0_to_0_3_0(updatedSettings as unknown as PluginSettings_0_1_0);
    if(semVer.lt(updatedSettings.settingsVersion, '0.4.0'))      updatedSettings = migrate_0_3_0_to_0_4_0(updatedSettings as unknown as PluginSettings_0_3_0);
    if(updatedSettings.settingsVersion === '0.4.0')               updatedSettings = patch_0_4_0_settings(updatedSettings as PluginSettings_0_4_0);
    
    if(JSON.stringify(updatedSettings) != JSON.stringify(settings)) {
        console.debug('Project Browser: Migrated outdated settings');
        console.debug('Old Settings', JSON.parse(JSON.stringify(settings)));
        console.debug('New Settings', JSON.parse(JSON.stringify(updatedSettings)));
    }

    return updatedSettings as PluginSettings;
}

////////////
////////////

export function migrate_0_0_4_to_0_0_5(oldSettings: PluginSettings_0_0_4): PluginSettings_0_0_5 {
    
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
            visible: oldSettings.states.visible.map((oldState, index) => {
                const states = oldSettings.states.visible;
                const defaultStates = DEFAULT_PLUGIN_SETTINGS_0_3_0.states.visible;
                const defaultState = DEFAULT_STATE_SETTINGS_0_3_0
                return {
                    name: oldState.name,
                    link: findItemByProperty(states, 'name', oldState.name)?.link ?? defaultState.link,
                    defaultViewMode: findItemByProperty(states, 'name', oldState.name)?.defaultView ?? defaultState.defaultViewMode,
                    defaultViewOrder: findItemByProperty(defaultStates, 'name', oldState.name)?.defaultViewOrder ?? DEFAULT_STATE_SETTINGS_0_3_0.defaultViewOrder,
                    defaultViewPriorityVisibility: findItemByProperty(defaultStates, 'name', oldState.name)?.defaultViewPriorityVisibility ?? DEFAULT_STATE_SETTINGS_0_3_0.defaultViewPriorityVisibility,
                    defaultViewPriorityGrouping: findItemByProperty(defaultStates, 'name', oldState.name)?.defaultViewPriorityGrouping ?? DEFAULT_STATE_SETTINGS_0_3_0.defaultViewPriorityGrouping,
                }
            }),
            hidden: oldSettings.states.hidden.map((oldState, index) => {
                const states = oldSettings.states.hidden;
                const defaultStates = DEFAULT_PLUGIN_SETTINGS_0_3_0.states.hidden;
                const defaultState = DEFAULT_STATE_SETTINGS_0_3_0;
                return {
                    name: oldState.name,
                    link: findItemByProperty(states, 'name', oldState.name)?.link ?? defaultState.link,
                    defaultViewMode: findItemByProperty(states, 'name', oldState.name)?.defaultView ?? defaultState.defaultViewMode,
                    defaultViewOrder: findItemByProperty(defaultStates, 'name', oldState.name)?.defaultViewOrder ?? defaultState.defaultViewOrder,
                    defaultViewPriorityVisibility: findItemByProperty(defaultStates, 'name', oldState.name)?.defaultViewPriorityVisibility ?? defaultState.defaultViewPriorityVisibility,
                    defaultViewPriorityGrouping: findItemByProperty(defaultStates, 'name', oldState.name)?.defaultViewPriorityGrouping ?? defaultState.defaultViewPriorityGrouping,
                }
            }),
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

///////////

export function migrate_0_3_0_to_0_4_0(oldSettings: PluginSettings_0_3_0): PluginSettings_0_4_0 {
    const newSettings: PluginSettings_0_4_0 = {
        ...DEFAULT_PLUGIN_SETTINGS_0_4_0,
        ...oldSettings,
        settingsVersion: '0.4.0',
        fileTypes: { ...DEFAULT_PLUGIN_SETTINGS_0_4_0.fileTypes },
        projectPageStates: {
            visible: [...DEFAULT_PROJECT_PAGE_STATE_SETTINGS_0_4_0.visible],
            hidden: [...DEFAULT_PROJECT_PAGE_STATE_SETTINGS_0_4_0.hidden],
        },
        projectPageStateless: { ...DEFAULT_PROJECT_PAGE_STATELESS_SETTINGS_0_4_0 },
        defaultProjectPageState: DEFAULT_PLUGIN_SETTINGS_0_4_0.defaultProjectPageState,
        loopProjectPageStatesWhenCycling: DEFAULT_PLUGIN_SETTINGS_0_4_0.loopProjectPageStatesWhenCycling,
        showRenamePopupOnNewPage: true,
    };
    return JSON.parse(JSON.stringify(newSettings));
}

function patch_0_4_0_settings(settings: PluginSettings_0_4_0): PluginSettings_0_4_0 {
    const patched = JSON.parse(JSON.stringify(settings)) as PluginSettings_0_4_0 & {
        fileTypes: FileTypeSettings_0_4_0 | (
            { visible: string[]; hidden: string[] } &
            { unsupported?: string[]; hiddenAndUnsupportedOrder?: string[] }
        );
    };
    if (!patched.projectPageStates) {
        patched.projectPageStates = {
            visible: [...DEFAULT_PROJECT_PAGE_STATE_SETTINGS_0_4_0.visible],
            hidden: [...DEFAULT_PROJECT_PAGE_STATE_SETTINGS_0_4_0.hidden],
        };
    }
    if (!patched.projectPageStateless) {
        patched.projectPageStateless = { ...DEFAULT_PROJECT_PAGE_STATELESS_SETTINGS_0_4_0 };
    }
    if (patched.defaultProjectPageState === undefined) {
        patched.defaultProjectPageState = DEFAULT_PLUGIN_SETTINGS_0_4_0.defaultProjectPageState;
    }
    if (patched.loopProjectPageStatesWhenCycling === undefined) {
        patched.loopProjectPageStatesWhenCycling = DEFAULT_PLUGIN_SETTINGS_0_4_0.loopProjectPageStatesWhenCycling;
    }

    if (!patched.fileTypes) return patched;
    const fileTypes = patched.fileTypes as Record<string, unknown>;
    if (fileTypes.projectBrowser) {
        return patched;
    }

    const oldVisible = (fileTypes.visible as string[]) ?? [];
    let oldHidden = (fileTypes.hidden as string[]) ?? [];
    const oldUnsupported = (fileTypes.unsupported as string[] | undefined) ?? [];
    const order = fileTypes.hiddenAndUnsupportedOrder as string[] | undefined;

    oldHidden =
        Array.isArray(order) && order.length > 0
            ? order
            : [...oldHidden, ...oldUnsupported.filter((e) => !oldHidden.map((x) => x.toLowerCase()).includes(e.toLowerCase()))];

    const hasPbs = oldHidden.some((e) => e.toLowerCase() === 'pbs');
    if (!hasPbs) {
        oldHidden = [...oldHidden, 'pbs'];
    }

    patched.fileTypes = {
        projectBrowser: { visible: [...oldVisible], hidden: [...oldHidden] },
        pageMenu: {
            visible: [...DEFAULT_FILE_TYPE_SETTINGS_0_4_0.pageMenu.visible],
            hidden: [...DEFAULT_FILE_TYPE_SETTINGS_0_4_0.pageMenu.hidden],
        },
    };
    return patched;
}
