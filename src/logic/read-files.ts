import { TAbstractFile, TFile, TFolder } from "obsidian";
import ProjectCardsPlugin from "src/main";

/////////
/////////

export const fetchExcerpt = async (item: TAbstractFile) => {
    const v = item.vault;
    let excerpt: string = '';

    // TODO: Use shortSummary property if present
    // Otherwise do all below (createExcerpt)

    if(item instanceof TFile) {
        excerpt = await v.cachedRead(item);
        excerpt = removeFrontmatter(excerpt);
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
function removeFrontmatter(text: string): string {
    const sectionRegex = /---([^`]+?)---(\s*)/g;
    return text.replace(sectionRegex, "");
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

export const getFrontmatter = (plugin: null | ProjectCardsPlugin, file: TFile): {} | FrontmatterCache => {
    if(!plugin) {
        console.log('getFrontmatter returned no frontmatter because plugin was undefined or null.')
        return {};
    }
    let frontmatter: {} | FrontmatterCache = {};
    
    let metadataCache;
    if(plugin.app.metadataCache) metadataCache = plugin.app.metadataCache;
    
    let fileCache;
    if(metadataCache) fileCache = metadataCache.getFileCache(file);

    if(fileCache) {
        let tempFrontmatter = fileCache.frontmatter;
        if(tempFrontmatter) {
            frontmatter = tempFrontmatter;
        } else {
            frontmatter = {};
        }
    }

    return frontmatter;
}

export const setFrontmatter = (plugin: ProjectCardsPlugin, file: TFile, newFrontmatter: FrontmatterCache) => {
    plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
        frontmatter = newFrontmatter;
    });
}

export const getFileState = (plugin: ProjectCardsPlugin, file: TFile): null | string => {
    const frontmatter = getFrontmatter(plugin,file);
    if(!frontmatter) return null;

    const state = frontmatter['state'];
    return state;
}

export const setFileState = (plugin: ProjectCardsPlugin, file: TFile, state: null | string) => {
    plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
        if(state) {
            frontmatter['state'] = state;
        } else {
            delete frontmatter['state'];
        }
    });
}