/**
 * Validators Module
 * Validasi data input
 */

/**
 * Validasi data produk
 * @param {Object} product - Product data
 * @returns {Object} - { valid: boolean, errors: array }
 */
export function validateProduct(product) {
  const errors = [];

  if (!product.sku || product.sku.trim() === '') {
    errors.push('SKU harus diisi');
  } else if (product.sku.length < 3) {
    errors.push('SKU minimal 3 karakter');
  }

  if (!product.name || product.name.trim() === '') {
    errors.push('Nama barang harus diisi');
  } else if (product.name.length < 3) {
    errors.push('Nama barang minimal 3 karakter');
  }

  if (!product.category || product.category.trim() === '') {
    errors.push('Kategori harus diisi');
  }

  if (product.minStock !== undefined && product.minStock < 0) {
    errors.push('Min stok tidak boleh negatif');
  }

  if (product.price !== undefined && product.price < 0) {
    errors.push('Harga tidak boleh negatif');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validasi SKU
 * @param {string} sku - SKU string
 * @returns {boolean}
 */
export function validateSKU(sku) {
  return sku && sku.length >= 3 && /^[A-Z0-9\-]+$/.test(sku.toUpperCase());
}

/**
 * Validasi transaksi
 * @param {Object} transaction - Transaction data
 * @returns {Object} - { valid: boolean, errors: array }
 */
export function validateTransaction(transaction) {
  const errors = [];

  if (!transaction.type || !['IN', 'OUT'].includes(transaction.type)) {
    errors.push('Tipe transaksi tidak valid');
  }

  if (!transaction.productId || transaction.productId.trim() === '') {
    errors.push('Produk harus dipilih');
  }

  if (!transaction.quantity || transaction.quantity <= 0) {
    errors.push('Jumlah harus lebih dari 0');
  }

  if (transaction.quantity > 99999) {
    errors.push('Jumlah terlalu besar');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validasi email
 * @param {string} email - Email address
 * @returns {boolean}
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validasi nomor telepon
 * @param {string} phone - Phone number
 * @returns {boolean}
 */
export function validatePhone(phone) {
  const phoneRegex = /^(\+62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone);
}
