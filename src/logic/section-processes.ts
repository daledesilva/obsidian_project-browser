import { TFile, TFolder } from "obsidian";
import { PluginFolderSettings, StateSettings_0_0_5 } from "src/types/plugin-settings_0_0_5";
import { getGlobals } from "./stores";

/////////
/////////

export interface Section {
    type: "folders" | "state" | "stateless"
    title: string,
    items: Array<TFile | TFolder>
    settings: PluginFolderSettings | StateSettings_0_0_5,
}

export const orderSections = (unorderedSections: Section[]): Section[] => {
    const {plugin} = getGlobals();
    const hiddenStatesNames = plugin.settings.states.hidden.map( stateSettings => stateSettings.name );
    const orderReference = plugin.settings.states.visible.map( stateSettings => stateSettings.name );
    orderReference.reverse();
    orderReference.unshift('folders');
    orderReference.push(' ');
    let remainingSections = unorderedSections.map( section => section );  // duplicate the array to prevent side effects;
        
    // Add the sections in their intended order
    let orderedSections: Section[] = [];

    orderReference.forEach((name) => {
        let foundIndex: undefined | number;
        for(let i=0; i<remainingSections.length; i++) {
            if(remainingSections[i].title === name) {
                foundIndex = i;
                break;
            }
        }
        if(foundIndex === undefined) return;

        const nextSection = remainingSections.splice(foundIndex, 1)[0];
        orderedSections.push(nextSection);
    });

    // Filter out any hidden states
    remainingSections = remainingSections.filter( section => {
        return !hiddenStatesNames.some( hiddenStateName => hiddenStateName === section.title )
    })
    
    orderedSections.push(...remainingSections);
    
    return orderedSections;
}



export function getStateSettings(name: string): StateSettings_0_0_5 {
    const {plugin} = getGlobals();
    const allSettings = [...plugin.settings.states.visible, ...plugin.settings.states.hidden];
    for(let i=0; i<=allSettings.length; i++) {
        if(!allSettings[i]) continue;
        if(allSettings[i].name === name) return allSettings[i];
    }
    return plugin.settings.stateless;
}