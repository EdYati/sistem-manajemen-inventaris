/**
 * Formatters Module
 * Format data untuk display
 */

/**
 * Format currency ke Rupiah
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * Format currency tanpa simbol
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted number
 */
export function formatNumber(amount) {
  return new Intl.NumberFormat('id-ID').format(amount);
}

/**
 * Format tanggal
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type: 'short', 'long', 'time'
 * @returns {string}
 */
export function formatDate(date, format = 'short') {
  const d = new Date(date);
  
  const formats = {
    short: () => d.toLocaleDateString('id-ID'),
    long: () => d.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    time: () => d.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    datetime: () => d.toLocaleString('id-ID')
  };

  return (formats[format] || formats.short)();
}

/**
 * Format persentase
 * @param {number} value - Value to format
 * @param {number} total - Total value
 * @param {number} decimal - Decimal places
 * @returns {string}
 */
export function formatPercentage(value, total, decimal = 2) {
  if (total === 0) return '0%';
  return ((value / total) * 100).toFixed(decimal) + '%';
}

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Truncate string
 * @param {string} str - String to truncate
 * @param {number} length - Max length
 * @returns {string}
 */
export function truncate(str, length = 50) {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

/**
 * Capitalize string
 * @param {string} str - String to capitalize
 * @returns {string}
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Kebab case
 * @param {string} str - String to convert
 * @returns {string}
 */
export function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
