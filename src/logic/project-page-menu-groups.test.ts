import { describe, expect, test, jest } from '@jest/globals';
import { TFile, TFolder } from 'obsidian';
import { getGroupedPageMenuFilesInProjectFolder } from './project-page-menu-groups';

jest.mock('./project-page-list', () => ({
	getSortedPageMenuFilesInProjectFolder: jest.fn(),
}));

const { getSortedPageMenuFilesInProjectFolder } = jest.requireMock('./project-page-list') as {
	getSortedPageMenuFilesInProjectFolder: jest.Mock;
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

describe('getGroupedPageMenuFilesInProjectFolder', () => {
	test('nests drafts under their live page stem', () => {
		const folder = new TFolder('Project') as TFolder & { path: string };
		folder.path = 'Project';
		const livePage = createFile('Project/Page 1.md', 'Page 1');
		const olderDraft = createFile(
			'Project/Page 1 - 2024.2.6 - 9.45am [DRAFT].md',
			'Page 1 - 2024.2.6 - 9.45am [DRAFT]',
		);
		const newerDraft = createFile(
			'Project/Page 1 - 2024.2.6 - 11.55am [DRAFT].md',
			'Page 1 - 2024.2.6 - 11.55am [DRAFT]',
		);
		const otherLive = createFile('Project/Page 2.md', 'Page 2');

		getSortedPageMenuFilesInProjectFolder.mockReturnValue([
			livePage,
			olderDraft,
			newerDraft,
			otherLive,
		]);

		const groups = getGroupedPageMenuFilesInProjectFolder(folder);

		expect(groups).toHaveLength(2);
		expect(groups[0]).toMatchObject({
			stem: 'Page 1',
			liveFile: livePage,
			drafts: [newerDraft, olderDraft],
		});
		expect(groups[1]).toMatchObject({
			stem: 'Page 2',
			liveFile: otherLive,
			drafts: [],
		});
	});

	test('keeps orphan drafts in a group when the live page is gone', () => {
		const folder = new TFolder('Project') as TFolder & { path: string };
		folder.path = 'Project';
		const draftOnly = createFile(
			'Project/Page 1 - 2024.2.6 - 9.45am [DRAFT].md',
			'Page 1 - 2024.2.6 - 9.45am [DRAFT]',
		);

		getSortedPageMenuFilesInProjectFolder.mockReturnValue([draftOnly]);

		const groups = getGroupedPageMenuFilesInProjectFolder(folder);

		expect(groups).toEqual([
			{
				stem: 'Page 1',
				liveFile: null,
				drafts: [draftOnly],
			},
		]);
	});
});
