import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { TFile, TFolder } from 'obsidian';
import {
  getFileExcerpt,
  getExcerpt,
  getScrollOffset,
  deleteFileImmediately,
  deleteFolderImmediately,
} from './file-processes';

jest.mock('./stores', () => ({
  getGlobals: jest.fn(),
}));
jest.mock('./folder-processes', () => ({
  getProjectExcerpt: jest.fn().mockResolvedValue('project excerpt'),
}));

const { getGlobals } = jest.requireMock('./stores');
const { getProjectExcerpt } = jest.requireMock('./folder-processes');

describe('getFileExcerpt', () => {
  test('processes file content through removeFrontmatter, removeCodeBlocks, etc.', async () => {
    const file = new TFile('note.md', 0, 0) as TFile & { vault: { cachedRead: jest.Mock } };
    file.vault = {
      cachedRead: jest.fn().mockResolvedValue(
        '---\nfrontmatter: true\n---\n\n# Heading\n\nSome **markdown** and `code` here.'
      ),
    } as unknown as TFile['vault'];

    const result = await getFileExcerpt(file);
    expect(file.vault.cachedRead).toHaveBeenCalledWith(file);
    expect(result).not.toContain('---');
    expect(result).not.toContain('frontmatter');
    expect(result).toContain('Heading');
    expect(result).not.toContain('**');
    expect(result).not.toContain('`');
    expect(result.trim()).toBeTruthy();
  });

  test('returns simplified whitespace for empty-looking content', async () => {
    const file = new TFile('note.md', 0, 0) as TFile & { vault: { cachedRead: jest.Mock } };
    file.vault = {
      cachedRead: jest.fn().mockResolvedValue('   \n\n  '),
    } as unknown as TFile['vault'];

    const result = await getFileExcerpt(file);
    expect(result).toBe('');
  });
});

describe('getExcerpt', () => {
  beforeEach(() => {
    getGlobals.mockReturnValue({ plugin: {} });
  });

  test('returns getFileExcerpt result for TFile', async () => {
    const file = new TFile('note.md', 0, 0) as TFile & { vault: { cachedRead: jest.Mock } };
    file.vault = {
      cachedRead: jest.fn().mockResolvedValue('plain text'),
    } as unknown as TFile['vault'];

    const result = await getExcerpt(file);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  test('returns getProjectExcerpt result for TFolder', async () => {
    const folder = new TFolder('project') as TFolder & { vault: unknown };
    folder.vault = {};

    const result = await getExcerpt(folder);
    expect(getProjectExcerpt).toHaveBeenCalledWith(folder);
    expect(result).toBe('project excerpt');
  });
});

describe('getScrollOffset', () => {
  beforeEach(() => {
    getGlobals.mockReturnValue({
      plugin: {
        app: {
          workspace: {
            activeEditor: null,
          },
        },
      },
    });
  });

  test('returns 0 when activeEditor is null', () => {
    expect(getScrollOffset()).toBe(0);
  });

  test('returns 0 when editor is null', () => {
    getGlobals.mockReturnValue({
      plugin: {
        app: {
          workspace: {
            activeEditor: { editor: null },
          },
        },
      },
    });
    expect(getScrollOffset()).toBe(0);
  });

  test('returns editor getScrollInfo().top when editor present', () => {
    getGlobals.mockReturnValue({
      plugin: {
        app: {
          workspace: {
            activeEditor: {
              editor: { getScrollInfo: () => ({ top: 42 }) },
            },
          },
        },
      },
    });
    expect(getScrollOffset()).toBe(42);
  });
});

describe('deleteFileImmediately', () => {
  test('calls fileManager.trashFile and refreshFileDependants', async () => {
    const trashFileMock = jest.fn().mockResolvedValue(undefined);
    const refreshMock = jest.fn();
    const file = new TFile('file.md', 0, 0);
    getGlobals.mockReturnValue({
      plugin: {
        app: { fileManager: { trashFile: trashFileMock } },
        refreshFileDependants: refreshMock,
      },
    });

    await deleteFileImmediately(file);
    expect(trashFileMock).toHaveBeenCalledWith(file);
    expect(refreshMock).toHaveBeenCalled();
  });
});

describe('deleteFolderImmediately', () => {
  test('calls fileManager.trashFile and refreshFileDependants', async () => {
    const trashFileMock = jest.fn().mockResolvedValue(undefined);
    const refreshMock = jest.fn();
    const folder = new TFolder('folder');
    getGlobals.mockReturnValue({
      plugin: {
        app: { fileManager: { trashFile: trashFileMock } },
        refreshFileDependants: refreshMock,
      },
    });

    await deleteFolderImmediately(folder);
    expect(trashFileMock).toHaveBeenCalledWith(folder);
    expect(refreshMock).toHaveBeenCalled();
  });
});
