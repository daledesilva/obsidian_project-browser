import { beforeEach, describe, expect, test, jest } from '@jest/globals';
import { TFile, TFolder } from 'obsidian';
import { CARD_BROWSER_VIEW_TYPE } from 'src/views/card-browser-view/card-browser-view-constants';

jest.mock('src/logic/stores', () => ({
  getGlobals: jest.fn(),
}));

const { getGlobals } = jest.requireMock('src/logic/stores');

function createFolder(name: string, path: string, parent: TFolder | null = null) {
  const folder = new TFolder(name) as TFolder & {
    path: string;
    parent: TFolder | null;
    vault?: unknown;
  };
  folder.path = path;
  folder.parent = parent;
  return folder;
}

function createFile(name: string, path: string, parent: TFolder | null = null) {
  const file = new TFile(name) as TFile & {
    path: string;
    parent: TFolder | null;
  };
  file.path = path;
  file.parent = parent;
  return file;
}

describe('reveal-in-project-browser logic', () => {
  const rootFolder = createFolder('', '/');
  const setActiveLeafMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    getGlobals.mockReturnValue({
      plugin: {
        app: {
          vault: {
            getRoot: () => rootFolder,
          },
          workspace: {
            getLeavesOfType: jest.fn().mockReturnValue([]),
            getMostRecentLeaf: jest.fn().mockReturnValue(null),
            getLeaf: jest.fn(),
            setActiveLeaf: setActiveLeafMock,
          },
        },
      },
    });
  });

  test('returns folder reveal location for folders', async () => {
    const { getProjectBrowserRevealLocation } = await import('./reveal-in-project-browser');
    const folder = createFolder('Project A', 'Project A', rootFolder);

    expect(getProjectBrowserRevealLocation(folder)).toEqual({
      path: 'Project A',
      lastTouchedFilePath: '',
    });
  });

  test('returns parent folder reveal location and last touched file for files', async () => {
    const { getProjectBrowserRevealLocation } = await import('./reveal-in-project-browser');
    const folder = createFolder('Project A', 'Project A', rootFolder);
    const file = createFile('note-1.md', 'Project A/note-1.md', folder);

    expect(getProjectBrowserRevealLocation(file)).toEqual({
      path: 'Project A',
      lastTouchedFilePath: 'Project A/note-1.md',
    });
  });

  test('uses common parent folder as the reveal target for multi-selection', async () => {
    const { getProjectBrowserRevealTargetForSelection } = await import('./reveal-in-project-browser');
    const folder = createFolder('Project A', 'Project A', rootFolder);
    const fileA = createFile('note-1.md', 'Project A/note-1.md', folder);
    const fileB = createFile('note-2.md', 'Project A/note-2.md', folder);

    expect(getProjectBrowserRevealTargetForSelection([fileA, fileB])).toBe(folder);
  });

  test('reuses an existing project browser leaf before creating a new leaf', async () => {
    const callOrder: string[] = [];
    const browserLeaf = {
      view: { getViewType: () => CARD_BROWSER_VIEW_TYPE },
      setViewState: jest.fn().mockResolvedValue(undefined),
      getEphemeralState: jest.fn().mockReturnValue({ scrollOffset: 200 }),
      setEphemeralState: jest.fn().mockImplementation(() => { callOrder.push('setEphemeralState'); }),
    };
    const workspace = {
      getLeavesOfType: jest.fn().mockReturnValue([browserLeaf]),
      getMostRecentLeaf: jest.fn().mockReturnValue(browserLeaf),
      getLeaf: jest.fn(),
      setActiveLeaf: jest.fn().mockImplementation(() => { callOrder.push('setActiveLeaf'); }),
    };
    getGlobals.mockReturnValue({
      plugin: {
        app: {
          vault: {
            getRoot: () => rootFolder,
          },
          workspace,
        },
      },
    });

    const { revealInProjectBrowser } = await import('./reveal-in-project-browser');
    const folder = createFolder('Project A', 'Project A', rootFolder);
    const file = createFile('note-1.md', 'Project A/note-1.md', folder);

    await revealInProjectBrowser(file);

    expect(workspace.getLeaf).not.toHaveBeenCalled();
    expect(browserLeaf.setViewState).toHaveBeenCalledWith({
      type: CARD_BROWSER_VIEW_TYPE,
      active: true,
      state: { path: 'Project A' },
    });
    expect(browserLeaf.setEphemeralState).toHaveBeenCalledWith({
      scrollOffset: 0,
      lastTouchedFilePath: 'Project A/note-1.md',
    });
    expect(workspace.setActiveLeaf).toHaveBeenCalledWith(browserLeaf, { focus: true });

    // setActiveLeaf must come before setEphemeralState so that any Obsidian-initiated
    // reset of ephemeral state during activation cannot overwrite lastTouchedFilePath.
    expect(callOrder).toEqual(['setActiveLeaf', 'setEphemeralState']);
  });

  test('creates a new project browser leaf when none exists', async () => {
    const newLeaf = {
      setViewState: jest.fn().mockResolvedValue(undefined),
      getEphemeralState: jest.fn().mockReturnValue({}),
      setEphemeralState: jest.fn(),
      view: { getViewType: () => 'markdown' },
    };
    const workspace = {
      getLeavesOfType: jest.fn().mockReturnValue([]),
      getMostRecentLeaf: jest.fn().mockReturnValue(null),
      getLeaf: jest.fn().mockReturnValue(newLeaf),
      setActiveLeaf: setActiveLeafMock,
    };
    getGlobals.mockReturnValue({
      plugin: {
        app: {
          vault: {
            getRoot: () => rootFolder,
          },
          workspace,
        },
      },
    });

    const { revealInProjectBrowser } = await import('./reveal-in-project-browser');
    const folder = createFolder('Project A', 'Project A', rootFolder);

    await revealInProjectBrowser(folder);

    expect(workspace.getLeaf).toHaveBeenCalledWith(true);
    expect(newLeaf.setViewState).toHaveBeenCalledWith({
      type: CARD_BROWSER_VIEW_TYPE,
      active: true,
      state: { path: 'Project A' },
    });
    expect(newLeaf.setEphemeralState).toHaveBeenCalledWith({
      lastTouchedFilePath: '',
      scrollOffset: 0,
    });
  });

  test('returns null for empty selection', async () => {
    const { getProjectBrowserRevealTargetForSelection } = await import('./reveal-in-project-browser');
    expect(getProjectBrowserRevealTargetForSelection([])).toBeNull();
  });

  test('returns first target when selected files have different parents', async () => {
    const { getProjectBrowserRevealTargetForSelection } = await import('./reveal-in-project-browser');
    const folderA = createFolder('Project A', 'Project A', rootFolder);
    const folderB = createFolder('Project B', 'Project B', rootFolder);
    const fileA = createFile('note-1.md', 'Project A/note-1.md', folderA);
    const fileB = createFile('note-2.md', 'Project B/note-2.md', folderB);

    expect(getProjectBrowserRevealTargetForSelection([fileA, fileB])).toBe(fileA);
  });

  test('uses vault root as parent for file with no parent folder', async () => {
    const { getProjectBrowserRevealLocation } = await import('./reveal-in-project-browser');
    const file = createFile('orphan.md', 'orphan.md', null);

    expect(getProjectBrowserRevealLocation(file)).toEqual({
      path: '/',
      lastTouchedFilePath: 'orphan.md',
    });
  });

  test('prevents concurrent reveal calls for the same leaf', async () => {
    let resolveSetViewState: () => void;
    const setViewStatePromise = new Promise<void>((resolve) => {
      resolveSetViewState = resolve;
    });
    const browserLeaf = {
      view: { getViewType: () => CARD_BROWSER_VIEW_TYPE },
      setViewState: jest.fn().mockReturnValue(setViewStatePromise),
      getEphemeralState: jest.fn().mockReturnValue({}),
      setEphemeralState: jest.fn(),
    };
    const workspace = {
      getLeavesOfType: jest.fn().mockReturnValue([browserLeaf]),
      getMostRecentLeaf: jest.fn().mockReturnValue(browserLeaf),
      getLeaf: jest.fn(),
      setActiveLeaf: setActiveLeafMock,
    };
    getGlobals.mockReturnValue({
      plugin: {
        app: {
          vault: { getRoot: () => rootFolder },
          workspace,
        },
      },
    });

    const { revealInProjectBrowser } = await import('./reveal-in-project-browser');
    const folder = createFolder('Project A', 'Project A', rootFolder);

    const firstCall = revealInProjectBrowser(folder);
    const secondCall = revealInProjectBrowser(folder);

    resolveSetViewState!();
    await firstCall;
    await secondCall;

    expect(browserLeaf.setViewState).toHaveBeenCalledTimes(1);
  });
});