import { beforeEach, describe, expect, test, jest } from '@jest/globals';

const mockCreatedMenus: MockMenu[] = [];

class MockMenuItem {
  title = '';
  checked = false;
  onClickHandler: (() => void | Promise<void>) | null = null;

  setTitle(value: string) {
    this.title = value;
    return this;
  }

  setChecked(value: boolean) {
    this.checked = value;
    return this;
  }

  onClick(handler: () => void | Promise<void>) {
    this.onClickHandler = handler;
    return this;
  }
}

class MockMenu {
  items: Array<MockMenuItem | { separator: true }> = [];
  showAtMouseEvent = jest.fn();

  constructor() {
    mockCreatedMenus.push(this);
  }

  addItem(callback: (item: MockMenuItem) => void) {
    const item = new MockMenuItem();
    callback(item);
    this.items.push(item);
    return this;
  }

  addSeparator() {
    this.items.push({ separator: true });
    return this;
  }
}

class MockFolder {
  name = 'Drafts';
  path = 'Drafts';
  parent = { path: '' };
}

jest.mock('obsidian', () => ({
  Menu: MockMenu,
  TFolder: MockFolder,
}));

jest.mock('src/logic/stores', () => ({
  getGlobals: jest.fn(),
}));

jest.mock('src/utils/file-manipulation', () => ({
  getFolderSettings: jest.fn(),
  hideFolder: jest.fn(),
  unhideFolder: jest.fn(),
  setFolderAsProject: jest.fn(),
  setFolderAsFolder: jest.fn(),
}));

jest.mock('src/logic/file-processes', () => ({
  deleteFolderWithConfirmation: jest.fn(),
}));

jest.mock('src/logic/reveal-in-project-browser', () => ({
  revealInProjectBrowser: jest.fn(),
}));

jest.mock('src/logic/sync-hidden-filename', () => ({
  setFolderHiddenFromSearchGraph: jest.fn(),
}));

jest.mock('src/modals/rename-folder-modal/rename-folder-modal', () => ({
  RenameFolderModal: jest.fn().mockImplementation(() => ({
    showModal: jest.fn(),
  })),
}));

const { getGlobals } = jest.requireMock('src/logic/stores');
const { getFolderSettings } = jest.requireMock('src/utils/file-manipulation');
const { setFolderHiddenFromSearchGraph } = jest.requireMock('src/logic/sync-hidden-filename');

describe('registerFolderContextMenu', () => {
  beforeEach(() => {
    mockCreatedMenus.length = 0;
    jest.clearAllMocks();
    document.body.innerHTML = '';
    getFolderSettings.mockResolvedValue({ isProject: false, isHidden: false });
    getGlobals.mockReturnValue({
      plugin: {
        app: { vault: {} },
        settings: { access: { launchFolder: '' } },
        saveSettings: jest.fn(),
      },
    });
  });

  test('adds hide from search/graph action for folders', async () => {
    const { registerFolderContextMenu } = await import('./folder-context-menu');
    const folderButtonEl = document.createElement('button');
    const folder = new MockFolder();
    const onFolderChange = jest.fn();

    registerFolderContextMenu({
      folderBtnEl: folderButtonEl,
      folder: folder as never,
      onFolderChange,
    });

    folderButtonEl.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    const menu = mockCreatedMenus[0];
    const hideItem = menu.items.find(
      (item) => 'title' in item && item.title === 'Hide from search/graph',
    ) as MockMenuItem;

    expect(hideItem).toBeDefined();
    await hideItem.onClickHandler?.();
    expect(setFolderHiddenFromSearchGraph).toHaveBeenCalledWith(folder, true);
    expect(onFolderChange).toHaveBeenCalled();
  });

  test('shows Show in search/graph when folder already has manual [HIDDEN] suffix', async () => {
    const { registerFolderContextMenu } = await import('./folder-context-menu');
    const folderButtonEl = document.createElement('button');
    const folder = new MockFolder();
    folder.name = 'Drafts [HIDDEN]';
    folder.path = 'Drafts [HIDDEN]';

    registerFolderContextMenu({
      folderBtnEl: folderButtonEl,
      folder: folder as never,
      onFolderChange: jest.fn(),
    });

    folderButtonEl.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    const menu = mockCreatedMenus[0];
    const titles = menu.items
      .filter((item): item is MockMenuItem => 'title' in item)
      .map((item) => item.title);

    expect(titles).toContain('Show in search/graph');
  });
});
