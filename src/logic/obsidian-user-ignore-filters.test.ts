import { describe, expect, test, jest } from '@jest/globals';
import {
	HIDDEN_USER_IGNORE_FILTER,
	LEGACY_HIDDEN_USER_IGNORE_FILTERS,
	STATE_HIDE_USER_IGNORE_FILTER,
} from './filename-suffixes';
import {
	ensureHiddenMarkdownIgnoreFilter,
	ensureUserIgnoreFilter,
	getUserIgnoreFilters,
	removeUserIgnoreFilter,
} from './obsidian-user-ignore-filters';

function createMockApp(initialFilters: string[] = []) {
	let filters = [...initialFilters];
	const trigger = jest.fn();

	const app = {
		vault: {
			getConfig: jest.fn((key: string) => (key === 'userIgnoreFilters' ? filters : undefined)),
			setConfig: jest.fn((key: string, value: unknown) => {
				if (key === 'userIgnoreFilters' && Array.isArray(value)) {
					filters = value.filter((entry): entry is string => typeof entry === 'string');
				}
			}),
			trigger,
		},
	};

	return { app: app as never, getFilters: () => filters, trigger };
}

describe('obsidian-user-ignore-filters', () => {
	test('getUserIgnoreFilters returns an empty list when config API is missing', () => {
		expect(getUserIgnoreFilters({ vault: {} } as never)).toEqual([]);
	});

	test('ensureUserIgnoreFilter appends without duplicating exact matches', () => {
		const { app, getFilters, trigger } = createMockApp(['/\\[CUSTOM\\]/']);

		expect(ensureUserIgnoreFilter(app, HIDDEN_USER_IGNORE_FILTER)).toBe(true);
		expect(getFilters()).toEqual(['/\\[CUSTOM\\]/', HIDDEN_USER_IGNORE_FILTER]);
		expect(ensureUserIgnoreFilter(app, HIDDEN_USER_IGNORE_FILTER)).toBe(false);
		expect(trigger).toHaveBeenCalledTimes(1);
	});

	test('removeUserIgnoreFilter removes only exact matches', () => {
		const { app, getFilters } = createMockApp([HIDDEN_USER_IGNORE_FILTER, '/\\[CUSTOM\\]/']);

		expect(removeUserIgnoreFilter(app, HIDDEN_USER_IGNORE_FILTER)).toBe(true);
		expect(getFilters()).toEqual(['/\\[CUSTOM\\]/']);
	});

	test('ensureHiddenMarkdownIgnoreFilter migrates legacy filters and ensures both hide patterns', () => {
		const { app, getFilters } = createMockApp([
			LEGACY_HIDDEN_USER_IGNORE_FILTERS[0],
			LEGACY_HIDDEN_USER_IGNORE_FILTERS[1],
			'/\\[CUSTOM\\]/',
		]);

		ensureHiddenMarkdownIgnoreFilter(app);

		expect(getFilters()).toEqual([
			'/\\[CUSTOM\\]/',
			HIDDEN_USER_IGNORE_FILTER,
			STATE_HIDE_USER_IGNORE_FILTER,
		]);
	});
});
