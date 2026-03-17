import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackButtonAndPath } from './back-button-and-path';
import { TFolder } from 'obsidian';

function makeFolder(name: string, path: string, parent: TFolder | null = null): TFolder & { path: string; parent: TFolder | null; vault: { getName: () => string } } {
  const folder = new TFolder(name) as TFolder & { path: string; parent: TFolder | null; vault: { getName: () => string } };
  folder.path = path;
  folder.parent = parent;
  folder.vault = { getName: () => 'Vault' };
  return folder;
}

describe('BackButtonAndPath', () => {
  test('renders root folder name when folder has path /', () => {
    const root = makeFolder('Vault', '/', null);
    const onBackClick = jest.fn();
    const onFolderClick = jest.fn();
    render(
      <BackButtonAndPath
        folder={root}
        onBackClick={onBackClick}
        onFolderClick={onFolderClick}
      />
    );
    expect(screen.getByText('Vault')).toBeInTheDocument();
  });

  test('renders folder name when folder has non-root path', () => {
    const root = makeFolder('Vault', '/', null);
    const child = makeFolder('Project', '/Project', root);
    const onBackClick = jest.fn();
    const onFolderClick = jest.fn();
    render(
      <BackButtonAndPath
        folder={child}
        onBackClick={onBackClick}
        onFolderClick={onFolderClick}
      />
    );
    expect(screen.getByText('Vault')).toBeInTheDocument();
    expect(screen.getByText('Project')).toBeInTheDocument();
  });

  test('renders back button when folder trail has more than one level', () => {
    const root = makeFolder('Vault', '/', null);
    const child = makeFolder('Project', '/Project', root);
    const onBackClick = jest.fn();
    const onFolderClick = jest.fn();
    render(
      <BackButtonAndPath
        folder={child}
        onBackClick={onBackClick}
        onFolderClick={onFolderClick}
      />
    );
    const container = document.querySelector('.ddc_pb_back-button-and-path');
    expect(container).toBeInTheDocument();
    const icon = container?.querySelector('.ddc_pb_icon');
    expect(icon).toBeInTheDocument();
    fireEvent.click(icon!);
    expect(onBackClick).toHaveBeenCalled();
  });
});
