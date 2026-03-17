import { describe, expect, test, beforeEach } from '@jest/globals';
import { saveLocally, fetchLocally } from './storage';
import { PLUGIN_KEY } from 'src/constants';

describe('storage', () => {
  const storage: Record<string, string> = {};

  beforeEach(() => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      storage[key] = value;
    });
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      return storage[key] ?? null;
    });
    Object.keys(storage).forEach((k) => delete storage[k]);
  });

  test('saveLocally stores value under namespaced key', () => {
    saveLocally('foo', 'bar');
    expect(localStorage.setItem).toHaveBeenCalledWith(`${PLUGIN_KEY}_foo`, 'bar');
  });

  test('fetchLocally retrieves value by namespaced key', () => {
    saveLocally('key1', 'value1');
    expect(fetchLocally('key1')).toBe('value1');
  });

  test('fetchLocally returns undefined when key not set', () => {
    expect(fetchLocally('nonexistent')).toBeNull();
  });

  test('round-trip: save then fetch', () => {
    saveLocally('round', 'trip-value');
    expect(fetchLocally('round')).toBe('trip-value');
  });
});
