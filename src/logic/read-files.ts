import { TAbstractFile, TFile, TFolder } from "obsidian";

/////////
/////////

export const fetchExcerpt = async (item: TAbstractFile) => {
    const v = item.vault;
    let excerpt: string = '';

    // TODO: Use shortSummary property if present
    // Otherwise do all below (createExcerpt)

    if(item instanceof TFile) {
        excerpt = await v.cachedRead(item);
        excerpt = removeCodeBlocks(excerpt);
        excerpt = simplifyWhiteSpace(excerpt);

    } else if(item instanceof TFolder) {
        for(let i=0; i<item.children.length; i++) {
            const childItem = item.children[i];
            if(i>0) excerpt += ', ';   // TODO: Should be a break
            excerpt += childItem.name;
        };
        
    }

    return excerpt;
}


// REVIEW: Review this chat GPT function
function removeCodeBlocks(text: string): string {
    const sectionRegex = /(\s*)```([^`]+?)```(\s*)/g;
    return text.replace(sectionRegex, "");
}


// REVIEW: This isn't properly working with new lines across code blocks and maybe more
function simplifyWhiteSpace(text: string): string {
    const lineBreakRegex = /(\\n|\\n\s+|\s+\\n)+/;
    return text.replace(lineBreakRegex, '. ');
}