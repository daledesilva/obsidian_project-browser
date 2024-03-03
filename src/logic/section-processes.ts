import { TFile, TFolder } from "obsidian";

/////////
/////////

export interface Section {
    title: string,
    items: Array<TFile | TFolder>
}

export const orderSections = (sections: Section[]): Section[] => {
    const intendedOrder = ['Folders','Final', 'Drafting', 'Idea', ' ', 'Archived', 'Cancelled']
    
    // Create a map to store the original index of each section title
    const sectionMap = sections.reduce((accumulator, section, index) => {
        accumulator[section.title] = index;
        return accumulator;
    }, {} as Record<string, number>);
    
    // Sort the sections based on their intended order
    let sortedSections = intendedOrder.map((title) => sections[sectionMap[title]]) || [];

    for(let i=sortedSections.length-1; i>=0; i--) {
        if(sortedSections[i] === undefined){
            sortedSections.splice(i,1);
        }
    }
    
    return sortedSections;
}



