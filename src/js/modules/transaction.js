/**
 * Transaction Module
 * Menangani semua operasi transaksi stok
 */

import { StorageManager, STORAGE_KEYS } from './storage.js';
import { ProductManager } from './product.js';
import { validateTransaction } from '../utils/validators.js';

export const TransactionManager = {
  // Cache transaksi di memory
  _cache: null,

  /**
   * Tipe transaksi yang tersedia
   */
  TYPES: {
    IN: 'IN',      // Stok masuk
    OUT: 'OUT'     // Stok keluar
  },

  /**
   * Initialize TransactionManager
   */
  init() {
    this._cache = StorageManager.get(STORAGE_KEYS.LOGS, []);
    return this._cache;
  },

  /**
   * Save transaksi ke storage
   * @private
   */
  _saveTransactions() {
    return StorageManager.set(STORAGE_KEYS.LOGS, this._cache);
  },

  /**
   * Dapatkan semua transaksi
   * @returns {Array}
   */
  getAll() {
    return this._cache || this.init();
  },

  /**
   * Dapatkan transaksi berdasarkan ID
   * @param {string} id - Transaction ID
   * @returns {Object|null}
   */
  getById(id) {
    return this.getAll().find(t => t.id === id) || null;
  },

  /**
   * Buat transaksi baru (stok masuk/keluar)
   * @param {Object} transactionData - Data transaksi
   * @returns {Object} - Result dengan status dan message
   */
  create(transactionData) {
    // Validasi input
    const validation = validateTransaction(transactionData);
    if (!validation.valid) {
      return { success: false, error: validation.errors };
    }

    const { type, productId, quantity, note } = transactionData;

    // Get produk
    const product = ProductManager.getById(productId);
    if (!product) {
      return { success: false, error: 'Produk tidak ditemukan' };
    }

    // Validasi stok untuk OUT
    if (type === this.TYPES.OUT && product.stock < quantity) {
      return { 
        success: false, 
        error: `Stok tidak cukup. Tersedia: ${product.stock} unit` 
      };
    }

    // Update stok produk
    const quantityChange = type === this.TYPES.IN ? quantity : -quantity;
    const stockUpdate = ProductManager.updateStock(productId, quantityChange);
    
    if (!stockUpdate.success) {
      return stockUpdate;
    }

    // Create transaksi
    const now = new Date();
    const newTransaction = {
      id: Date.now().toString(),
      type,
      productId,
      productSKU: product.sku,
      productName: product.name,
      quantity,
      note: note || '-',
      stockBefore: product.stock - quantityChange,
      stockAfter: product.stock + quantityChange,
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('id-ID'),
      time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    // Tambah ke awal array (newest first)
    this._cache.unshift(newTransaction);
    this._saveTransactions();

    return { success: true, data: newTransaction };
  },

  /**
   * Delete transaksi (dan revert stok)
   * @param {string} id - Transaction ID
   * @returns {Object} - Result dengan status dan message
   */
  delete(id) {
    const transaction = this.getById(id);
    if (!transaction) {
      return { success: false, error: 'Transaksi tidak ditemukan' };
    }

    // Revert stok produk
    const quantityChange = transaction.type === this.TYPES.IN ? -transaction.quantity : transaction.quantity;
    const revert = ProductManager.updateStock(transaction.productId, quantityChange);

    if (!revert.success) {
      return revert;
    }

    // Hapus transaksi
    const index = this._cache.findIndex(t => t.id === id);
    this._cache.splice(index, 1);
    this._saveTransactions();

    return { success: true, data: transaction };
  },

  /**
   * Filter transaksi berdasarkan kriteria
   * @param {Object} filters - Filter criteria
   * @returns {Array}
   */
  filter(filters = {}) {
    let result = this.getAll();

    if (filters.type) {
      result = result.filter(t => t.type === filters.type);
    }

    if (filters.productId) {
      result = result.filter(t => t.productId === filters.productId);
    }

    if (filters.startDate) {
      result = result.filter(t => new Date(t.timestamp) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      result = result.filter(t => new Date(t.timestamp) <= new Date(filters.endDate));
    }

    if (filters.searchText) {
      const text = filters.searchText.toLowerCase();
      result = result.filter(t => 
        t.productName.toLowerCase().includes(text) ||
        t.productSKU.toLowerCase().includes(text) ||
        t.note.toLowerCase().includes(text)
      );
    }

    return result;
  },

  /**
   * Get transaksi untuk produk spesifik
   * @param {string} productId - Product ID
   * @returns {Array}
   */
  getByProduct(productId) {
    return this.filter({ productId });
  },

  /**
   * Get statistik transaksi
   * @returns {Object}
   */
  getStatistics() {
    const all = this.getAll();
    const inTransactions = all.filter(t => t.type === this.TYPES.IN);
    const outTransactions = all.filter(t => t.type === this.TYPES.OUT);

    return {
      totalTransactions: all.length,
      totalInbound: inTransactions.length,
      totalOutbound: outTransactions.length,
      totalInQuantity: inTransactions.reduce((acc, t) => acc + t.quantity, 0),
      totalOutQuantity: outTransactions.reduce((acc, t) => acc + t.quantity, 0)
    };
  }
};
