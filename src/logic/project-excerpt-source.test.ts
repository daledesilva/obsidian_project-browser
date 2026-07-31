import { beforeEach, describe, expect, test, jest } from '@jest/globals';
import { TFile, TFolder } from 'obsidian';

jest.mock('./project-page-list', () => ({
	getSortedPageMenuFilesInProjectFolder: jest.fn(),
}));

jest.mock('src/utils/file-manipulation', () => ({
	getFolderSettings: jest.fn(),
}));

jest.mock('./stores', () => ({
	getGlobals: jest.fn(),
}));

const { getSortedPageMenuFilesInProjectFolder } = jest.requireMock('./project-page-list') as {
	getSortedPageMenuFilesInProjectFolder: jest.Mock;
};
const { getFolderSettings } = jest.requireMock('src/utils/file-manipulation') as {
	getFolderSettings: jest.Mock;
};
const { getGlobals } = jest.requireMock('./stores') as {
	getGlobals: jest.Mock;
};

function createFile(path: string, basename?: string): TFile {
	const name = path.split('/').pop() ?? path;
	const file = new TFile(name, 0, 0) as TFile & {
		path: string;
		name: string;
		basename: string;
		extension: string;
	};
	file.path = path;
	file.name = name;
	file.basename = basename ?? name.replace(/\.[^.]+$/, '');
	file.extension = name.includes('.') ? name.split('.').pop() ?? '' : '';
	return file;
}

describe('project-excerpt-source', () => {
	const folder = new TFolder('Project') as TFolder & { path: string };
	folder.path = 'Project';

	beforeEach(() => {
		jest.clearAllMocks();
		getGlobals.mockReturnValue({ plugin: { app: { vault: {} } } });
		getFolderSettings.mockResolvedValue({ excerpt: '', excerptSource: null, isProject: true });
	});

	test('getSortedMarkdownPagesInProjectFolder excludes draft versions', async () => {
		const livePage = createFile('Project/Page 1.md', 'Page 1');
		const draftPage = createFile(
			'Project/Page 1 - 2024.2.6 - 9.45am [DRAFT].md',
			'Page 1 - 2024.2.6 - 9.45am [DRAFT]',
		);
		const canvasPage = createFile('Project/Sketch.canvas', 'Sketch');
		canvasPage.extension = 'canvas';

		getSortedPageMenuFilesInProjectFolder.mockReturnValue([livePage, draftPage, canvasPage]);

		const { getSortedMarkdownPagesInProjectFolder } = await import('./project-excerpt-source');
		expect(getSortedMarkdownPagesInProjectFolder(folder)).toEqual([livePage]);
	});

	test('resolveProjectExcerptSourceFile ignores draft pages when falling back to alphabetical default', async () => {
		const livePage = createFile('Project/Page 1.md', 'Page 1');
		const draftPage = createFile(
			'Project/Page 1 - 2024.2.6 - 9.45am [DRAFT].md',
			'Page 1 - 2024.2.6 - 9.45am [DRAFT]',
		);

		getSortedPageMenuFilesInProjectFolder.mockReturnValue([draftPage, livePage]);

		const { resolveProjectExcerptSourceFile } = await import('./project-excerpt-source');
		await expect(resolveProjectExcerptSourceFile(folder)).resolves.toBe(livePage);
	});
});
