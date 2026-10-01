/**
 * Validators Tests
 */

import {
  validateProduct,
  validateSKU,
  validateTransaction,
  validateEmail,
  validatePhone
} from '../src/js/utils/validators.js';

describe('Validators', () => {
  test('validateProduct should accept valid product data', () => {
    const result = validateProduct({
      sku: 'BRG-001',
      name: 'Keyboard',
      category: 'Elektronik',
      minStock: 5,
      price: 100000
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test('validateProduct should reject missing SKU', () => {
    const result = validateProduct({
      name: 'Keyboard',
      category: 'Elektronik',
      minStock: 5,
      price: 100000
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('SKU harus diisi');
  });

  test('validateProduct should reject negative price', () => {
    const result = validateProduct({
      sku: 'BRG-001',
      name: 'Keyboard',
      category: 'Elektronik',
      minStock: 5,
      price: -1000
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Harga tidak boleh negatif');
  });

  test('validateSKU should accept valid uppercase format', () => {
    expect(validateSKU('BRG-001')).toBe(true);
    expect(validateSKU('brg-001')).toBe(true);
  });

  test('validateSKU should reject invalid format', () => {
    expect(validateSKU('ab')).toBe(false);
    expect(validateSKU('!!!')).toBe(false);
  });

  test('validateTransaction should accept valid transaction', () => {
    const result = validateTransaction({
      type: 'IN',
      productId: '123',
      quantity: 5,
      note: 'PO-001'
    });

    expect(result.valid).toBe(true);
  });

  test('validateTransaction should reject quantity zero', () => {
    const result = validateTransaction({
      type: 'OUT',
      productId: '123',
      quantity: 0,
      note: 'test'
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Jumlah harus lebih dari 0');
  });

  test('validateEmail should accept valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  test('validateEmail should reject invalid email', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });

  test('validatePhone should accept Indonesian format', () => {
    expect(validatePhone('081234567890')).toBe(true);
    expect(validatePhone('+6281234567890')).toBe(true);
  });

  test('validatePhone should reject invalid format', () => {
    expect(validatePhone('123')).toBe(false);
  });
});
