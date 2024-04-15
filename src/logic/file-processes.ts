import { TAbstractFile, TFile, TFolder } from "obsidian";
import ProjectBrowserPlugin from "src/main";
import { getProjectExcerpt } from "./folder-processes";

/////////
/////////

export const getExcerpt = async (plugin: ProjectBrowserPlugin, item: TAbstractFile): Promise<null|string> => {
    const v = item.vault;
    let excerpt: null | string = null;

    // TODO: Use shortSummary property if present
    // Otherwise do all below (createExcerpt)

    if(item instanceof TFile)           excerpt = await getFileExcerpt(item);
    else if(item instanceof TFolder)    excerpt = await getProjectExcerpt(plugin, item)

    return excerpt;
}

export const getFileExcerpt = async (file: TFile): Promise<null|string> => {
    const v = file.vault;
    let excerpt: string = '';

    // TODO: Use shortSummary property if present
    // Otherwise do all below (createExcerpt)

    excerpt = await v.cachedRead(file);
    excerpt = removeFrontmatter(excerpt);
    excerpt = removeCodeBlocks(excerpt);
    excerpt = simplifyWhiteSpace(excerpt);

    return excerpt;
}

// REVIEW: Write tests for this
export function removeFrontmatter(text: string): string {
    const sectionRegex = /---([^`]+?)---(\s*)/g;
    return text.replace(sectionRegex, "");
}

// REVIEW: Write tests for this
export function removeCodeBlocks(text: string): string {
    const sectionRegex = /(\s*)```([^`]+?)```(\s*)/g;
    return text.replace(sectionRegex, "");
}

// REVIEW: Write tests for this
// REVIEW: This isn't properly working with new lines across code blocks and maybe more
export function simplifyWhiteSpace(text: string): string {
    const lineBreakRegex = /(\\n|\\n\s+|\s+\\n)+/;
    return text.replace(lineBreakRegex, '. ');
}
