import { describe, expect, test } from '@jest/globals';
import {
	basenameHasHiddenSuffix,
	basenameHasStateHideSuffix,
	basenameIsHiddenFromSearchGraph,
	basenameWithDraftSuffix,
	basenameWithHiddenSuffix,
	basenameWithStateHideSuffix,
	basenameWithoutHiddenSuffix,
	basenameWithoutStateHideSuffix,
	formatDesignDebtDraftDateTimeStamp,
	getDraftChronologicalSortKey,
	parseDraftBasename,
	parseSearchGraphHideSuffixes,
	rebuildBasenameWithHideFlags,
	stripSearchGraphFilenameSuffixes,
} from './filename-suffixes';

describe('filename-suffixes', () => {
	describe('parseSearchGraphHideSuffixes', () => {
		test('parses a clean stem with no flags', () => {
			expect(parseSearchGraphHideSuffixes('Project Alpha')).toEqual({
				stem: 'Project Alpha',
				flags: { hasManualHidden: false, hasStateHide: false },
			});
		});

		test('parses stacked suffixes in order stem [STATE-HIDE] [HIDDEN]', () => {
			expect(parseSearchGraphHideSuffixes('Note [STATE-HIDE] [HIDDEN]')).toEqual({
				stem: 'Note',
				flags: { hasManualHidden: true, hasStateHide: true },
			});
		});
	});

	describe('rebuildBasenameWithHideFlags', () => {
		test('rebuilds state hide before manual hide', () => {
			expect(
				rebuildBasenameWithHideFlags('Note', { hasManualHidden: true, hasStateHide: true }),
			).toBe('Note [STATE-HIDE] [HIDDEN]');
		});
	});

	describe('stripSearchGraphFilenameSuffixes', () => {
		test('strips [HIDDEN], [STATE-HIDE], and [DRAFT]', () => {
			expect(stripSearchGraphFilenameSuffixes('Note [STATE-HIDE] [HIDDEN]')).toBe('Note');
			expect(stripSearchGraphFilenameSuffixes('Note - 2024.2.6 - 9.45am [DRAFT]')).toBe(
				'Note - 2024.2.6 - 9.45am',
			);
		});
	});

	describe('suffix detection', () => {
		test('basenameHasHiddenSuffix detects only manual hide', () => {
			expect(basenameHasHiddenSuffix('Note [HIDDEN]')).toBe(true);
			expect(basenameHasHiddenSuffix('Note [STATE-HIDE]')).toBe(false);
			expect(basenameHasHiddenSuffix('Note [STATE-HIDE] [HIDDEN]')).toBe(true);
		});

		test('basenameHasStateHideSuffix detects only state hide', () => {
			expect(basenameHasStateHideSuffix('Note [STATE-HIDE]')).toBe(true);
			expect(basenameHasStateHideSuffix('Note [HIDDEN]')).toBe(false);
		});

		test('basenameIsHiddenFromSearchGraph detects either marker for UI styling', () => {
			expect(basenameIsHiddenFromSearchGraph('Note [HIDDEN]')).toBe(true);
			expect(basenameIsHiddenFromSearchGraph('Note [STATE-HIDE]')).toBe(true);
			expect(basenameIsHiddenFromSearchGraph('Note')).toBe(false);
		});
	});

	describe('independent suffix toggles', () => {
		test('basenameWithHiddenSuffix preserves existing [STATE-HIDE]', () => {
			expect(basenameWithHiddenSuffix('Note [STATE-HIDE]')).toBe('Note [STATE-HIDE] [HIDDEN]');
		});

		test('basenameWithStateHideSuffix preserves existing [HIDDEN]', () => {
			expect(basenameWithStateHideSuffix('Note [HIDDEN]')).toBe('Note [STATE-HIDE] [HIDDEN]');
		});

		test('basenameWithoutHiddenSuffix keeps [STATE-HIDE]', () => {
			expect(basenameWithoutHiddenSuffix('Note [STATE-HIDE] [HIDDEN]')).toBe('Note [STATE-HIDE]');
		});

		test('basenameWithoutStateHideSuffix keeps [HIDDEN]', () => {
			expect(basenameWithoutStateHideSuffix('Note [STATE-HIDE] [HIDDEN]')).toBe('Note [HIDDEN]');
		});
	});

	describe('draft date/time stamps', () => {
		test('formatDesignDebtDraftDateTimeStamp uses designdebt.club typography', () => {
			expect(formatDesignDebtDraftDateTimeStamp(new Date(2024, 1, 6, 9, 45))).toBe('2024.2.6 - 9.45am');
			expect(formatDesignDebtDraftDateTimeStamp(new Date(2024, 1, 6, 13, 1))).toBe('2024.2.6 - 13.01pm');
			expect(formatDesignDebtDraftDateTimeStamp(new Date(2023, 6, 13, 8, 30), 2)).toBe(
				'2023.7.13 - 8.30am (2)',
			);
		});

		test('basenameWithDraftSuffix embeds the stamp before [DRAFT]', () => {
			expect(basenameWithDraftSuffix('My Page', '2024.2.6 - 9.45am')).toBe(
				'My Page - 2024.2.6 - 9.45am [DRAFT]',
			);
		});

		test('parseDraftBasename reads designdebt stamps', () => {
			expect(parseDraftBasename('My Page - 2024.2.6 - 9.45am [DRAFT]')).toEqual({
				stem: 'My Page',
				dateStamp: '2024.2.6 - 9.45am',
			});
			expect(parseDraftBasename('My Page - 2024-01-01-1430 [DRAFT]')).toBeNull();
		});

		test('getDraftChronologicalSortKey orders newer designdebt stamps after older ones', () => {
			const earlier = getDraftChronologicalSortKey('2024.2.6 - 9.45am');
			const later = getDraftChronologicalSortKey('2024.2.6 - 11.55am');
			const sameMinuteSecond = getDraftChronologicalSortKey('2024.2.6 - 9.45am (2)');
			expect(later.localeCompare(earlier)).toBeGreaterThan(0);
			expect(sameMinuteSecond.localeCompare(earlier)).toBeGreaterThan(0);
		});
	});
});
