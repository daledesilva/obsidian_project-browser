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
  name = 'Project A';
  path = 'Projects/Project A';
}

jest.mock('obsidian', () => ({
  Menu: MockMenu,
  TFolder: MockFolder,
}));

jest.mock('src/logic/stores', () => ({
  getGlobals: jest.fn(),
}));

jest.mock('src/utils/file-manipulation', () => ({
  getFolderPrioritySettings: jest.fn(),
  getFolderStateName: jest.fn(),
  setFolderAsFolder: jest.fn(),
  setFolderPriority: jest.fn(),
  setFolderState: jest.fn(),
}));

jest.mock('src/logic/file-processes', () => ({
  deleteFolderWithConfirmation: jest.fn(),
}));

jest.mock('src/logic/reveal-in-project-browser', () => ({
  revealInProjectBrowser: jest.fn(),
}));

jest.mock('src/modals/rename-folder-modal/rename-folder-modal', () => ({
  RenameFolderModal: jest.fn().mockImplementation(() => ({
    showModal: jest.fn(),
  })),
}));

const { getGlobals } = jest.requireMock('src/logic/stores') as {
  getGlobals: jest.Mock;
};

const { getFolderPrioritySettings, getFolderStateName, setFolderPriority } = jest.requireMock('src/utils/file-manipulation') as {
  getFolderPrioritySettings: jest.Mock;
  getFolderStateName: jest.Mock;
  setFolderPriority: jest.Mock;
};

const { revealInProjectBrowser } = jest.requireMock('src/logic/reveal-in-project-browser') as {
  revealInProjectBrowser: jest.Mock;
};

describe('registerProjectContextMenu', () => {
  beforeEach(() => {
    mockCreatedMenus.length = 0;
    jest.clearAllMocks();
    getFolderStateName.mockResolvedValue('In Progress');
    getFolderPrioritySettings.mockResolvedValue({ name: 'High' });
    getGlobals.mockReturnValue({
      plugin: {
        settings: {
          access: { launchFolder: '' },
          priorities: [{ name: 'High' }, { name: 'Low' }],
          states: {
            visible: [{ name: 'In Progress' }],
            hidden: [{ name: 'Done' }],
          },
        },
        saveSettings: jest.fn(),
      },
    });
  });

  test('adds priority items with the current project priority checked and updates priority on click', async () => {
    const { registerProjectContextMenu } = await import('./project-context-menu');
    const projectButtonEl = document.createElement('button');
    const folder = new MockFolder();
    const onProjectChange = jest.fn();

    registerProjectContextMenu({
      projectButtonEl,
      folder: folder as never,
      onProjectChange,
    });

    projectButtonEl.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();

    const menu = mockCreatedMenus[0];
    const highPriorityItem = menu.items.find((item) => 'title' in item && item.title === 'High') as MockMenuItem;
    const lowPriorityItem = menu.items.find((item) => 'title' in item && item.title === 'Low') as MockMenuItem;

    expect(highPriorityItem.checked).toBe(true);
    expect(lowPriorityItem.checked).toBe(false);

    await lowPriorityItem.onClickHandler?.();

    expect(setFolderPriority).toHaveBeenCalledWith(folder, { name: 'Low' });
    expect(onProjectChange).toHaveBeenCalled();
  });

  test('adds reveal in project browser action', async () => {
    const { registerProjectContextMenu } = await import('./project-context-menu');
    const projectButtonEl = document.createElement('button');
    const folder = new MockFolder();

    registerProjectContextMenu({
      projectButtonEl,
      folder: folder as never,
      onProjectChange: jest.fn(),
    });

    projectButtonEl.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();

    const menu = mockCreatedMenus[0];
    const revealItem = menu.items.find((item) => 'title' in item && item.title === 'Reveal in Project Browser') as MockMenuItem;

    expect(revealItem).toBeDefined();

    revealItem.onClickHandler?.();
    expect(revealInProjectBrowser).toHaveBeenCalledWith(folder);
  });
});