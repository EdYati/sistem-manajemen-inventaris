/**
 * Product Manager Tests
 */

import { ProductManager } from '../src/js/modules/product.js';
import { StorageManager } from '../src/js/modules/storage.js';

describe('ProductManager', () => {
  beforeEach(() => {
    localStorage.clear();
    ProductManager._cache = null;
  });

  describe('init', () => {
    test('should initialize with default products if storage is empty', () => {
      const products = ProductManager.init();
      expect(products.length).toBe(3);
      expect(products[0].sku).toBe('BRG-001');
    });

    test('should load products from storage if they exist', () => {
      const customProducts = [{ id: '1', sku: 'TEST-001', name: 'Test', category: 'Test', stock: 10, minStock: 5, price: 100 }];
      StorageManager.set('inv_products_data', customProducts);
      ProductManager._cache = null;
      const products = ProductManager.init();
      expect(products.length).toBe(1);
      expect(products[0].sku).toBe('TEST-001');
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(() => ProductManager.init());

    test('getAll should return all products', () => {
      expect(ProductManager.getAll().length).toBeGreaterThan(0);
    });

    test('getById should return product by ID', () => {
      const products = ProductManager.getAll();
      const product = ProductManager.getById(products[0].id);
      expect(product).toEqual(products[0]);
    });

    test('getBySKU should return product by SKU', () => {
      const product = ProductManager.getBySKU('BRG-001');
      expect(product).toBeDefined();
      expect(product.sku).toBe('BRG-001');
    });

    test('getBySKU should be case-insensitive', () => {
      const product = ProductManager.getBySKU('brg-001');
      expect(product).toBeDefined();
      expect(product.sku).toBe('BRG-001');
    });

    test('create should add new product', () => {
      const initialCount = ProductManager.getAll().length;
      const result = ProductManager.create({
        sku: 'NEW-001',
        name: 'New Product',
        category: 'Test',
        minStock: 10,
        price: 5000
      });
      expect(result.success).toBe(true);
      expect(ProductManager.getAll().length).toBe(initialCount + 1);
    });

    test('create should reject duplicate SKU', () => {
      const result = ProductManager.create({
        sku: 'BRG-001',
        name: 'Duplicate',
        category: 'Test',
        minStock: 5,
        price: 1000
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe('SKU sudah terdaftar!');
    });

    test('update should modify product', () => {
      const products = ProductManager.getAll();
      const result = ProductManager.update(products[0].id, { name: 'Updated Name' });
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Updated Name');
    });

    test('delete should remove product', () => {
      const products = ProductManager.getAll();
      const initialCount = products.length;
      const result = ProductManager.delete(products[0].id);
      expect(result.success).toBe(true);
      expect(ProductManager.getAll().length).toBe(initialCount - 1);
    });
  });

  describe('Stock Management', () => {
    beforeEach(() => ProductManager.init());

    test('updateStock should increase stock', () => {
      const products = ProductManager.getAll();
      const initialStock = products[0].stock;
      ProductManager.updateStock(products[0].id, 10);
      const updated = ProductManager.getById(products[0].id);
      expect(updated.stock).toBe(initialStock + 10);
    });

    test('updateStock should decrease stock', () => {
      const products = ProductManager.getAll();
      const initialStock = products[0].stock;
      ProductManager.updateStock(products[0].id, -5);
      const updated = ProductManager.getById(products[0].id);
      expect(updated.stock).toBe(initialStock - 5);
    });

    test('updateStock should reject negative stock', () => {
      const products = ProductManager.getAll();
      const result = ProductManager.updateStock(products[0].id, -1000);
      expect(result.success).toBe(false);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => ProductManager.init());

    test('getLowStockItems should return products below minimum', () => {
      const lowStock = ProductManager.getLowStockItems();
      expect(lowStock.length).toBeGreaterThan(0);
      lowStock.forEach(p => expect(p.stock).toBeLessThanOrEqual(p.minStock));
    });

    test('getTotalStock should sum all stock', () => {
      const total = ProductManager.getTotalStock();
      const sum = ProductManager.getAll().reduce((acc, p) => acc + p.stock, 0);
      expect(total).toBe(sum);
    });

    test('getStatistics should return correct data', () => {
      const stats = ProductManager.getStatistics();
      expect(stats.totalSKU).toBe(ProductManager.getAll().length);
      expect(stats.totalUnits).toBe(ProductManager.getTotalStock());
      expect(stats.lowStockCount).toBe(ProductManager.getLowStockItems().length);
    });
  });
});
