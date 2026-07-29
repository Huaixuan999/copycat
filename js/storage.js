/**
 * localStorage 封装
 * 管理历史记录、收藏夹、用户设置
 */

const Storage = {
  KEYS: {
    HISTORY: 'copycat_history',
    FAVORITES: 'copycat_favorites',
    SETTINGS: 'copycat_settings',
  },

  // --- History ---
  getHistory() {
    try {
      const raw = localStorage.getItem(this.KEYS.HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  addHistory(item) {
    const history = this.getHistory();
    // 去重（相同关键词+平台+类型）
    const filtered = history.filter(
      (h) =>
        !(
          h.keywords === item.keywords &&
          h.platform === item.platform &&
          h.contentType === item.contentType
        )
    );
    filtered.unshift({ ...item, id: Date.now(), savedAt: new Date().toISOString() });
    // 最多保留50条
    const trimmed = filtered.slice(0, 50);
    this._save(this.KEYS.HISTORY, trimmed);
    return trimmed;
  },

  clearHistory() {
    localStorage.removeItem(this.KEYS.HISTORY);
  },

  removeHistoryItem(id) {
    const history = this.getHistory().filter((h) => h.id !== id);
    this._save(this.KEYS.HISTORY, history);
    return history;
  },

  // --- Favorites ---
  getFavorites() {
    try {
      const raw = localStorage.getItem(this.KEYS.FAVORITES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  addFavorite(item) {
    const favorites = this.getFavorites();
    // 检查是否已收藏（相同内容）
    const exists = favorites.some((f) => f.copy === item.copy);
    if (exists) return favorites;
    favorites.unshift({
      ...item,
      favoritedAt: new Date().toISOString(),
    });
    this._save(this.KEYS.FAVORITES, favorites);
    return favorites;
  },

  removeFavorite(copyText) {
    const favorites = this.getFavorites().filter((f) => f.copy !== copyText);
    this._save(this.KEYS.FAVORITES, favorites);
    return favorites;
  },

  isFavorited(copyText) {
    return this.getFavorites().some((f) => f.copy === copyText);
  },

  clearFavorites() {
    localStorage.removeItem(this.KEYS.FAVORITES);
  },

  // --- Settings ---
  getSettings() {
    try {
      const raw = localStorage.getItem(this.KEYS.SETTINGS);
      return raw
        ? JSON.parse(raw)
        : { platform: 'xiaohongshu', tone: 'cute', contentType: 'daily' };
    } catch {
      return { platform: 'xiaohongshu', tone: 'cute', contentType: 'daily' };
    }
  },

  saveSettings(settings) {
    const current = this.getSettings();
    this._save(this.KEYS.SETTINGS, { ...current, ...settings });
  },

  // --- Internal ---
  _save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }
  },
};
