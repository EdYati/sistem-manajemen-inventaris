/**
 * Storage Module Tests
 */

import { StorageManager, STORAGE_KEYS } from '../src/js/modules/storage.js';

describe('StorageManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('isAvailable should return true when localStorage is accessible', () => {
    expect(StorageManager.isAvailable()).toBe(true);
  });

  test('set should store data in localStorage', () => {
    const testData = { name: 'Test Product', id: 1 };
    StorageManager.set('test_key', testData);
    const stored = JSON.parse(localStorage.getItem('test_key'));
    expect(stored).toEqual(testData);
  });

  test('get should retrieve data from localStorage', () => {
    const testData = { name: 'Test', value: 100 };
    localStorage.setItem('test_key', JSON.stringify(testData));
    const result = StorageManager.get('test_key');
    expect(result).toEqual(testData);
  });

  test('get should return default value if key does not exist', () => {
    const defaultValue = { empty: true };
    const result = StorageManager.get('nonexistent_key', defaultValue);
    expect(result).toEqual(defaultValue);
  });

  test('remove should delete data from localStorage', () => {
    localStorage.setItem('test_key', JSON.stringify({ data: 'test' }));
    StorageManager.remove('test_key');
    expect(localStorage.getItem('test_key')).toBeNull();
  });

  test('clear should remove all localStorage data', () => {
    localStorage.setItem('key1', 'value1');
    localStorage.setItem('key2', 'value2');
    StorageManager.clear();
    expect(localStorage.length).toBe(0);
  });
});
