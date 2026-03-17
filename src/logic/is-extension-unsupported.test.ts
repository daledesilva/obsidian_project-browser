import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { isExtensionUnsupportedByObsidian } from './is-extension-unsupported';

jest.mock('./stores', () => ({
  getGlobals: jest.fn(),
}));

const { getGlobals } = jest.requireMock('./stores') as { getGlobals: jest.Mock };

describe('isExtensionUnsupportedByObsidian', () => {
  beforeEach(() => {
    getGlobals.mockReturnValue({
      plugin: {
        app: {
          viewRegistry: {
            typeByExtension: {
              md: {},
              canvas: {},
              base: {},
              pdf: {},
            },
          },
        },
      },
    });
  });

  test('returns false when extension is in view registry', () => {
    expect(isExtensionUnsupportedByObsidian('md')).toBe(false);
    expect(isExtensionUnsupportedByObsidian('canvas')).toBe(false);
    expect(isExtensionUnsupportedByObsidian('PDF')).toBe(false);
  });

  test('returns true when extension is not in view registry', () => {
    expect(isExtensionUnsupportedByObsidian('xyz')).toBe(true);
    expect(isExtensionUnsupportedByObsidian('unknown')).toBe(true);
  });

  test('normalizes extension to lowercase', () => {
    expect(isExtensionUnsupportedByObsidian('MD')).toBe(false);
    expect(isExtensionUnsupportedByObsidian('PDF')).toBe(false);
  });

  test('returns false for empty or missing extension', () => {
    expect(isExtensionUnsupportedByObsidian('')).toBe(false);
    expect(isExtensionUnsupportedByObsidian(null as unknown as string)).toBe(false);
    expect(isExtensionUnsupportedByObsidian(undefined as unknown as string)).toBe(false);
  });

  test('uses typeByExt when typeByExtension is missing', () => {
    getGlobals.mockReturnValue({
      plugin: {
        app: {
          viewRegistry: {
            typeByExt: { txt: {} },
          },
        },
      },
    });
    expect(isExtensionUnsupportedByObsidian('txt')).toBe(false);
    expect(isExtensionUnsupportedByObsidian('md')).toBe(true);
  });

  test('uses fallback when viewRegistry is missing', () => {
    getGlobals.mockReturnValue({
      plugin: {
        app: {},
      },
    });
    expect(isExtensionUnsupportedByObsidian('md')).toBe(false);
    expect(isExtensionUnsupportedByObsidian('canvas')).toBe(false);
    expect(isExtensionUnsupportedByObsidian('base')).toBe(false);
    expect(isExtensionUnsupportedByObsidian('other')).toBe(true);
  });
});
