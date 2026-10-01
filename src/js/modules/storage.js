/**
 * Storage Module
 * Menangani semua operasi LocalStorage dengan error handling
 */

const STORAGE_KEYS = {
  PRODUCTS: 'inv_products_data',
  LOGS: 'inv_logs_data',
  SETTINGS: 'inv_settings_data'
};

export const StorageManager = {
  /**
   * Simpan data ke localStorage
   * @param {string} key - Storage key
   * @param {any} data - Data yang akan disimpan
   * @returns {boolean} - Success status
   */
  set(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`[Storage] Error setting ${key}:`, error);
      return false;
    }
  },

  /**
   * Ambil data dari localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default jika tidak ada
   * @returns {any} - Data yang tersimpan atau default value
   */
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`[Storage] Error getting ${key}:`, error);
      return defaultValue;
    }
  },

  /**
   * Hapus data dari localStorage
   * @param {string} key - Storage key
   * @returns {boolean} - Success status
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[Storage] Error removing ${key}:`, error);
      return false;
    }
  },

  /**
   * Clear semua data
   * @returns {boolean} - Success status
   */
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('[Storage] Error clearing storage:', error);
      return false;
    }
  },

  /**
   * Check apakah storage available
   * @returns {boolean}
   */
  isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
};

// Export STORAGE_KEYS untuk digunakan di modules lain
export { STORAGE_KEYS };
