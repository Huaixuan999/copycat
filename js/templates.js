/**
 * UI 模板生成
 * 动态渲染文案卡片、历史列表等
 */

const Templates = {
  /**
   * 渲染单个文案卡片
   */
  resultCard(item, index) {
    const isFav = Storage.isFavorited(item.copy);

    return `
      <div class="result-card" data-index="${index}">
        <div class="result-meta">
          <span class="result-platform-badge">${this._platformEmoji(item.platform)} ${this._platformName(item.platform)}</span>
          <span class="result-platform-badge" style="background:var(--purple-100);color:var(--purple-500);">${this._toneName(item.tone)}</span>
        </div>
        <div class="result-copy">${this._escapeHtml(item.copy)}</div>
        ${
          item.hashtags && item.hashtags.length
            ? `<div class="result-hashtags">${item.hashtags
                .map((t) => `<span class="hashtag">${this._escapeHtml(t)}</span>`)
                .join('')}</div>`
            : ''
        }
        ${item.tip ? `<div class="result-tip">💡 ${this._escapeHtml(item.tip)}</div>` : ''}
        <div class="result-actions">
          <button class="btn-action btn-copy" data-copy="${this._escapeAttr(item.copy)}">
            📋 一键复制
          </button>
          <button class="btn-action btn-fav ${isFav ? 'favorited' : ''}" data-copy="${this._escapeAttr(item.copy)}" data-item='${this._escapeAttr(JSON.stringify(item))}'>
            ${isFav ? '⭐ 已收藏' : '☆ 收藏'}
          </button>
          <button class="btn-action btn-regenerate" data-keywords="${this._escapeAttr(item.keywords || '')}" data-platform="${item.platform}" data-tone="${item.tone}" data-type="${item.contentType || 'daily'}">
            🔄 重新生成
          </button>
        </div>
      </div>
    `;
  },

  /**
   * 渲染历史记录列表
   */
  historyList(items) {
    if (!items || !items.length) {
      return `
        <div class="empty-panel">
          <div class="empty-icon">📭</div>
          <p>还没有生成过文案哦~</p>
        </div>
      `;
    }

    return items
      .map(
        (item) => `
      <div class="result-card" style="animation:none;">
        <div class="result-meta">
          <span class="result-platform-badge">${this._platformEmoji(item.platform)} ${this._platformName(item.platform)}</span>
          <span class="result-platform-badge" style="background:var(--purple-100);color:var(--purple-500);">${this._toneName(item.tone)}</span>
          <span style="font-size:0.75rem;color:var(--text-muted);">${this._formatDate(item.savedAt)}</span>
        </div>
        <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem;">关键词：${this._escapeHtml(item.keywords || '')}</div>
        <div class="result-copy" style="font-size:0.9rem;">${this._escapeHtml(item.copy)}</div>
        ${
          item.hashtags && item.hashtags.length
            ? `<div class="result-hashtags">${item.hashtags
                .map((t) => `<span class="hashtag">${this._escapeHtml(t)}</span>`)
                .join('')}</div>`
            : ''
        }
        <div class="result-actions">
          <button class="btn-action btn-copy" data-copy="${this._escapeAttr(item.copy)}">📋 一键复制</button>
          <button class="btn-action btn-remove-history" data-id="${item.id}">🗑 删除</button>
        </div>
      </div>
    `
      )
      .join('');
  },

  /**
   * 渲染收藏列表
   */
  favoritesList(items) {
    if (!items || !items.length) {
      return `
        <div class="empty-panel">
          <div class="empty-icon">💝</div>
          <p>收藏你喜欢的文案，方便以后查看~</p>
        </div>
      `;
    }

    return items
      .map(
        (item) => `
      <div class="result-card" style="animation:none;">
        <div class="result-meta">
          <span class="result-platform-badge">${this._platformEmoji(item.platform)} ${this._platformName(item.platform)}</span>
          <span class="result-platform-badge" style="background:var(--purple-100);color:var(--purple-500);">${this._toneName(item.tone)}</span>
        </div>
        <div class="result-copy" style="font-size:0.9rem;">${this._escapeHtml(item.copy)}</div>
        ${
          item.hashtags && item.hashtags.length
            ? `<div class="result-hashtags">${item.hashtags
                .map((t) => `<span class="hashtag">${this._escapeHtml(t)}</span>`)
                .join('')}</div>`
            : ''
        }
        <div class="result-actions">
          <button class="btn-action btn-copy" data-copy="${this._escapeAttr(item.copy)}">📋 一键复制</button>
          <button class="btn-action btn-remove-fav favorited" data-copy="${this._escapeAttr(item.copy)}">⭐ 取消收藏</button>
        </div>
      </div>
    `
      )
      .join('');
  },

  // --- Helpers ---
  _platformEmoji(platform) {
    const map = { xiaohongshu: '📕', weibo: '📢', douyin: '🎵', pengyouquan: '💬', instagram: '📷' };
    return map[platform] || '📝';
  },

  _platformName(platform) {
    const map = {
      xiaohongshu: '小红书',
      weibo: '微博',
      douyin: '抖音',
      pengyouquan: '朋友圈',
      instagram: 'Instagram',
    };
    return map[platform] || platform;
  },

  _toneName(tone) {
    const map = { cute: '活泼可爱', gentle: '温柔治愈', literary: '文艺清新', simple: '简约大气' };
    return map[tone] || tone;
  },

  _formatDate(isoStr) {
    try {
      const d = new Date(isoStr);
      const now = new Date();
      const diff = now - d;
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
      return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return '';
    }
  },

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  _escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },
};
