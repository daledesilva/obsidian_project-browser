import { beforeEach, describe, expect, test, jest } from '@jest/globals';

jest.mock('src/utils/file-manipulation', () => ({
	renameTFile: jest.fn(async () => 'renamed.md'),
	renameTFolder: jest.fn(async () => 'Renamed Folder'),
}));

jest.mock('./get-state-by-name', () => ({
	getStateByName: jest.fn(),
	getStateByNameForFile: jest.fn(),
}));

const { renameTFile, renameTFolder } = jest.requireMock('src/utils/file-manipulation') as {
	renameTFile: jest.Mock;
	renameTFolder: jest.Mock;
};
const { getStateByName, getStateByNameForFile } = jest.requireMock('./get-state-by-name') as {
	getStateByName: jest.Mock;
	getStateByNameForFile: jest.Mock;
};

function mockFile(basename: string, path?: string) {
	return { basename, path: path ?? `${basename}.md`, extension: 'md' };
}

function mockFolder(name: string, path?: string) {
	return { name, path: path ?? name };
}

describe('sync-hidden-filename', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		getStateByName.mockReturnValue(null);
		getStateByNameForFile.mockResolvedValue(null);
	});

	describe('manual hide sync', () => {
		test('adds [HIDDEN] without removing [STATE-HIDE]', async () => {
			const { syncFileManualHiddenFilenameSuffix } = await import('./sync-hidden-filename');
			const file = mockFile('Note [STATE-HIDE]', 'Note [STATE-HIDE].md');

			await syncFileManualHiddenFilenameSuffix(file as never, true);

			expect(renameTFile).toHaveBeenCalledWith(file, 'Note [STATE-HIDE] [HIDDEN]');
		});

		test('removes only [HIDDEN] and keeps [STATE-HIDE]', async () => {
			const { syncFileManualHiddenFilenameSuffix } = await import('./sync-hidden-filename');
			const file = mockFile('Note [STATE-HIDE] [HIDDEN]', 'Note [STATE-HIDE] [HIDDEN].md');

			await syncFileManualHiddenFilenameSuffix(file as never, false);

			expect(renameTFile).toHaveBeenCalledWith(file, 'Note [STATE-HIDE]');
		});

		test('skips rename when manual hide state already matches', async () => {
			const { syncFileManualHiddenFilenameSuffix } = await import('./sync-hidden-filename');
			const file = mockFile('Note [HIDDEN]', 'Note [HIDDEN].md');

			await syncFileManualHiddenFilenameSuffix(file as never, true);

			expect(renameTFile).not.toHaveBeenCalled();
		});
	});

	describe('state hide sync', () => {
		test('adds [STATE-HIDE] without removing [HIDDEN]', async () => {
			const { syncFileStateHideFilenameSuffix } = await import('./sync-hidden-filename');
			const file = mockFile('Note [HIDDEN]', 'Note [HIDDEN].md');

			await syncFileStateHideFilenameSuffix(file as never, true);

			expect(renameTFile).toHaveBeenCalledWith(file, 'Note [STATE-HIDE] [HIDDEN]');
		});

		test('removes only [STATE-HIDE] and keeps [HIDDEN]', async () => {
			const { syncFileStateHideFilenameSuffix } = await import('./sync-hidden-filename');
			const file = mockFile('Note [STATE-HIDE] [HIDDEN]', 'Note [STATE-HIDE] [HIDDEN].md');

			await syncFileStateHideFilenameSuffix(file as never, false);

			expect(renameTFile).toHaveBeenCalledWith(file, 'Note [HIDDEN]');
		});

		test('syncFolderStateHideFilenameSuffix renames project folders', async () => {
			const { syncFolderStateHideFilenameSuffix } = await import('./sync-hidden-filename');
			const folder = mockFolder('Project A');

			await syncFolderStateHideFilenameSuffix(folder as never, true);

			expect(renameTFolder).toHaveBeenCalledWith(folder, 'Project A [STATE-HIDE]');
		});
	});

	describe('resolve hide flag from live settings', () => {
		test('syncFileHiddenFilenameForState uses settings when menu state omits hideFromSearchGraph', async () => {
			getStateByNameForFile.mockResolvedValue({ name: 'Archived', hideFromSearchGraph: true });
			const { syncFileHiddenFilenameForState } = await import('./sync-hidden-filename');
			const file = mockFile('Note');

			await syncFileHiddenFilenameForState(file as never, {
				name: 'Archived',
				hideFromSearchGraph: false,
			} as never);

			expect(renameTFile).toHaveBeenCalledWith(file, 'Note [STATE-HIDE]');
		});

		test('syncFolderHiddenFilenameForState clears [STATE-HIDE] when applied state is null', async () => {
			const { syncFolderHiddenFilenameForState } = await import('./sync-hidden-filename');
			const folder = mockFolder('Project A [STATE-HIDE]', 'Project A [STATE-HIDE]');

			await syncFolderHiddenFilenameForState(folder as never, null);

			expect(renameTFolder).toHaveBeenCalledWith(folder, 'Project A');
		});

		test('syncFileHiddenFilenameForState does not rename when resolved hide is false', async () => {
			getStateByNameForFile.mockResolvedValue({ name: 'Idea', hideFromSearchGraph: false });
			const { syncFileHiddenFilenameForState } = await import('./sync-hidden-filename');
			const file = mockFile('Note');

			await syncFileHiddenFilenameForState(file as never, { name: 'Idea' } as never);

			expect(renameTFile).not.toHaveBeenCalled();
		});
	});
});
