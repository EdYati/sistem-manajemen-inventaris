/**
 * Transaction Manager Tests
 */

import { ProductManager } from '../src/js/modules/product.js';
import { TransactionManager } from '../src/js/modules/transaction.js';
import { StorageManager } from '../src/js/modules/storage.js';

describe('TransactionManager', () => {
  beforeEach(() => {
    localStorage.clear();
    ProductManager._cache = null;
    TransactionManager._cache = null;
    ProductManager.init();
    TransactionManager.init();
  });

  test('create should record inbound transaction and update stock', () => {
    const product = ProductManager.getAll()[0];
    const result = TransactionManager.create({
      type: 'IN',
      productId: product.id,
      quantity: 10,
      note: 'Purchase order'
    });

    expect(result.success).toBe(true);
    expect(TransactionManager.getAll()[0].type).toBe('IN');
    expect(ProductManager.getById(product.id).stock).toBe(product.stock + 10);
  });

  test('create should reject outbound transaction if stock is insufficient', () => {
    const product = ProductManager.getAll()[0];
    const result = TransactionManager.create({
      type: 'OUT',
      productId: product.id,
      quantity: product.stock + 100,
      note: 'Invalid outbound'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Stok tidak cukup');
  });

  test('create should reject invalid transaction data', () => {
    const product = ProductManager.getAll()[0];
    const result = TransactionManager.create({
      type: 'INVALID',
      productId: product.id,
      quantity: 0,
      note: 'bad data'
    });

    expect(result.success).toBe(false);
  });

  test('delete should revert stock and remove transaction', () => {
    const product = ProductManager.getAll()[0];
    const created = TransactionManager.create({
      type: 'IN',
      productId: product.id,
      quantity: 5,
      note: 'Restock'
    });

    const initialStock = ProductManager.getById(product.id).stock;
    const deleted = TransactionManager.delete(created.data.id);

    expect(deleted.success).toBe(true);
    expect(ProductManager.getById(product.id).stock).toBe(initialStock - 5);
  });

  test('filter should return transactions matching filters', () => {
    const product = ProductManager.getAll()[0];
    TransactionManager.create({
      type: 'IN',
      productId: product.id,
      quantity: 4,
      note: 'Filter test'
    });

    const filtered = TransactionManager.filter({ productId: product.id });
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(item => expect(item.productId).toBe(product.id));
  });

  test('getStatistics should return counts and totals', () => {
    const product = ProductManager.getAll()[0];
    TransactionManager.create({ type: 'IN', productId: product.id, quantity: 3, note: 'in' });
    TransactionManager.create({ type: 'OUT', productId: product.id, quantity: 2, note: 'out' });

    const stats = TransactionManager.getStatistics();
    expect(stats.totalTransactions).toBe(2);
    expect(stats.totalInbound).toBe(1);
    expect(stats.totalOutbound).toBe(1);
    expect(stats.totalInQuantity).toBe(3);
    expect(stats.totalOutQuantity).toBe(2);
  });
});
