

///////////////////
///////////////////

/**
 * Takes a value and string and adds and pluralises the word if needed.
 * By default, it just adds an S on the end, but if a pluralVersion is passed it will use that.
 */
export const singleOrPlural = (count: number, singleVersion: string, pluralVersion?: string) => {
	if(count == 1 || count == -1) {
		return singleVersion;
	} else {
		if(pluralVersion) {
			// custom plural version passed in
			return pluralVersion;
		} else {
			// just add an s
			return `${singleVersion}s`;
		}
	}
}

/**
 * Returns true if the path is the vault root.
 * Obsidian may represent the root as '' or '/' depending on context.
 */
export function isRootPath(path: string): boolean {
    return path === '' || path === '/';
}

/**
 * Removes characters from a string that cannot be used in filenames and returns a new string.
 */
let illegalRe = /[\/\?<>\\:\*\|"]/g;
let controlRe = /[\x00-\x1f\x80-\x9f]/g;
let reservedRe = /^\.+$/;
let windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
let windowsTrailingRe = /[\. ]+$/;
let linkRe = /[\[\]]/g;


export function sanitizeFileFolderName(name: string) {
	return name
		.replace(illegalRe, '')
		.replace(controlRe, '')
		.replace(reservedRe, '')
		.replace(windowsReservedRe, '')
		.replace(windowsTrailingRe, '');
}
export function sanitizeInternalLinkName(name: string) {
	// Sanitise as filename first, because any internal link can become a file
	const validFilename = sanitizeFileFolderName(name);
	// Remove any link brackets so they don't interfere witht he outter link brackets
	const validInternalLink = validFilename.replace(linkRe, '');
	return validInternalLink;
}

/**
 * Removes characters from a folder that cannot be used.
 */
// TODO: UNTESTED
export function folderPathSanitize(str: string): string {
	let pathStr = str;
	let pathArr;
	pathArr = pathStr.split('/');
	for(let j=0; j<pathArr.length; j++){
		pathArr[j] = sanitizeFileFolderName(pathArr[j]);
	}
	pathStr = pathArr.join('/');
	return pathStr;
}

/**
 * Returns the file extension when passed a filename string.
 */
export function getFileExtension(filename: string): string {
	let fileAndExt = filename.split('.')
	if(fileAndExt.length <= 1) return '';

	let ext = fileAndExt.pop();
	if(ext) {
		return ext.toLowerCase();
	} else {
		return '';
	}
}

/**
 * Returns the filename without the extension.
 * Supports being passed the full path and will return a full path
 */
export function removeExtension(path: string): string {
	
	// Split into folders along the path
	let sections = path.split('/');
	if(sections.length === 0) return path;

	// Remove extension from filename section and add back in
	let fileMeta = getNameAndExt(sections.pop() as string);
	sections.push(fileMeta.name);

	return sections.join('/');
}

/**
 * Returns an object with name and ext properties.
 * Doesn't accept a full path.
 */
export function getNameAndExt(filename: string): {name: string, ext: string} {
	const indexOfLastPeriod = filename.lastIndexOf('.');
	
	// If there is no period, then the filename has no extension.
	if (indexOfLastPeriod === -1) {
		return {
			name: filename,
			ext: '',
		}
	}
	
	const name = filename.substring(0, indexOfLastPeriod);
	const ext = filename.substring(indexOfLastPeriod + 1);
	
	return {
		name,
		ext,
	};
}

/**
 * Takes a string and returns in lowercase with the first letter capitalised.
 */
export function toSentenceCase(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}



export function parseFilepath(filepath: string): { folderpath: string; basename: string; ext: string; } {
    const segments = filepath.split('/');

    // Extract filename and extension
    const filename = segments.pop() || '';
    const extIndex = filename.lastIndexOf('.');
    const ext = extIndex >= 0 ? filename.slice(extIndex) : '';
    const basename = extIndex >= 0 ? filename.slice(0, extIndex) : filename;

    // Handle folderpath - check if it's root directory first
    let folderpath = '';
    if (segments.length === 1 && segments[0] === '') {
        // Root directory case
        folderpath = '/';
    } else {
        folderpath = segments.join('/');
    }

    return { folderpath, basename, ext: ext.startsWith('.') ? ext.slice(1) : ext };
}



export const trimFilenameExt = (filename: string): string => {
    const str = filename.split('.')
    // Only remove the last element if there's more than one element (i.e., there's an extension)
    if (str.length > 1) {
        str.pop();
    }
    return str.join('.');
}




// REVIEW: Write tests for this
export function removeFrontmatter(text: string): string {
    const sectionRegex = /---([^`]+?)---(\s*)/g;
    return text.replace(sectionRegex, "");
}

// REVIEW: Write tests for this
export function removeCodeBlocks(text: string): string {
    // Remove code blocks (``` ... ```), including multiline
    // Replace with a single newline to preserve spacing
    let result = text.replace(/(^|\n)```[\s\S]*?```(\n|$)/g, '\n');
    // Clean up multiple newlines but preserve double newlines
    result = result.replace(/\n{3,}/g, '\n\n');
    return result.trim();
}

// REVIEW: Write tests for this
export function removeXmlTags(text: string): string {
    const xmlTagRegex = /<[^>]*>/g;
    return text.replace(xmlTagRegex, "");
}

// REVIEW: Write tests for this
// REVIEW: This isn't properly working with new lines across code blocks and maybe more
export function simplifyWhiteSpace(text: string): string {
    // Replace escaped newlines (\n) and surrounding whitespace with ". "
    let result = text.replace(/(\\n\s*)+/g, '. ');
    // Remove extra spaces before/after periods
    result = result.replace(/\s*\.\s*/g, '. ');
    // Collapse multiple spaces
    result = result.replace(/ {2,}/g, ' ');
    // Ensure only a single ". " for multiple newlines
    result = result.replace(/(\.\s*){2,}/g, '. ');
    // If the result is just a period, return '. '
    if (result.trim() === '.') {
        return '. ';
    }
    // Ensure we have a space after the period if it's at the end
    if (result.endsWith('.')) {
        result = result + ' ';
    }
    return result.trim();
}

// MARKDOWN REMOVAL HELPERS
export function removeHeaders(text: string) {
    return text.replace(/^#{1,6}\s+/gm, '');
}
export function removeBold(text: string) {
    return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/__(.*?)__/g, '$1');
}
export function removeItalic(text: string) {
    return text.replace(/\*(.*?)\*/g, '$1').replace(/_(.*?)_/g, '$1');
}
export function removeStrikethrough(text: string) {
    return text.replace(/~~(.*?)~~/g, '$1');
}
export function removeInlineCode(text: string) {
    return text.replace(/`([^`]+)`/g, '$1');
}
export function removeImages(text: string) {
    return text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
}
export function removeLinks(text: string) {
    return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}
export function removeBlockquotes(text: string) {
    return text.replace(/^>\s+/gm, '');
}
export function removeLists(text: string) {
    return text.replace(/^[\s]*[-*+]\s+/gm, '').replace(/^[\s]*\d+\.\s+/gm, '');
}
export function removeHorizontalRules(text: string) {
    // Remove horizontal rules and clean up extra newlines
    let result = text.replace(/^\s*([-*_])\1{2,}\s*$/gm, '');
    result = result.replace(/\n{3,}/g, '\n\n');
    return result;
}
export function removeInternalLinks(text: string) {
    return text.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, p1, p2) => (p2 ? p2 : p1));
}
export function removeCallouts(text: string) {
    // Only remove lines that start with '> [!' (callout indicator)
    return text.replace(/^>\s*\[![^\]]*\].*$/gm, '');
}
export function removeTags(text: string) {
    return text.replace(/#([^\s#]+)/g, '$1');
}
export function removeHighlighting(text: string) {
    return text.replace(/==([^=]+)==/g, '$1');
}
export function removeComments(text: string) {
    // Remove lines starting with optional whitespace then '%'
    return text.replace(/^\s*%.*$/gm, '');
}
export function removeEscapeCharacters(text: string) {
    // Remove a single backslash before markdown special characters
    return text.replace(/\\([`*_{}\[\]()#+\-!])/g, '$1');
}

export function removeMarkdownCharacters(text: string): string {
    let cleaned = text;
    cleaned = removeHeaders(cleaned);
    cleaned = removeBold(cleaned);
    cleaned = removeItalic(cleaned);
    cleaned = removeStrikethrough(cleaned);
    cleaned = removeInlineCode(cleaned);
    cleaned = removeImages(cleaned);
    cleaned = removeLinks(cleaned);
    cleaned = removeCallouts(cleaned);
    cleaned = removeBlockquotes(cleaned);
    cleaned = removeLists(cleaned);
    cleaned = removeHorizontalRules(cleaned);
    cleaned = removeInternalLinks(cleaned);
    cleaned = removeTags(cleaned);
    cleaned = removeHighlighting(cleaned);
    cleaned = removeComments(cleaned);
    cleaned = removeEscapeCharacters(cleaned);
    // Remove any leftover leading/trailing whitespace from lines
    cleaned = cleaned.replace(/[ \t]+$/gm, '').replace(/^[ \t]+/gm, '');
    // Collapse multiple blank lines (2 or more) into a single blank line
    cleaned = cleaned.replace(/\n{2,}/g, '\n\n');
    return cleaned.trim();
}