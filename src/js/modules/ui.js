/**
 * UI Renderer Module
 * Menangani rendering data aplikasi ke elemen DOM.
 */

import { formatCurrency, formatDate, formatNumber } from '../utils/formatters.js';

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getElement(target) {
  return typeof target === 'string' ? document.querySelector(target) : target;
}

export const UIManager = {
  escapeHTML,

  setText(target, value) {
    const element = getElement(target);
    if (element) element.textContent = value ?? '';
  },

  renderSummaryCards(target, cards) {
    const container = getElement(target);
    if (!container) return;

    container.innerHTML = Object.values(cards).map(card => `
      <article class="stat-card stat-card-${escapeHTML(card.color || 'blue')}">
        <div class="stat-card-icon" aria-hidden="true">${escapeHTML(card.icon || '')}</div>
        <div>
          <p class="stat-card-label">${escapeHTML(card.label)}</p>
          <p class="stat-card-value">${card.format === 'currency' ? formatCurrency(card.value) : escapeHTML(card.value)}</p>
        </div>
      </article>
    `).join('');
  },

  renderLowStockTable(target, products) {
    const body = getElement(target);
    if (!body) return;

    if (!products.length) {
      body.innerHTML = '<tr><td colspan="5" class="empty-state">Semua stok berada dalam batas aman.</td></tr>';
      return;
    }

    body.innerHTML = products.map(product => `
      <tr>
        <td><strong>${escapeHTML(product.sku)}</strong></td>
        <td>${escapeHTML(product.name)}</td>
        <td class="text-danger"><strong>${formatNumber(product.stock)}</strong></td>
        <td>${formatNumber(product.minStock)}</td>
        <td><span class="badge badge-danger">${product.stock === 0 ? 'Habis' : 'Perlu Restock'}</span></td>
      </tr>
    `).join('');
  },

  renderProductTable(target, products, onDelete) {
    const body = getElement(target);
    if (!body) return;

    if (!products.length) {
      body.innerHTML = '<tr><td colspan="6" class="empty-state">Belum ada produk.</td></tr>';
      return;
    }

    body.innerHTML = products.map(product => `
      <tr>
        <td><strong>${escapeHTML(product.sku)}</strong></td>
        <td>${escapeHTML(product.name)}</td>
        <td>${escapeHTML(product.category)}</td>
        <td>${formatCurrency(product.price)}</td>
        <td>${formatNumber(product.minStock)}</td>
        <td>
          <button class="btn btn-danger js-delete-product" data-id="${escapeHTML(product.id)}" type="button">Hapus</button>
        </td>
      </tr>
    `).join('');

    body.querySelectorAll('.js-delete-product').forEach(button => {
      button.addEventListener('click', () => onDelete?.(button.dataset.id));
    });
  },

  renderProductOptions(target, products) {
    const select = getElement(target);
    if (!select) return;

    select.innerHTML = [
      '<option value="">-- Pilih Barang --</option>',
      ...products.map(product => `<option value="${escapeHTML(product.id)}">${escapeHTML(product.sku)} - ${escapeHTML(product.name)} (Tersisa: ${formatNumber(product.stock)})</option>`)
    ].join('');
  },

  renderLedger(target, transactions) {
    const body = getElement(target);
    if (!body) return;

    if (!transactions.length) {
      body.innerHTML = '<tr><td colspan="5" class="empty-state">Belum ada catatan mutasi.</td></tr>';
      return;
    }

    body.innerHTML = transactions.map(transaction => {
      const inbound = transaction.type === 'IN';
      return `
        <tr>
          <td>${escapeHTML(transaction.timestamp ? formatDate(transaction.timestamp, 'datetime') : `${transaction.date} ${transaction.time}`)}</td>
          <td><span class="badge ${inbound ? 'badge-in' : 'badge-out'}">${inbound ? 'MASUK (+)' : 'KELUAR (-)'}</span></td>
          <td>${escapeHTML(transaction.productSKU)} - ${escapeHTML(transaction.productName)}</td>
          <td><strong>${formatNumber(transaction.quantity)}</strong></td>
          <td>${escapeHTML(transaction.note || '-')}</td>
        </tr>
      `;
    }).join('');
  },

  showMessage(message, type = 'success', duration = 3500) {
    let container = document.querySelector('#toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    window.setTimeout(() => toast.remove(), duration);
  }
};
