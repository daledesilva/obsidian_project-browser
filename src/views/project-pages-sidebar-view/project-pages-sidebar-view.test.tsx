import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { TFile, TFolder } from 'obsidian';
import { ProjectPagesSidebarContent } from './project-pages-sidebar-view';

jest.mock('./project-pages-sidebar-view.scss', () => ({}));
jest.mock('src/views/card-browser-view/card-browser-view', () => ({
  CARD_BROWSER_VIEW_TYPE: 'card-browser-view',
}));

jest.mock('src/components/project-page-menu-file-button/project-page-menu-file-button', () => ({
  ProjectPageMenuFileButton: (props: {
    file: TFile;
    isCurrentPage: boolean;
    onPageClick: (file: TFile) => void;
  }) => (
    <button
      type="button"
      onClick={() => props.onPageClick(props.file)}
      data-testid={`page-${props.file.path}`}
      disabled={props.isCurrentPage}
    >
      {props.file.basename}
    </button>
  ),
}));

const mockOpenFileInMostRecentRootLeaf = jest.fn();

jest.mock('src/logic/file-access-processes', () => ({
  openFileInMostRecentRootLeaf: (file: TFile) => mockOpenFileInMostRecentRootLeaf(file),
  openNewPageAndSelectTitle: jest.fn(),
}));

jest.mock('src/logic/project-page-list', () => ({
  getSortedPageMenuFilesInProjectFolder: jest.fn(),
}));

jest.mock('src/logic/project-pages-sidebar-controller', () => ({
  syncProjectPagesSidebarFromActiveWorkspaceContext: jest.fn(),
}));

jest.mock('src/logic/toggle-state-menu', () => ({
  openStateMenuIfClosed: jest.fn(),
}));

jest.mock('src/utils/file-manipulation', () => ({
  createProject: jest.fn(),
}));

jest.mock('src/logic/stores', () => ({
  getGlobals: jest.fn(),
}));

const { getSortedPageMenuFilesInProjectFolder } = jest.requireMock('src/logic/project-page-list') as {
  getSortedPageMenuFilesInProjectFolder: jest.Mock;
};

const { getGlobals } = jest.requireMock('src/logic/stores') as {
  getGlobals: jest.Mock;
};

function createFile(path: string): TFile {
  const name = path.split('/').pop() ?? path;
  const file = new TFile(name, 0, 0) as TFile & {
    path: string;
    name: string;
    basename: string;
    extension: string;
  };
  file.path = path;
  file.name = name;
  file.basename = name.replace(/\.[^.]+$/, '');
  file.extension = name.includes('.') ? name.split('.').pop() ?? '' : '';
  return file;
}

function createFolder(path: string): TFolder {
  const folder = new TFolder(path) as TFolder & {
    path: string;
    name: string;
    vault: { on: jest.Mock; off: jest.Mock };
  };
  folder.path = path;
  folder.name = path.split('/').pop() ?? path;
  folder.vault = {
    on: jest.fn(),
    off: jest.fn(),
  };
  return folder;
}

describe('ProjectPagesSidebarContent', () => {
  const pageOne = createFile('Project/Page 1.md');
  const pageTwo = createFile('Project/Page 2.md');
  const projectFolder = createFolder('Project');

  const workspaceHandlers: Record<string, ((arg: unknown) => void)[]> = {};
  const workspace = {
    rootSplit: {},
    on: jest.fn((eventName: string, handler: (arg: unknown) => void) => {
      workspaceHandlers[eventName] ??= [];
      workspaceHandlers[eventName].push(handler);
      return { eventName, handler };
    }),
    offref: jest.fn((eventRef: { eventName: string; handler: (arg: unknown) => void }) => {
      workspaceHandlers[eventRef.eventName] = (workspaceHandlers[eventRef.eventName] ?? []).filter(
        (handler) => handler !== eventRef.handler
      );
    }),
    getActiveFile: jest.fn(() => pageOne),
    getMostRecentLeaf: jest.fn(() => ({ setViewState: jest.fn() })),
    getLeaf: jest.fn(() => ({ setViewState: jest.fn() })),
  };

  beforeEach(() => {
    mockOpenFileInMostRecentRootLeaf.mockClear();
    for (const key of Object.keys(workspaceHandlers)) {
      delete workspaceHandlers[key];
    }
    workspace.on.mockClear();
    workspace.offref.mockClear();
    workspace.getActiveFile.mockImplementation(() => pageOne);
    projectFolder.vault.on.mockClear();
    projectFolder.vault.off.mockClear();

    getSortedPageMenuFilesInProjectFolder.mockReturnValue([pageOne, pageTwo]);
    getGlobals.mockReturnValue({
      plugin: {
        app: {
          workspace,
          vault: projectFolder.vault,
        },
      },
    });
  });

  test('updates selected page immediately when clicking a different page', () => {
    render(<ProjectPagesSidebarContent projectFolder={projectFolder} />);

    expect(screen.getByTestId(`page-${pageOne.path}`)).toBeDisabled();
    expect(screen.getByTestId(`page-${pageTwo.path}`)).not.toBeDisabled();

    fireEvent.click(screen.getByTestId(`page-${pageTwo.path}`));

    expect(mockOpenFileInMostRecentRootLeaf).toHaveBeenCalledWith(pageTwo);
    expect(screen.getByTestId(`page-${pageTwo.path}`)).toBeDisabled();
    expect(screen.getByTestId(`page-${pageOne.path}`)).not.toBeDisabled();
  });
});
