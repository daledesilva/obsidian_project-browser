import { Section } from 'src/logic/section-processes';
import { getGlobals } from 'src/logic/stores';
import { StateSettings, FolderSettings } from 'src/types/types-map';

//////////
//////////

/**
 * Updates settings for a section and saves them to the plugin
 * @param section - The section to update settings for
 * @param settingsUpdate - Partial settings object with properties to update
 */
export function setSectionSettings(
    section: Section, 
    settingsUpdate: Partial<StateSettings> | Partial<FolderSettings>
): void {
    const { plugin } = getGlobals();
    
    if (section.type === 'folders') {
        // Update folder settings
        Object.assign(plugin.settings.folders, settingsUpdate);
    } else if (section.type === 'state') {
        // Find and update the state settings in visible or hidden states
        const visibleStateIndex = plugin.settings.states.visible.findIndex(
            state => state.name === section.title
        );
        
        if (visibleStateIndex !== -1) {
            Object.assign(plugin.settings.states.visible[visibleStateIndex], settingsUpdate);
        } else {
            const hiddenStateIndex = plugin.settings.states.hidden.findIndex(
                state => state.name === section.title
            );
            
            if (hiddenStateIndex !== -1) {
                Object.assign(plugin.settings.states.hidden[hiddenStateIndex], settingsUpdate);
            }
        }
    } else if (section.type === 'stateless') {
        // Update stateless settings
        Object.assign(plugin.settings.stateless, settingsUpdate);
    }
    
    // Save the updated settings
    plugin.saveSettings();
} 