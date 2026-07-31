import { describe, expect, test } from '@jest/globals';
import {
	basenameHasHiddenSuffix,
	basenameHasStateHideSuffix,
	basenameIsHiddenFromSearchGraph,
	basenameWithHiddenSuffix,
	basenameWithStateHideSuffix,
	basenameWithoutHiddenSuffix,
	basenameWithoutStateHideSuffix,
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
			expect(stripSearchGraphFilenameSuffixes('Note - 2024-01-01 [DRAFT]')).toBe('Note - 2024-01-01');
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
});
