/**
 * Product Module
 * Menangani semua operasi CRUD produk
 */

import { StorageManager, STORAGE_KEYS } from './storage.js';
import { validateProduct, validateSKU } from '../utils/validators.js';

const DEFAULT_PRODUCTS = [
  { 
    id: '1', 
    sku: 'BRG-001', 
    name: 'Keyboard Mechanical', 
    category: 'Elektronik', 
    stock: 15, 
    minStock: 5, 
    price: 450000 
  },
  { 
    id: '2', 
    sku: 'BRG-002', 
    name: 'Mouse Wireless', 
    category: 'Elektronik', 
    stock: 3, 
    minStock: 5, 
    price: 150000 
  },
  { 
    id: '3', 
    sku: 'BRG-003', 
    name: 'Kertas HVS A4', 
    category: 'Peralatan Kantor', 
    stock: 2, 
    minStock: 10, 
    price: 55000 
  }
];

export const ProductManager = {
  // Cache produk di memory
  _cache: null,

  /**
   * Initialize ProductManager
   */
  init() {
    this._cache = this._loadProducts();
    return this._cache;
  },

  /**
   * Load produk dari storage
   * @private
   */
  _loadProducts() {
    return StorageManager.get(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  },

  /**
   * Save produk ke storage
   * @private
   */
  _saveProducts() {
    return StorageManager.set(STORAGE_KEYS.PRODUCTS, this._cache);
  },

  /**
   * Dapatkan semua produk
   * @returns {Array} - Array of products
   */
  getAll() {
    return this._cache || this.init();
  },

  /**
   * Dapatkan produk berdasarkan ID
   * @param {string} id - Product ID
   * @returns {Object|null}
   */
  getById(id) {
    return this.getAll().find(p => p.id === id) || null;
  },

  /**
   * Dapatkan produk berdasarkan SKU
   * @param {string} sku - Product SKU
   * @returns {Object|null}
   */
  getBySKU(sku) {
    return this.getAll().find(p => p.sku.toLowerCase() === sku.toLowerCase()) || null;
  },

  /**
   * Tambah produk baru
   * @param {Object} productData - Data produk
   * @returns {Object} - Result dengan status dan message
   */
  create(productData) {
    // Validasi input
    const validation = validateProduct(productData);
    if (!validation.valid) {
      return { success: false, error: validation.errors };
    }

    // Check SKU duplikat
    if (this.getBySKU(productData.sku)) {
      return { success: false, error: 'SKU sudah terdaftar!' };
    }

    // Create produk baru
    const newProduct = {
      id: Date.now().toString(),
      sku: productData.sku.trim().toUpperCase(),
      name: productData.name.trim(),
      category: productData.category,
      stock: productData.stock || 0,
      minStock: productData.minStock || 5,
      price: productData.price || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this._cache.push(newProduct);
    this._saveProducts();

    return { success: true, data: newProduct };
  },

  /**
   * Update produk
   * @param {string} id - Product ID
   * @param {Object} updateData - Data yang akan diupdate
   * @returns {Object} - Result dengan status dan message
   */
  update(id, updateData) {
    const product = this.getById(id);
    if (!product) {
      return { success: false, error: 'Produk tidak ditemukan' };
    }

    // Jika SKU berubah, check duplikat
    if (updateData.sku && updateData.sku !== product.sku) {
      if (this.getBySKU(updateData.sku)) {
        return { success: false, error: 'SKU sudah terdaftar!' };
      }
    }

    // Update fields
    Object.assign(product, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    this._saveProducts();
    return { success: true, data: product };
  },

  /**
   * Delete produk
   * @param {string} id - Product ID
   * @returns {Object} - Result dengan status dan message
   */
  delete(id) {
    const index = this._cache.findIndex(p => p.id === id);
    if (index === -1) {
      return { success: false, error: 'Produk tidak ditemukan' };
    }

    const deleted = this._cache.splice(index, 1)[0];
    this._saveProducts();

    return { success: true, data: deleted };
  },

  /**
   * Update stock produk
   * @param {string} id - Product ID
   * @param {number} quantity - Jumlah perubahan (positif/negatif)
   * @returns {Object} - Result dengan status dan message
   */
  updateStock(id, quantity) {
    const product = this.getById(id);
    if (!product) {
      return { success: false, error: 'Produk tidak ditemukan' };
    }

    const newStock = product.stock + quantity;
    if (newStock < 0) {
      return { success: false, error: 'Stok tidak cukup' };
    }

    product.stock = newStock;
    product.updatedAt = new Date().toISOString();
    this._saveProducts();

    return { success: true, data: product };
  },

  /**
   * Get produk dengan stok menipis
   * @returns {Array}
   */
  getLowStockItems() {
    return this.getAll().filter(p => p.stock <= p.minStock);
  },

  /**
   * Get total stok unit
   * @returns {number}
   */
  getTotalStock() {
    return this.getAll().reduce((acc, p) => acc + p.stock, 0);
  },

  /**
   * Get statistik ringkas
   * @returns {Object}
   */
  getStatistics() {
    const all = this.getAll();
    return {
      totalSKU: all.length,
      totalUnits: this.getTotalStock(),
      lowStockCount: this.getLowStockItems().length,
      totalValue: all.reduce((acc, p) => acc + (p.stock * p.price), 0)
    };
  }
};
