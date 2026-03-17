import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { isExtensionVisible } from './file-type-filter';

jest.mock('./stores', () => ({
  getGlobals: jest.fn(),
}));

const { getGlobals } = jest.requireMock('./stores') as {
  getGlobals: jest.Mock;
};

describe('isExtensionVisible', () => {
  beforeEach(() => {
    getGlobals.mockReturnValue({
      plugin: {
        settings: {
          fileTypes: {
            projectBrowser: {
              visible: ['md', 'canvas', 'pdf'],
              hidden: ['pbs'],
            },
            pageMenu: {
              visible: ['md', 'canvas', 'base'],
              hidden: ['pbs'],
            },
          },
        },
      },
    });
  });

  test('returns true when extension is in surface visible list', () => {
    expect(isExtensionVisible('md', 'projectBrowser')).toBe(true);
    expect(isExtensionVisible('canvas', 'projectBrowser')).toBe(true);
    expect(isExtensionVisible('PDF', 'projectBrowser')).toBe(true);
    expect(isExtensionVisible('md', 'pageMenu')).toBe(true);
    expect(isExtensionVisible('base', 'pageMenu')).toBe(true);
  });

  test('returns false when extension is not in surface visible list', () => {
    expect(isExtensionVisible('pdf', 'pageMenu')).toBe(false);
    expect(isExtensionVisible('unknown', 'projectBrowser')).toBe(false);
  });

  test('normalizes extension to lowercase for comparison', () => {
    expect(isExtensionVisible('MD', 'projectBrowser')).toBe(true);
    expect(isExtensionVisible('Canvas', 'pageMenu')).toBe(true);
  });

  test('returns false for empty or missing extension', () => {
    expect(isExtensionVisible('', 'projectBrowser')).toBe(false);
    expect(isExtensionVisible('', 'pageMenu')).toBe(false);
    expect(isExtensionVisible(null as unknown as string, 'projectBrowser')).toBe(false);
    expect(isExtensionVisible(undefined as unknown as string, 'projectBrowser')).toBe(false);
  });

  test('returns false when surface has no visible list', () => {
    getGlobals.mockReturnValue({
      plugin: {
        settings: {
          fileTypes: {
            projectBrowser: {},
            pageMenu: { visible: ['md'] },
          },
        },
      },
    });
    expect(isExtensionVisible('md', 'projectBrowser')).toBe(false);
    expect(isExtensionVisible('md', 'pageMenu')).toBe(true);
  });
});
