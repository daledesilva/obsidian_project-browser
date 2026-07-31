import { afterEach, beforeEach, describe, expect, test, jest } from '@jest/globals';
import { TFile } from 'obsidian';

jest.mock('src/utils/file-manipulation', () => ({
	renameTFile: jest.fn(),
}));

const { renameTFile } = jest.requireMock('src/utils/file-manipulation') as {
	renameTFile: jest.Mock;
};

function createLivePage(): TFile & { vault: { read: jest.Mock; create: jest.Mock; getAbstractFileByPath: jest.Mock } } {
	const vault = {
		read: jest.fn(async () => '# Version Page\n'),
		create: jest.fn(async (path: string) => {
			const file = new TFile(path.split('/').pop() ?? path);
			file.path = path;
			file.basename = 'Page 1';
			file.extension = 'md';
			return file;
		}),
		getAbstractFileByPath: jest.fn(() => null),
	};

	const file = new TFile('Page 1.md') as TFile & { vault: typeof vault };
	file.path = 'Project/Page 1.md';
	file.basename = 'Page 1';
	file.extension = 'md';
	file.vault = vault;
	return file;
}

describe('createPageVersion', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		jest.setSystemTime(new Date(2024, 1, 6, 9, 45));
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	test('returns null when the file is already a draft', async () => {
		const { createPageVersion } = await import('./create-page-version');
		const draft = new TFile('Page 1 - 2024.2.6 - 9.45am [DRAFT].md');
		draft.basename = 'Page 1 - 2024.2.6 - 9.45am [DRAFT]';

		await expect(createPageVersion(draft)).resolves.toBeNull();
		expect(renameTFile).not.toHaveBeenCalled();
	});

	test('renames the live page to a designdebt draft basename and recreates the live file', async () => {
		renameTFile.mockResolvedValue('Project/Page 1 - 2024.2.6 - 9.45am [DRAFT].md');
		const file = createLivePage();
		const createdLive = new TFile('Page 1.md');
		createdLive.path = 'Project/Page 1.md';
		file.vault.create.mockResolvedValue(createdLive);

		const { createPageVersion } = await import('./create-page-version');
		const result = await createPageVersion(file);

		expect(renameTFile).toHaveBeenCalledWith(file, 'Page 1 - 2024.2.6 - 9.45am [DRAFT]');
		expect(file.vault.read).toHaveBeenCalledWith(file);
		expect(file.vault.create).toHaveBeenCalledWith('Project/Page 1.md', '# Version Page\n');
		expect(result).toBe(createdLive);
	});

	test('appends (2), (3), … when a same-minute draft path already exists', async () => {
		renameTFile.mockResolvedValue('Project/Page 1 - 2024.2.6 - 9.45am (2) [DRAFT].md');
		const file = createLivePage();
		file.vault.getAbstractFileByPath.mockImplementation((path: string) =>
			path === 'Project/Page 1 - 2024.2.6 - 9.45am [DRAFT].md' ? { path } : null,
		);
		const createdLive = new TFile('Page 1.md');
		createdLive.path = 'Project/Page 1.md';
		file.vault.create.mockResolvedValue(createdLive);

		const { createPageVersion } = await import('./create-page-version');
		await createPageVersion(file);

		expect(renameTFile).toHaveBeenCalledWith(file, 'Page 1 - 2024.2.6 - 9.45am (2) [DRAFT]');
	});

	test('returns null when rename fails', async () => {
		renameTFile.mockResolvedValue(null);
		const file = createLivePage();

		const { createPageVersion } = await import('./create-page-version');
		await expect(createPageVersion(file)).resolves.toBeNull();
		expect(file.vault.create).not.toHaveBeenCalled();
	});
});
