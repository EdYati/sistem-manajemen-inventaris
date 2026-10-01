import { ProductManager } from './modules/product.js';
import { TransactionManager } from './modules/transaction.js';
import { DashboardManager } from './modules/dashboard.js';
import { ReportsManager } from './modules/reports.js';
import { UIManager } from './modules/ui.js';

const $ = selector => document.querySelector(selector);

function refresh() {
  UIManager.renderSummaryCards('#summary-cards', DashboardManager.getSummaryCards());
  UIManager.renderLowStockTable('#low-stock-table-body', ProductManager.getLowStockItems());
  UIManager.renderProductTable('#master-table-body', ProductManager.getAll(), handleDeleteProduct);
  UIManager.renderProductOptions('#op-product', ProductManager.getAll());
  UIManager.renderLedger('#ledger-table-body', TransactionManager.getAll());
}

function handleDeleteProduct(id) {
  const product = ProductManager.getById(id);
  if (!product || !window.confirm(`Hapus produk ${product.name}?`)) return;
  const result = ProductManager.delete(id);
  if (result.success) {
    UIManager.showMessage('Produk berhasil dihapus.');
    refresh();
  } else UIManager.showMessage(result.error, 'error');
}

function setupNavigation() {
  document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(item => item.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      $(`#tab-${button.dataset.tab}`)?.classList.add('active');
      $('#page-title').textContent = button.textContent.replace(/^\S+\s/, '');
    });
  });
}

function setupForms() {
  $('#form-product').addEventListener('submit', event => {
    event.preventDefault();
    const result = ProductManager.create({
      sku: $('#prod-sku').value.trim(), name: $('#prod-name').value.trim(), category: $('#prod-category').value,
      minStock: Number($('#prod-min-stock').value), price: Number($('#prod-price').value)
    });
    if (!result.success) return UIManager.showMessage(Array.isArray(result.error) ? result.error.join('. ') : result.error, 'error');
    event.target.reset();
    UIManager.showMessage('Produk berhasil disimpan.');
    refresh();
  });

  $('#form-operation').addEventListener('submit', event => {
    event.preventDefault();
    const result = TransactionManager.create({ type: $('#op-type').value, productId: $('#op-product').value, quantity: Number($('#op-qty').value), note: $('#op-note').value.trim() });
    if (!result.success) return UIManager.showMessage(Array.isArray(result.error) ? result.error.join('. ') : result.error, 'error');
    event.target.reset();
    UIManager.showMessage('Mutasi stok berhasil diproses.');
    refresh();
  });

  $('#export-csv').addEventListener('click', () => {
    const report = ReportsManager.generateLedger();
    const data = report.data.map(row => ({ tanggal: `${row.date} ${row.time}`, tipe: row.type, sku: row.productSKU, produk: row.productName, jumlah: row.quantity, keterangan: row.note }));
    if (!data.length) return UIManager.showMessage('Belum ada data untuk diekspor.', 'error');
    const csv = ReportsManager.exportToCSV(data, Object.keys(data[0]));
    ReportsManager.downloadCSV(`\ufeff${csv}`, `mutasi-stok-${new Date().toISOString().slice(0, 10)}.csv`);
  });
}

function init() {
  ProductManager.init();
  TransactionManager.init();
  setupNavigation();
  setupForms();
  refresh();
}

document.addEventListener('DOMContentLoaded', init);
