// ==================== src/ui/LocalizationManager.js ====================
class LocalizationManager {
  constructor() {
    this.currentLanguage = 'en';
    this.strings = new Map();
  }

  /** @returns {LocalizationManager} */
  static getInstance() {}

  /** @param {string} key @returns {string} */
  get(key) {}

  /** @param {string} lang */
  loadLanguage(lang) {}
}

export default LocalizationManager;