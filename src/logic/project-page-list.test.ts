import { describe, expect, test, jest } from '@jest/globals';
import { TFile, TFolder } from 'obsidian';
import { getSortedPageMenuFilesInProjectFolder } from './project-page-list';

jest.mock('./folder-processes', () => ({
  getItemsInFolder: jest.fn(),
}));

jest.mock('./file-type-filter', () => ({
  isExtensionVisible: jest.fn(() => true),
}));

const { getItemsInFolder } = jest.requireMock('./folder-processes');

const { isExtensionVisible } = jest.requireMock('./file-type-filter');

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
  };
  folder.path = path;
  folder.name = path.split('/').pop() ?? path;
  return folder;
}

describe('project-page-list', () => {
  test('returns page-menu files in natural numeric order', () => {
    const folder = createFolder('Project');
    const files = [
      createFile('Project/Page 18.md'),
      createFile('Project/Page 2.md'),
      createFile('Project/Page 20.md'),
      createFile('Project/Page 19.md'),
      createFile('Project/Page 10.md'),
    ];

    getItemsInFolder.mockReturnValue(files);

    const sortedFiles = getSortedPageMenuFilesInProjectFolder(folder);

    expect(sortedFiles.map((file) => file.name)).toEqual([
      'Page 2.md',
      'Page 10.md',
      'Page 18.md',
      'Page 19.md',
      'Page 20.md',
    ]);
  });

  test('keeps existing page-menu file visibility filtering before sorting', () => {
    const folder = createFolder('Project');
    const visiblePage = createFile('Project/Page 2.md');
    const hiddenPage = createFile('Project/Page 1.canvas');

    getItemsInFolder.mockReturnValue([hiddenPage, visiblePage]);
    isExtensionVisible.mockImplementation((extension: string) => extension === 'md');

    const sortedFiles = getSortedPageMenuFilesInProjectFolder(folder);

    expect(sortedFiles.map((file) => file.name)).toEqual(['Page 2.md']);
    expect(isExtensionVisible).toHaveBeenCalledWith('canvas', 'pageMenu');
    expect(isExtensionVisible).toHaveBeenCalledWith('md', 'pageMenu');
  });
});