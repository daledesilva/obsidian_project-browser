import { describe, expect, test } from '@jest/globals';
import { findItemByProperty } from './migration-helpers';

describe('findItemByProperty', () => {
  test('finds item by property value', () => {
    const items = [
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' },
      { id: 'c', name: 'Gamma' },
    ];
    expect(findItemByProperty(items, 'id', 'b')).toEqual({ id: 'b', name: 'Beta' });
    expect(findItemByProperty(items, 'name', 'Gamma')).toEqual({ id: 'c', name: 'Gamma' });
  });

  test('returns undefined when no match', () => {
    const items = [
      { id: 'a', name: 'Alpha' },
    ];
    expect(findItemByProperty(items, 'id', 'z')).toBeUndefined();
    expect(findItemByProperty(items, 'other', 'a')).toBeUndefined();
  });

  test('returns first match when multiple match', () => {
    const items = [
      { id: '1', tag: 'x' },
      { id: '2', tag: 'x' },
    ];
    const result = findItemByProperty(items, 'tag', 'x');
    expect(result).toEqual({ id: '1', tag: 'x' });
  });

  test('returns undefined for empty array', () => {
    expect(findItemByProperty([], 'id', 'a')).toBeUndefined();
  });

  test('handles wrong property name', () => {
    const items = [{ id: 'a' }];
    expect(findItemByProperty(items, 'missing', 'a')).toBeUndefined();
  });
});
