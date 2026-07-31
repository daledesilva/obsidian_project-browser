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

class MockFile {
  basename = 'note-1';
  name = 'note-1.md';
  path = 'Project A/note-1.md';
  extension = 'md';
  parent = { path: 'Project A' };
}

jest.mock('obsidian', () => ({
  Menu: MockMenu,
  TFile: MockFile,
}));

jest.mock('src/logic/file-access-processes', () => ({
  openFileInBackgroundTab: jest.fn(),
}));

jest.mock('src/logic/file-processes', () => ({
  deleteFileWithConfirmation: jest.fn(),
}));

jest.mock('src/logic/get-file-type-label', () => ({
  hasFrontmatterSupport: jest.fn(() => true),
}));

jest.mock('src/logic/is-extension-unsupported', () => ({
  isExtensionUnsupportedByObsidian: jest.fn(() => false),
}));

jest.mock('src/logic/reveal-in-project-browser', () => ({
  revealInProjectBrowser: jest.fn(),
}));

jest.mock('src/modals/rename-file-modal/rename-file-modal', () => ({
  RenameFileModal: jest.fn().mockImplementation(() => ({
    showModal: jest.fn(),
  })),
}));

jest.mock('src/logic/stores', () => ({
  getGlobals: jest.fn(),
}));

jest.mock('src/logic/frontmatter-processes', () => ({
  getFileStateSettingsAsync: jest.fn(),
  getFilePrioritySettings: jest.fn(),
  setFilePriority: jest.fn(),
  setFileState: jest.fn(),
}));

jest.mock('src/logic/project-page-states', () => ({
  getStateSettingsForFile: jest.fn(),
}));

jest.mock('src/logic/project-excerpt-source', () => ({
  isMarkdownFile: jest.fn(),
}));

jest.mock('src/utils/file-manipulation', () => ({
  getFolderSettings: jest.fn(),
  setFolderExcerptSource: jest.fn(),
}));

jest.mock('src/logic/sync-hidden-filename', () => ({
  setFileHiddenFromSearchGraph: jest.fn(),
}));

const { getGlobals } = jest.requireMock('src/logic/stores');
const { getFileStateSettingsAsync, getFilePrioritySettings } = jest.requireMock('src/logic/frontmatter-processes');
const { getStateSettingsForFile } = jest.requireMock('src/logic/project-page-states');
const { isMarkdownFile } = jest.requireMock('src/logic/project-excerpt-source');
const { getFolderSettings } = jest.requireMock('src/utils/file-manipulation');
const { setFileHiddenFromSearchGraph } = jest.requireMock('src/logic/sync-hidden-filename');

describe('registerFileContextMenu', () => {
  beforeEach(() => {
    mockCreatedMenus.length = 0;
    jest.clearAllMocks();
    document.body.innerHTML = '';
    getFileStateSettingsAsync.mockResolvedValue({ name: 'Idea' });
    getFilePrioritySettings.mockReturnValue(null);
    getStateSettingsForFile.mockResolvedValue({
      visible: [{ name: 'Idea' }],
      hidden: [{ name: 'Archived' }],
    });
    isMarkdownFile.mockReturnValue(true);
    getFolderSettings.mockResolvedValue({ isProject: true, excerptSource: null });
    getGlobals.mockReturnValue({
      plugin: {
        app: {
          vault: {},
        },
        settings: {
          priorities: [{ name: 'High' }],
        },
      },
    });
  });

  test('includes hide from search/graph alongside excerpt source for project markdown pages', async () => {
    const { registerFileContextMenu } = await import('./file-context-menu');
    const fileButtonEl = document.createElement('button');
    const file = new MockFile();

    registerFileContextMenu({
      fileButtonEl,
      file: file as never,
      onFileChange: jest.fn(),
    });

    fileButtonEl.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    const menu = mockCreatedMenus[0];
    expect(menu).toBeDefined();
    const titles = menu.items
      .filter((item): item is MockMenuItem => 'title' in item)
      .map((item) => item.title);

    expect(titles).toContain('Hide from search/graph');
    expect(titles).toContain('Set as excerpt source');

    const hideItem = menu.items.find(
      (item) => 'title' in item && item.title === 'Hide from search/graph',
    ) as MockMenuItem;
    await hideItem.onClickHandler?.();
    expect(setFileHiddenFromSearchGraph).toHaveBeenCalledWith(file, true);
  });
});
