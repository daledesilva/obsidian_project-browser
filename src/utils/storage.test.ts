import { describe, expect, test, beforeEach } from '@jest/globals';
import { saveLocally, fetchLocally } from './storage';
import { PLUGIN_KEY } from 'src/constants';

jest.mock('src/logic/stores', () => ({
  getGlobals: jest.fn(),
}));

const { getGlobals } = jest.requireMock('src/logic/stores') as {
  getGlobals: jest.Mock;
};

describe('storage', () => {
  const storage: Record<string, unknown> = {};
  const saveLocalStorageMock = jest.fn((key: string, data: unknown) => {
    storage[key] = data;
  });
  const loadLocalStorageMock = jest.fn((key: string) => storage[key] ?? null);

  beforeEach(() => {
    Object.keys(storage).forEach((k) => delete storage[k]);
    saveLocalStorageMock.mockClear();
    loadLocalStorageMock.mockClear();
    getGlobals.mockReturnValue({
      plugin: {
        app: {
          saveLocalStorage: saveLocalStorageMock,
          loadLocalStorage: loadLocalStorageMock,
        },
      },
    });
  });

  test('saveLocally stores value under namespaced key', () => {
    saveLocally('foo', 'bar');
    expect(saveLocalStorageMock).toHaveBeenCalledWith(`${PLUGIN_KEY}_foo`, 'bar');
  });

  test('fetchLocally retrieves value by namespaced key', () => {
    saveLocally('key1', 'value1');
    expect(fetchLocally('key1')).toBe('value1');
  });

  test('fetchLocally returns null when key not set', () => {
    expect(fetchLocally('nonexistent')).toBeNull();
  });

  test('round-trip: save then fetch', () => {
    saveLocally('round', 'trip-value');
    expect(fetchLocally('round')).toBe('trip-value');
  });
});
