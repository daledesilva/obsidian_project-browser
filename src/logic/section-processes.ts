import { TFile, TFolder } from "obsidian";
import ProjectBrowserPlugin from "src/main";
import { FolderSettings, StateSettings_0_0_5 } from "src/types/plugin-settings0_0_5";

/////////
/////////

export interface Section {
    type: "folders" | "state" | "stateless"
    title: string,
    items: Array<TFile | TFolder>
    settings: FolderSettings | StateSettings_0_0_5,
}

export const orderSections = (sections: Section[], plugin: ProjectBrowserPlugin): Section[] => {
    const intendedOrder = plugin.settings.states.visible.map( stateSettings => stateSettings.name );
    intendedOrder.reverse();
    intendedOrder.unshift('folders');
    intendedOrder.push(' ');
    
    // Create a map to store the original index of each section title
    const sectionMap = sections.reduce((accumulator, section, index) => {
        accumulator[section.title] = index;
        return accumulator;
    }, {} as Record<string, number>);
    
    // Sort the sections based on their intended order
    let sortedSections = intendedOrder.map((name) => sections[sectionMap[name]]) || [];

    for(let i=sortedSections.length-1; i>=0; i--) {
        if(sortedSections[i] === undefined){
            sortedSections.splice(i,1);
        }
    }
    
    return sortedSections;
}



export function getStateSettings(plugin: ProjectBrowserPlugin, name: string): StateSettings_0_0_5 {
    const allSettings = [...plugin.settings.states.visible, ...plugin.settings.states.hidden];
    for(let i=0; i<=allSettings.length; i++) {
        if(!allSettings[i]) continue;
        if(allSettings[i].name === name) return allSettings[i];
    }
    return plugin.settings.stateless;
}