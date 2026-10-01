/**
 * Dashboard Module
 * Menangani statistik dan monitoring dashboard
 */

import { ProductManager } from './product.js';
import { TransactionManager } from './transaction.js';

export const DashboardManager = {
  /**
   * Get semua statistik dashboard
   * @returns {Object}
   */
  getStatistics() {
    const productStats = ProductManager.getStatistics();
    const transactionStats = TransactionManager.getStatistics();
    const lowStockItems = ProductManager.getLowStockItems();

    return {
      products: productStats,
      transactions: transactionStats,
      lowStock: {
        count: lowStockItems.length,
        items: lowStockItems
      },
      summary: {
        totalValue: productStats.totalValue,
        stockHealth: this._calculateStockHealth()
      }
    };
  },

  /**
   * Get statistik per kategori
   * @returns {Array}
   */
  getStatsByCategory() {
    const products = ProductManager.getAll();
    const categories = {};

    products.forEach(product => {
      if (!categories[product.category]) {
        categories[product.category] = {
          category: product.category,
          count: 0,
          totalStock: 0,
          totalValue: 0,
          lowStockCount: 0
        };
      }

      categories[product.category].count += 1;
      categories[product.category].totalStock += product.stock;
      categories[product.category].totalValue += product.stock * product.price;

      if (product.stock <= product.minStock) {
        categories[product.category].lowStockCount += 1;
      }
    });

    return Object.values(categories);
  },

  /**
   * Calculate kesehatan stok (persentase)
   * @private
   * @returns {number}
   */
  _calculateStockHealth() {
    const all = ProductManager.getAll();
    if (all.length === 0) return 100;

    const healthyItems = all.filter(p => p.stock > p.minStock).length;
    return Math.round((healthyItems / all.length) * 100);
  },

  /**
   * Get alert items (berbagai jenis alert)
   * @returns {Object}
   */
  getAlerts() {
    const lowStockItems = ProductManager.getLowStockItems();
    const emptyStockItems = ProductManager.getAll().filter(p => p.stock === 0);
    const expensiveItems = ProductManager.getAll()
      .sort((a, b) => (b.stock * b.price) - (a.stock * a.price))
      .slice(0, 5);

    return {
      lowStock: {
        count: lowStockItems.length,
        items: lowStockItems
      },
      empty: {
        count: emptyStockItems.length,
        items: emptyStockItems
      },
      expensive: {
        count: expensiveItems.length,
        items: expensiveItems
      }
    };
  },

  /**
   * Get trend statistik (untuk chart)
   * @param {number} days - Jumlah hari (default 7)
   * @returns {Array}
   */
  getTrendData(days = 7) {
    const transactions = TransactionManager.getAll();
    const trend = {};

    // Initialize trend untuk setiap hari
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('id-ID');
      trend[dateStr] = { date: dateStr, in: 0, out: 0 };
    }

    // Accumulate data
    transactions.forEach(t => {
      if (trend[t.date]) {
        if (t.type === 'IN') {
          trend[t.date].in += t.quantity;
        } else {
          trend[t.date].out += t.quantity;
        }
      }
    });

    return Object.values(trend);
  },

  /**
   * Get summary cards data
   * @returns {Object}
   */
  getSummaryCards() {
    const stats = this.getStatistics();
    const alerts = this.getAlerts();

    return {
      totalSKU: {
        label: 'Total Macam Produk',
        value: stats.products.totalSKU,
        icon: '📦',
        color: 'blue'
      },
      totalUnits: {
        label: 'Total Fisik Unit Stok',
        value: stats.products.totalUnits,
        icon: '📊',
        color: 'green'
      },
      lowStock: {
        label: 'Item Stok Menipis',
        value: alerts.lowStock.count,
        icon: '⚠️',
        color: 'red'
      },
      emptyStock: {
        label: 'Item Habis',
        value: alerts.empty.count,
        icon: '❌',
        color: 'darkred'
      },
      totalValue: {
        label: 'Total Nilai Stok',
        value: stats.summary.totalValue,
        icon: '💰',
        color: 'orange',
        format: 'currency'
      },
      stockHealth: {
        label: 'Kesehatan Stok',
        value: stats.summary.stockHealth + '%',
        icon: '💚',
        color: 'green'
      }
    };
  }
};
