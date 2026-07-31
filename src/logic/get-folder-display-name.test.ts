import { describe, expect, test } from '@jest/globals';
import { getFolderDisplayName } from './get-folder-display-name';

describe('getFolderDisplayName', () => {
	test('strips manual and state hide suffixes from folder names', () => {
		const folder = { name: 'Project Alpha [STATE-HIDE] [HIDDEN]' } as never;
		expect(getFolderDisplayName(folder)).toBe('Project Alpha');
	});
});
