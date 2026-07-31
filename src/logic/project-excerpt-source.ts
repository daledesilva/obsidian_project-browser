import { TFile, TFolder } from 'obsidian';
import { getSortedPageMenuFilesInProjectFolder } from './project-page-list';
import { getFolderSettings } from 'src/utils/file-manipulation';
import { basenameHasDraftSuffix } from './filename-suffixes';
import { getGlobals } from './stores';

//////////////////
//////////////////

export function isMarkdownFile(file: TFile): boolean {
	return (file.extension ?? '').toLowerCase() === 'md';
}

/** Markdown pages in a project, sorted the same way as the page menu (live pages only). */
export function getSortedMarkdownPagesInProjectFolder(folder: TFolder): TFile[] {
	return getSortedPageMenuFilesInProjectFolder(folder)
		.filter(isMarkdownFile)
		.filter((file) => !basenameHasDraftSuffix(file.basename));
}

/**
 * Returns the markdown page that currently supplies the project card excerpt, or null when
 * the PBS `excerpt` field is used / no markdown pages exist.
 */
export async function resolveProjectExcerptSourceFile(folder: TFolder): Promise<TFile | null> {
	const { plugin } = getGlobals();
	const folderSettings = await getFolderSettings(plugin.app.vault, folder);

	// Synthesized / manual PBS excerpt means no page is the active source for the indicator.
	if (folderSettings.excerpt && folderSettings.excerpt.trim()) {
		return null;
	}

	const markdownPages = getSortedMarkdownPagesInProjectFolder(folder);
	if (markdownPages.length === 0) return null;

	if (folderSettings.excerptSource) {
		const sourceName = folderSettings.excerptSource;
		const sourceFile = markdownPages.find(
			(file) => file.name === sourceName || file.basename === sourceName,
		);
		if (sourceFile) return sourceFile;
	}

	return markdownPages[0];
}

export async function isFileProjectExcerptSource(file: TFile, projectFolder: TFolder): Promise<boolean> {
	if (!isMarkdownFile(file)) return false;
	const sourceFile = await resolveProjectExcerptSourceFile(projectFolder);
	return !!sourceFile && sourceFile.path === file.path;
}
