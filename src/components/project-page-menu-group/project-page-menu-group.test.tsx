import React from 'react';
import { beforeEach, describe, expect, test, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { TFile } from 'obsidian';
import { ProjectPageMenuGroupView } from './project-page-menu-group';

jest.mock('src/components/project-page-menu-file-button/project-page-menu-file-button', () => {
	const { parseDraftBasename } = jest.requireActual('src/logic/filename-suffixes') as typeof import('src/logic/filename-suffixes');
	return {
		ProjectPageMenuFileButton: (props: {
			file: TFile;
			isCurrentPage: boolean;
			isDraft?: boolean;
			displayLabel?: string;
			onActivePageClick?: () => void;
			onPageClick: (file: TFile) => void;
		}) => {
			const draftMeta = props.isDraft ? parseDraftBasename(props.file.basename) : null;
			const label = props.displayLabel ?? (draftMeta ? draftMeta.dateStamp : props.file.basename);
			return (
				<button
					type="button"
					disabled={props.isCurrentPage && !props.onActivePageClick}
					onClick={() => {
						if (props.isCurrentPage && props.onActivePageClick) {
							props.onActivePageClick();
							return;
						}
						props.onPageClick(props.file);
					}}
				>
					{label}
				</button>
			);
		},
	};
});

jest.mock('src/logic/stores', () => ({
	getGlobals: jest.fn(() => ({ plugin: {} })),
}));

function createFile(path: string, basename: string): TFile {
	const name = path.split('/').pop() ?? path;
	const file = new TFile(name, 0, 0) as TFile & {
		path: string;
		name: string;
		basename: string;
		extension: string;
	};
	file.path = path;
	file.name = name;
	file.basename = basename;
	file.extension = 'md';
	return file;
}

describe('ProjectPageMenuGroupView', () => {
	const liveFile = createFile('Project/Page 1.md', 'Page 1');
	const draftFile = createFile(
		'Project/Page 1 - 2024.2.6 - 9.45am [DRAFT].md',
		'Page 1 - 2024.2.6 - 9.45am [DRAFT]',
	);
	const onPageClick = jest.fn();
	const onFileChange = jest.fn();

	beforeEach(() => {
		onPageClick.mockClear();
		onFileChange.mockClear();
	});

	test('hides drafts until the active live page is clicked', () => {
		render(
			<ProjectPageMenuGroupView
				group={{ stem: 'Page 1', liveFile, drafts: [draftFile] }}
				currentFile={liveFile}
				context="fab"
				onPageClick={onPageClick}
				onFileChange={onFileChange}
			/>,
		);

		expect(screen.getByText('Page 1')).toBeInTheDocument();
		expect(screen.queryByText('2024.2.6 - 9.45am')).not.toBeInTheDocument();

		fireEvent.click(screen.getByText('Page 1'));
		expect(screen.getByText('2024.2.6 - 9.45am')).toBeInTheDocument();
	});

	test('auto-expands when a new draft appears while the live page stays selected', () => {
		const { rerender } = render(
			<ProjectPageMenuGroupView
				group={{ stem: 'Page 1', liveFile, drafts: [] }}
				currentFile={liveFile}
				context="fab"
				onPageClick={onPageClick}
				onFileChange={onFileChange}
			/>,
		);

		rerender(
			<ProjectPageMenuGroupView
				group={{ stem: 'Page 1', liveFile, drafts: [draftFile] }}
				currentFile={liveFile}
				context="fab"
				onPageClick={onPageClick}
				onFileChange={onFileChange}
			/>,
		);

		expect(screen.getByText('2024.2.6 - 9.45am')).toBeInTheDocument();
	});
});
