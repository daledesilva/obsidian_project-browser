

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
 * Removes characters from a string that cannot be used in filenames and returns a new string.
 */
let illegalRe = /[\/\?<>\\:\*\|"]/g;
let controlRe = /[\x00-\x1f\x80-\x9f]/g;
let reservedRe = /^\.+$/;
let windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
let windowsTrailingRe = /[\. ]+$/;

export function sanitizeFileName(name: string) {
	return name
		.replace(illegalRe, '')
		.replace(controlRe, '')
		.replace(reservedRe, '')
		.replace(windowsReservedRe, '')
		.replace(windowsTrailingRe, '');
}

/**
 * Removes characters from a folder that cannot be used.
 */
// TODO: UNTESTED
export function folderPathSanitize(str: string) {
	let pathStr = str;
	let pathArr;
	pathArr = pathStr.split('/');
	for(let j=0; j<pathArr.length; j++){
		pathArr[j] = sanitizeFileName(pathArr[j]);
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

    // Handle root directory (/)
    let folderpath = segments[0] === '' ? '/' : '';

    // Extract filename and extension
    const filename = segments.pop() || '';
    const extIndex = filename.lastIndexOf('.');
    const ext = extIndex >= 0 ? filename.slice(extIndex) : '';
    const basename = extIndex >= 0 ? filename.slice(0, extIndex) : filename;

    folderpath = segments.join('/');

    return { folderpath, basename, ext: ext.startsWith('.') ? ext.slice(1) : ext };
}
