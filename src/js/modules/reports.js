/**
 * Reports Module
 * Menangani laporan dan export data
 */

import { ProductManager } from './product.js';
import { TransactionManager } from './transaction.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

export const ReportsManager = {
  /**
   * Generate ledger report
   * @param {Object} filters - Filter options
   * @returns {Object}
   */
  generateLedger(filters = {}) {
    const transactions = TransactionManager.filter(filters);
    
    return {
      title: 'Buku Mutasi Stok (Stock Ledger)',
      generatedAt: new Date(),
      transactionCount: transactions.length,
      data: transactions.map(t => ({
        date: t.date,
        time: t.time,
        type: t.type === 'IN' ? 'MASUK (+)' : 'KELUAR (-)',
        productSKU: t.productSKU,
        productName: t.productName,
        quantity: t.quantity,
        note: t.note,
        stockBefore: t.stockBefore,
        stockAfter: t.stockAfter
      }))
    };
  },

  /**
   * Generate product summary report
   * @returns {Object}
   */
  generateProductSummary() {
    const products = ProductManager.getAll();
    
    return {
      title: 'Laporan Ringkas Produk',
      generatedAt: new Date(),
      productCount: products.length,
      data: products.map(p => ({
        sku: p.sku,
        name: p.name,
        category: p.category,
        stock: p.stock,
        minStock: p.minStock,
        price: p.price,
        value: p.stock * p.price,
        status: p.stock <= p.minStock ? 'MENIPIS' : 'AMAN',
        statusColor: p.stock === 0 ? 'red' : p.stock <= p.minStock ? 'orange' : 'green'
      })),
      summary: {
        totalSKU: products.length,
        totalUnits: products.reduce((acc, p) => acc + p.stock, 0),
        totalValue: products.reduce((acc, p) => acc + (p.stock * p.price), 0),
        lowStockCount: products.filter(p => p.stock <= p.minStock).length
      }
    };
  },

  /**
   * Generate category report
   * @returns {Object}
   */
  generateCategoryReport() {
    const products = ProductManager.getAll();
    const categoryMap = {};

    products.forEach(p => {
      if (!categoryMap[p.category]) {
        categoryMap[p.category] = {
          category: p.category,
          items: [],
          totalStock: 0,
          totalValue: 0
        };
      }
      categoryMap[p.category].items.push(p);
      categoryMap[p.category].totalStock += p.stock;
      categoryMap[p.category].totalValue += p.stock * p.price;
    });

    return {
      title: 'Laporan per Kategori',
      generatedAt: new Date(),
      data: Object.values(categoryMap).map(cat => ({
        category: cat.category,
        itemCount: cat.items.length,
        totalStock: cat.totalStock,
        totalValue: cat.totalValue,
        items: cat.items
      }))
    };
  },

  /**
   * Generate low stock report
   * @returns {Object}
   */
  generateLowStockReport() {
    const lowStockItems = ProductManager.getLowStockItems();
    
    return {
      title: 'Laporan Stok Menipis',
      generatedAt: new Date(),
      alertCount: lowStockItems.length,
      data: lowStockItems.map(p => ({
        sku: p.sku,
        name: p.name,
        currentStock: p.stock,
        minStock: p.minStock,
        shortage: p.minStock - p.stock,
        category: p.category,
        price: p.price
      }))
    };
  },

  /**
   * Generate transaction summary report
   * @param {string} type - 'IN', 'OUT', atau 'ALL'
   * @returns {Object}
   */
  generateTransactionSummary(type = 'ALL') {
    const filters = type !== 'ALL' ? { type } : {};
    const transactions = TransactionManager.filter(filters);
    
    const groupByProduct = {};
    transactions.forEach(t => {
      if (!groupByProduct[t.productSKU]) {
        groupByProduct[t.productSKU] = {
          sku: t.productSKU,
          name: t.productName,
          totalQty: 0,
          count: 0,
          inQty: 0,
          outQty: 0
        };
      }
      groupByProduct[t.productSKU].totalQty += t.quantity;
      groupByProduct[t.productSKU].count += 1;
      if (t.type === 'IN') {
        groupByProduct[t.productSKU].inQty += t.quantity;
      } else {
        groupByProduct[t.productSKU].outQty += t.quantity;
      }
    });

    return {
      title: `Ringkas Transaksi (${type === 'IN' ? 'Masuk' : type === 'OUT' ? 'Keluar' : 'Semua'})`,
      generatedAt: new Date(),
      type,
      totalTransactions: transactions.length,
      data: Object.values(groupByProduct)
    };
  },

  /**
   * Export ke CSV format
   * @param {Array} data - Data yang akan di-export
   * @param {string} filename - Nama file
   * @returns {string} - CSV content
   */
  exportToCSV(data, headers) {
    if (!data || data.length === 0) {
      return '';
    }

    // Prepare header row
    const headerRow = headers.join(',');

    // Prepare data rows
    const dataRows = data.map(item => {
      return headers.map(header => {
        const value = item[header];
        // Escape quotes dan wrap dalam quotes jika mengandung koma
        const stringValue = String(value || '');
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
  },

  /**
   * Download CSV file
   * @param {string} csvContent - CSV content
   * @param {string} filename - Nama file
   */
  downloadCSV(csvContent, filename = 'report.csv') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Print report
   * @param {Object} report - Report object
   * @param {string} template - Template type
   */
  printReport(report, template = 'default') {
    const printWindow = window.open('', '', 'height=600,width=800');
    const html = this._generatePrintHTML(report, template);
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  },

  /**
   * Generate HTML untuk print
   * @private
   */
  _generatePrintHTML(report, template) {
    const title = report.title || 'Laporan';
    const generatedAt = formatDate(report.generatedAt, 'datetime');

    let tableHTML = '';
    if (report.data && Array.isArray(report.data)) {
      const headers = Object.keys(report.data[0] || {});
      tableHTML = `
        <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${report.data.map(row => `
              <tr>
                ${headers.map(h => `<td>${row[h] || '-'}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          .info { color: #666; font-size: 12px; margin-bottom: 20px; }
          table { margin-top: 20px; }
          th { text-align: left; font-weight: bold; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="info">Dihasilkan: ${generatedAt}</div>
        ${tableHTML}
        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        </script>
      </body>
      </html>
    `;
  }
};
