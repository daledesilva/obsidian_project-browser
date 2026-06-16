import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { TFile, TFolder } from 'obsidian';
import { ProjectPagesFAB } from './project-pages-fab';

jest.mock('src/context-menus/file-context-menu', () => ({
  registerFileContextMenu: jest.fn(),
}));

jest.mock('src/logic/folder-processes', () => ({
  getItemsInFolder: jest.fn(),
}));

jest.mock('src/logic/file-type-filter', () => ({
  isExtensionVisible: jest.fn(() => true),
}));

jest.mock('src/logic/get-file-display-name', () => ({
  getFileDisplayNameParts: jest.fn((file: TFile) => ({ basename: file.basename ?? file.name, extension: '' })),
}));

jest.mock('src/logic/get-file-type-label', () => ({
  getFileTypeLabel: jest.fn(() => ''),
}));

jest.mock('src/logic/is-extension-unsupported', () => ({
  isExtensionUnsupportedByObsidian: jest.fn(() => false),
}));

jest.mock('src/logic/stores', () => ({
  getGlobals: jest.fn(() => ({ plugin: {} })),
}));

const { getItemsInFolder } = jest.requireMock('src/logic/folder-processes') as {
  getItemsInFolder: jest.Mock;
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

describe('ProjectPagesFAB', () => {
  const pageOne = createFile('Project/Page 1.md');
  const pageTwo = createFile('Project/Page 2.md');
  const projectFolder = createFolder('Project');
  const onNavigateToPage = jest.fn();
  const onOpenProjectFolder = jest.fn();

  beforeEach(() => {
    onNavigateToPage.mockClear();
    onOpenProjectFolder.mockClear();
    getItemsInFolder.mockReturnValue([pageOne, pageTwo]);
  });

  test('keeps menu open when navigating to another page', () => {
    render(
      <ProjectPagesFAB
        projectFolder={projectFolder}
        currentFile={pageOne}
        parentIsProject={true}
        onNavigateToPage={onNavigateToPage}
        onOpenProjectFolder={onOpenProjectFolder}
      />
    );

    fireEvent.click(screen.getByTitle('Project pages'));
    fireEvent.click(screen.getByText('Page 2'));

    expect(onNavigateToPage).toHaveBeenCalledWith(pageTwo);
    expect(screen.getByText('Page 2')).toBeInTheDocument();
  });

  test('updates active page button when currentFile prop changes', () => {
    const { rerender } = render(
      <ProjectPagesFAB
        projectFolder={projectFolder}
        currentFile={pageOne}
        parentIsProject={true}
        initialMenuOpen={true}
        onNavigateToPage={onNavigateToPage}
        onOpenProjectFolder={onOpenProjectFolder}
      />
    );

    expect(screen.getByText('Page 1').closest('button')).toBeDisabled();
    expect(screen.getByText('Page 2').closest('button')).not.toBeDisabled();

    rerender(
      <ProjectPagesFAB
        projectFolder={projectFolder}
        currentFile={pageTwo}
        parentIsProject={true}
        initialMenuOpen={true}
        onNavigateToPage={onNavigateToPage}
        onOpenProjectFolder={onOpenProjectFolder}
      />
    );

    expect(screen.getByText('Page 1').closest('button')).not.toBeDisabled();
    expect(screen.getByText('Page 2').closest('button')).toBeDisabled();
  });
});
