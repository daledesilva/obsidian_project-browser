import { LOCAL_STORAGE_PREFIX } from "src/constants";
import { WritableAtom, atom, createStore, getDefaultStore } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import ProjectBrowserPlugin from "src/main";
import { debug } from "src/utils/log-to-console";
import { StateSettings, FolderSectionSettings } from "src/types/types-map";

/////////
/////////

interface StaticGlobals {
	plugin: ProjectBrowserPlugin,
}

// TODO: When the plugin reloads this causes an error because the Jotai store is not properly cleaned up and then it is created again.
// It causes state transitions to not work when the plugin is reloaded.
export const globalsAtom = atom<StaticGlobals>()
export function setGlobals(globals: StaticGlobals): void {
	const store = getDefaultStore();
	store.set(globalsAtom, globals);
}
export function getGlobals(): StaticGlobals {
	const store = getDefaultStore();
	const globals = store.get(globalsAtom);
	if(!globals) {
		throw new Error(`Project Browser plugin globals isn't available yet`);
	}
	return globals;
}

//////////
//////////

interface StateMenuSettings {
	visible: boolean,
};
const defaultStateMenuSettings: StateMenuSettings = {
	visible: true,
};
export const stateMenuAtom = atom<StateMenuSettings>(defaultStateMenuSettings)
export function initStateMenuSettings() {
	const {plugin} = getGlobals();
	const store = getDefaultStore();
	const curStateMenuSettings = store.get(stateMenuAtom);
	const newStateMenuSettings = JSON.parse(JSON.stringify(curStateMenuSettings));
	newStateMenuSettings.visible = plugin.settings.showStateMenu;
	store.set(stateMenuAtom, newStateMenuSettings);
}
export function setStateMenuSettings(stateMenuSettings: StateMenuSettings): void {
	const store = getDefaultStore();
	store.set(stateMenuAtom, stateMenuSettings);
}
export function getStateMenuSettings(): StateMenuSettings {
	const store = getDefaultStore();
	return store.get(stateMenuAtom);
}

//////////
//////////

export const deviceMemoryStore = createStore();
export const showHiddenFoldersAtom = atomWithStorage(LOCAL_STORAGE_PREFIX + 'show-hidden-folders', false)

export function hideHiddenFolders() {
    deviceMemoryStore.set(showHiddenFoldersAtom, false);
}
export function unhideHiddenFolders() {
    deviceMemoryStore.set(showHiddenFoldersAtom, true);
}
/***
 * Fetch the current state of the showHiddenFolders Atom.
 * Use 'useAtomValue(showHiddenFoldersAtom) in React instead.
 */
export function getShowHiddenFolders(): boolean {
    return deviceMemoryStore.get(showHiddenFoldersAtom);
}

//////////
//////////

// Settings Atoms - Single source of truth for all settings
// These atoms initialize from plugin settings and then manage all reads/writes

export const stateSettingsAtom = atom(
    // Initial value - will be set during initialization
    { visible: [] as StateSettings[], hidden: [] as StateSettings[] },
    // Setter - write to both atom and plugin settings
    (get, set, newValue: {visible: StateSettings[], hidden: StateSettings[]}) => {
        // Update the atom value
        set(stateSettingsAtom, newValue);
        
        // Also update plugin settings and save
        try {
            const { plugin } = getGlobals();
            plugin.settings.states.visible = newValue.visible;
            plugin.settings.states.hidden = newValue.hidden;
            plugin.saveSettings();
        } catch (error) {
            console.error('Error updating state settings:', error);
        }
    }
);

export const folderSettingsAtom = atom(
    // Initial value - will be set during initialization
    { defaultView: 'Small' } as FolderSectionSettings,
    // Setter - write to both atom and plugin settings
    (get, set, newValue: FolderSectionSettings) => {
        // Update the atom value
        set(folderSettingsAtom, newValue);
        
        // Also update plugin settings and save
        try {
            const { plugin } = getGlobals();
            plugin.settings.folders = newValue;
            plugin.saveSettings();
        } catch (error) {
            console.error('Error updating folder settings:', error);
        }
    }
);

export const statelessSettingsAtom = atom(
    // Initial value - will be set during initialization
    { name: '', defaultViewMode: 'List' } as StateSettings,
    // Setter - write to both atom and plugin settings
    (get, set, newValue: StateSettings) => {
        // Update the atom value
        set(statelessSettingsAtom, newValue);
        
        // Also update plugin settings and save
        try {
            const { plugin } = getGlobals();
            plugin.settings.stateless = newValue;
            plugin.saveSettings();
        } catch (error) {
            console.error('Error updating stateless settings:', error);
        }
    }
);

// Initialize atoms from plugin settings (call this when plugin loads)
export function initializeSettingsAtoms(): void {
    try {
        const { plugin } = getGlobals();
        const store = deviceMemoryStore; // Use deviceMemoryStore instead of getDefaultStore()
        
        // Initialize each atom with current plugin settings
        store.set(stateSettingsAtom, {
            visible: plugin.settings.states.visible,
            hidden: plugin.settings.states.hidden
        });
        
        store.set(folderSettingsAtom, plugin.settings.folders);
        store.set(statelessSettingsAtom, plugin.settings.stateless);
        
    } catch (error) {
        console.error('Error initializing settings atoms:', error);
    }
}

//////////
//////////

// Derived atom for individual state settings
// This allows state sections to subscribe only to their specific state's changes
export const stateSettingsByNameAtom = (stateName: string) => atom(
    (get) => {
        const allStateSettings = get(stateSettingsAtom);
        
        // Check visible states first
        const visibleState = allStateSettings.visible.find(state => state.name === stateName);
        if (visibleState) {
            return visibleState;
        }
        
        // Check hidden states
        const hiddenState = allStateSettings.hidden.find(state => state.name === stateName);
        if (hiddenState) {
            return hiddenState;
        }
        
        // State not found
        return null;
    },
    // Setter - update the specific state's settings
    (get, set, newSettings: Partial<StateSettings>) => {
        const currentStateSettings = get(stateSettingsAtom);
        
        // Find the state in visible array
        const visibleIndex = currentStateSettings.visible.findIndex(state => state.name === stateName);
        if (visibleIndex !== -1) {
            const updatedVisible = [...currentStateSettings.visible];
            updatedVisible[visibleIndex] = { ...updatedVisible[visibleIndex], ...newSettings };
            
            set(stateSettingsAtom, {
                visible: updatedVisible,
                hidden: currentStateSettings.hidden
            });
            return;
        }
        
        // Find the state in hidden array
        const hiddenIndex = currentStateSettings.hidden.findIndex(state => state.name === stateName);
        if (hiddenIndex !== -1) {
            const updatedHidden = [...currentStateSettings.hidden];
            updatedHidden[hiddenIndex] = { ...updatedHidden[hiddenIndex], ...newSettings };
            
            set(stateSettingsAtom, {
                visible: currentStateSettings.visible,
                hidden: updatedHidden
            });
            return;
        }
        
        console.warn(`State '${stateName}' not found in settings`);
    }
);

