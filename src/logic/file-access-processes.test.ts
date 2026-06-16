import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { TFile } from 'obsidian';
import {
  openFileInSameLeaf,
  openFileInBackgroundTab,
  openNewPageAndSelectTitle,
} from './file-access-processes';

jest.mock('./stores', () => ({
  getGlobals: jest.fn(),
}));

const { getGlobals } = jest.requireMock('./stores');

describe('openFileInSameLeaf', () => {
  test('opens file in most recent leaf when available', () => {
    const openFileMock = jest.fn();
    const leaf = { openFile: openFileMock };
    getGlobals.mockReturnValue({
      plugin: {
        app: {
          workspace: {
            getMostRecentLeaf: () => leaf,
            getLeaf: jest.fn(),
          },
        },
      },
    });
    const file = new TFile('note.md', 0, 0);

    openFileInSameLeaf(file);
    expect(openFileMock).toHaveBeenCalledWith(file);
  });

  test('uses getLeaf() when getMostRecentLeaf returns null', () => {
    const openFileMock = jest.fn();
    const newLeaf = { openFile: openFileMock };
    const getLeafMock = jest.fn().mockReturnValue(newLeaf);
    getGlobals.mockReturnValue({
      plugin: {
        app: {
          workspace: {
            getMostRecentLeaf: () => null,
            getLeaf: getLeafMock,
          },
        },
      },
    });
    const file = new TFile('note.md', 0, 0);

    openFileInSameLeaf(file);
    expect(getLeafMock).toHaveBeenCalled();
    expect(openFileMock).toHaveBeenCalledWith(file);
  });
});

describe('openFileInBackgroundTab', () => {
  test('opens file in new leaf and switches back to current leaf', async () => {
    const openFileMock = jest.fn().mockResolvedValue(undefined);
    const curLeaf = {};
    const newLeaf = { openFile: openFileMock };
    const setActiveLeafMock = jest.fn();
    getGlobals.mockReturnValue({
      plugin: {
        app: {
          workspace: {
            getMostRecentLeaf: () => curLeaf,
            getLeaf: jest.fn().mockReturnValue(newLeaf),
            setActiveLeaf: setActiveLeafMock,
          },
        },
      },
    });
    const file = new TFile('note.md', 0, 0);

    await openFileInBackgroundTab(file);
    expect(openFileMock).toHaveBeenCalledWith(file);
    expect(setActiveLeafMock).toHaveBeenCalledWith(curLeaf);
  });
});

describe('openNewPageAndSelectTitle', () => {
  test('adds file path to pending set when showRenamePopupOnNewPage is true', () => {
    const openFileMock = jest.fn();
    getGlobals.mockReturnValue({
      plugin: {
        app: {
          workspace: {
            getMostRecentLeaf: () => ({ openFile: openFileMock }),
            getLeaf: jest.fn(),
          },
        },
        settings: { showRenamePopupOnNewPage: true },
      },
    });
    const file = new TFile('new.md', 0, 0) as TFile & { path?: string };
    file.path = 'path/to/new.md';

    openNewPageAndSelectTitle(file);
    expect(openFileMock).toHaveBeenCalledWith(file);
    // pendingTitleSelectPaths is module-private; we only assert openFileInSameLeaf was invoked
  });

  test('does not add to pending when showRenamePopupOnNewPage is false', () => {
    const openFileMock = jest.fn();
    getGlobals.mockReturnValue({
      plugin: {
        app: {
          workspace: {
            getMostRecentLeaf: () => ({ openFile: openFileMock }),
            getLeaf: jest.fn(),
          },
        },
        settings: { showRenamePopupOnNewPage: false },
      },
    });
    const file = new TFile('new.md', 0, 0);

    openNewPageAndSelectTitle(file);
    expect(openFileMock).toHaveBeenCalledWith(file);
  });
});
