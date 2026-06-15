import { beforeEach, describe, expect, test, jest } from '@jest/globals';
import { TFile, TFolder } from 'obsidian';

class MockMenuItem {
  title = '';
  icon = '';
  section = '';
  onClickHandler: (() => void | Promise<void>) | null = null;

  setTitle(value: string) {
    this.title = value;
    return this;
  }

  setIcon(value: string) {
    this.icon = value;
    return this;
  }

  setSection(value: string) {
    this.section = value;
    return this;
  }

  onClick(handler: () => void | Promise<void>) {
    this.onClickHandler = handler;
    return this;
  }
}

class MockMenu {
  items: Array<MockMenuItem | Record<string, unknown>> = [];

  addItem(callback: (item: MockMenuItem) => void) {
    const item = new MockMenuItem();
    callback(item);
    this.items.push(item);
    return this;
  }
}

jest.mock('src/logic/stores', () => ({
  getGlobals: jest.fn(),
}));

jest.mock('src/logic/reveal-in-project-browser', () => ({
  getProjectBrowserRevealTargetForSelection: jest.fn(),
  revealInProjectBrowser: jest.fn(),
}));

const { getGlobals } = jest.requireMock('src/logic/stores');

const { getProjectBrowserRevealTargetForSelection, revealInProjectBrowser } = jest.requireMock('src/logic/reveal-in-project-browser');

describe('registerRevealInProjectBrowserMenus', () => {
  const workspaceOnMock = jest.fn();
  const registerEventMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    getGlobals.mockReturnValue({
      plugin: {
        registerEvent: registerEventMock,
        app: {
          workspace: {
            on: workspaceOnMock,
          },
        },
      },
    });
  });

  test('registers file-menu and files-menu workspace listeners', async () => {
    workspaceOnMock.mockImplementation((eventName: string, callback: Function) => ({ eventName, callback }));
    const { registerRevealInProjectBrowserMenus } = await import('./reveal-in-project-browser');

    registerRevealInProjectBrowserMenus();

    expect(workspaceOnMock).toHaveBeenNthCalledWith(1, 'file-menu', expect.any(Function));
    expect(workspaceOnMock).toHaveBeenNthCalledWith(2, 'files-menu', expect.any(Function));
    expect(registerEventMock).toHaveBeenCalledTimes(2);
  });

  test('adds reveal item to file-menu and triggers reveal callback', async () => {
    workspaceOnMock.mockImplementation((eventName: string, callback: Function) => ({ eventName, callback }));
    const file = new TFile('note-1.md') as TFile & { path: string };
    file.path = 'Project A/note-1.md';
    getProjectBrowserRevealTargetForSelection.mockReturnValue(file);

    const { registerRevealInProjectBrowserMenus, REVEAL_IN_PROJECT_BROWSER_TITLE } = await import('./reveal-in-project-browser');
    registerRevealInProjectBrowserMenus();

    const fileMenuHandler = workspaceOnMock.mock.calls[0][1] as (menu: MockMenu, file: TFile, source: string) => void;
    const menu = new MockMenu();
    menu.items.push({ title: 'Reveal in Finder', section: 'system' });
    fileMenuHandler(menu, file, 'file-explorer-context-menu');

    expect(getProjectBrowserRevealTargetForSelection).toHaveBeenCalledWith([file]);
    expect(menu.items).toHaveLength(2);

    const revealItem = menu.items[1] as MockMenuItem;
    expect(revealItem.title).toBe(REVEAL_IN_PROJECT_BROWSER_TITLE);
    expect(revealItem.section).toBe('system');

    revealItem.onClickHandler?.();
    expect(revealInProjectBrowser).toHaveBeenCalledWith(file);
  });

  test('adds reveal item to files-menu using the resolved multi-select target', async () => {
    workspaceOnMock.mockImplementation((eventName: string, callback: Function) => ({ eventName, callback }));
    const folder = new TFolder('Project A') as TFolder & { path: string };
    folder.path = 'Project A';
    const file = new TFile('note-1.md') as TFile & { path: string; parent: TFolder };
    file.path = 'Project A/note-1.md';
    file.parent = folder;
    getProjectBrowserRevealTargetForSelection.mockReturnValue(folder);

    const { registerRevealInProjectBrowserMenus } = await import('./reveal-in-project-browser');
    registerRevealInProjectBrowserMenus();

    const filesMenuHandler = workspaceOnMock.mock.calls[1][1] as (menu: MockMenu, files: TFile[], source: string) => void;
    const menu = new MockMenu();
    menu.items.push({ title: 'Reveal in Finder', section: 'system' });
    filesMenuHandler(menu, [file], 'file-explorer-context-menu');

    expect(getProjectBrowserRevealTargetForSelection).toHaveBeenCalledWith([file]);
    const revealItem = menu.items[1] as MockMenuItem;
    expect(revealItem.section).toBe('system');
    revealItem.onClickHandler?.();
    expect(revealInProjectBrowser).toHaveBeenCalledWith(folder);
  });

  test('reuses the cached finder section for later menus from the same source', async () => {
    workspaceOnMock.mockImplementation((eventName: string, callback: Function) => ({ eventName, callback }));
    const file = new TFile('note-1.md') as TFile & { path: string };
    file.path = 'Project A/note-1.md';
    getProjectBrowserRevealTargetForSelection.mockReturnValue(file);

    const { registerRevealInProjectBrowserMenus, REVEAL_IN_PROJECT_BROWSER_TITLE } = await import('./reveal-in-project-browser');
    registerRevealInProjectBrowserMenus();

    const fileMenuHandler = workspaceOnMock.mock.calls[0][1] as (menu: MockMenu, file: TFile, source: string) => void;

    const firstMenu = new MockMenu();
    firstMenu.items.push({ title: 'Reveal in Finder', section: 'system' });
    fileMenuHandler(firstMenu, file, 'file-explorer-context-menu');

    const secondMenu = new MockMenu();
    fileMenuHandler(secondMenu, file, 'file-explorer-context-menu');

    expect(secondMenu.items).toHaveLength(1);

    const revealItem = secondMenu.items[0] as MockMenuItem;
    expect(revealItem.title).toBe(REVEAL_IN_PROJECT_BROWSER_TITLE);
    expect(revealItem.section).toBe('system');
  });

  test('uses finder section from menu item dom data when section is not exposed directly', async () => {
    workspaceOnMock.mockImplementation((eventName: string, callback: Function) => ({ eventName, callback }));
    const file = new TFile('note-1.md') as TFile & { path: string };
    file.path = 'Project A/note-1.md';
    getProjectBrowserRevealTargetForSelection.mockReturnValue(file);

    const { registerRevealInProjectBrowserMenus } = await import('./reveal-in-project-browser');
    registerRevealInProjectBrowserMenus();

    const fileMenuHandler = workspaceOnMock.mock.calls[0][1] as (menu: MockMenu, file: TFile, source: string) => void;
    const menu = new MockMenu();
    menu.items.push({
      title: 'Reveal in Finder',
      dom: {
        dataset: {
          section: 'system',
        },
      },
    });

    fileMenuHandler(menu, file, 'tab-header-context-menu');

    const revealItem = menu.items[1] as MockMenuItem;
    expect(revealItem.section).toBe('system');
  });

  test('does not add menu item when reveal target is null', async () => {
    workspaceOnMock.mockImplementation((eventName: string, callback: Function) => ({ eventName, callback }));
    const file = new TFile('note-1.md') as TFile & { path: string };
    file.path = 'Project A/note-1.md';
    getProjectBrowserRevealTargetForSelection.mockReturnValue(null);

    const { registerRevealInProjectBrowserMenus } = await import('./reveal-in-project-browser');
    registerRevealInProjectBrowserMenus();

    const fileMenuHandler = workspaceOnMock.mock.calls[0][1] as (menu: MockMenu, file: TFile, source: string) => void;
    const menu = new MockMenu();
    fileMenuHandler(menu, file, 'file-explorer-context-menu');

    expect(menu.items).toHaveLength(0);
  });

  test('recognises alternative Finder title on Windows/Linux', async () => {
    workspaceOnMock.mockImplementation((eventName: string, callback: Function) => ({ eventName, callback }));
    const file = new TFile('note-1.md') as TFile & { path: string };
    file.path = 'Project A/note-1.md';
    getProjectBrowserRevealTargetForSelection.mockReturnValue(file);

    const { registerRevealInProjectBrowserMenus } = await import('./reveal-in-project-browser');
    registerRevealInProjectBrowserMenus();

    const fileMenuHandler = workspaceOnMock.mock.calls[0][1] as (menu: MockMenu, file: TFile, source: string) => void;
    const menu = new MockMenu();
    menu.items.push({ title: 'Show in system explorer', section: 'system' });
    fileMenuHandler(menu, file, 'windows-explorer-menu');

    const revealItem = menu.items[1] as MockMenuItem;
    expect(revealItem.section).toBe('system');
  });

  test('adds item without section override when no Finder item exists in menu', async () => {
    workspaceOnMock.mockImplementation((eventName: string, callback: Function) => ({ eventName, callback }));
    const file = new TFile('note-1.md') as TFile & { path: string };
    file.path = 'Project A/note-1.md';
    getProjectBrowserRevealTargetForSelection.mockReturnValue(file);

    const { registerRevealInProjectBrowserMenus, REVEAL_IN_PROJECT_BROWSER_TITLE } = await import('./reveal-in-project-browser');
    registerRevealInProjectBrowserMenus();

    const fileMenuHandler = workspaceOnMock.mock.calls[0][1] as (menu: MockMenu, file: TFile, source: string) => void;
    const menu = new MockMenu();
    fileMenuHandler(menu, file, 'unknown-source');

    expect(menu.items).toHaveLength(1);

    const revealItem = menu.items[0] as MockMenuItem;
    expect(revealItem.title).toBe(REVEAL_IN_PROJECT_BROWSER_TITLE);
    expect(revealItem.section).toBe('');
  });

  test('caches sections independently per source string', async () => {
    workspaceOnMock.mockImplementation((eventName: string, callback: Function) => ({ eventName, callback }));
    const file = new TFile('note-1.md') as TFile & { path: string };
    file.path = 'Project A/note-1.md';
    getProjectBrowserRevealTargetForSelection.mockReturnValue(file);

    const { registerRevealInProjectBrowserMenus } = await import('./reveal-in-project-browser');
    registerRevealInProjectBrowserMenus();

    const fileMenuHandler = workspaceOnMock.mock.calls[0][1] as (menu: MockMenu, file: TFile, source: string) => void;

    const explorerMenu = new MockMenu();
    explorerMenu.items.push({ title: 'Reveal in Finder', section: 'system' });
    fileMenuHandler(explorerMenu, file, 'file-explorer-context-menu');

    const tabMenu = new MockMenu();
    tabMenu.items.push({ title: 'Reveal in Finder', section: 'tab-actions' });
    fileMenuHandler(tabMenu, file, 'tab-header');

    const cachedExplorerMenu = new MockMenu();
    fileMenuHandler(cachedExplorerMenu, file, 'file-explorer-context-menu');

    const cachedTabMenu = new MockMenu();
    fileMenuHandler(cachedTabMenu, file, 'tab-header');

    expect((cachedExplorerMenu.items[0] as MockMenuItem).section).toBe('system');
    expect((cachedTabMenu.items[0] as MockMenuItem).section).toBe('tab-actions');
  });
});