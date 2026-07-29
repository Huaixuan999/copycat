/**
 * UI 模板生成
 */

const Templates = {
  resultCard(item, index) {
    const isFav = Storage.isFavorited(item.copy);
    return `
      <div class="result-card" data-index="${index}">
        <div class="result-meta">
          <span class="result-platform-badge">${this._platformEmoji(item.platform)} ${this._platformName(item.platform)}</span>
          <span class="result-platform-badge" style="background:var(--purple-100);color:var(--purple-500);">${this._toneName(item.tone)}</span>
        </div>
        <div class="result-copy">${this._esc(item.copy)}</div>
        ${item.hashtags && item.hashtags.length ? `<div class="result-hashtags">${item.hashtags.map((t) => `<span class="hashtag">${this._esc(t)}</span>`).join('')}</div>` : ''}
        ${item.tip ? `<div class="result-tip">💡 ${this._esc(item.tip)}</div>` : ''}
        <div class="result-actions">
          <button class="btn-action btn-copy" data-copy="${this._escAttr(item.copy)}">📋 一键复制</button>
          <button class="btn-action btn-fav ${isFav ? 'favorited' : ''}" data-copy="${this._escAttr(item.copy)}" data-item='${this._escAttr(JSON.stringify(item))}'>${isFav ? '⭐ 已收藏' : '☆ 收藏'}</button>
          <button class="btn-action btn-regenerate" data-keywords="${this._escAttr(item.keywords || '')}" data-platform="${item.platform}" data-tone="${item.tone}" data-type="${item.contentType || 'daily'}">🔄 重新生成</button>
        </div>
      </div>
    `;
  },

  /** 引导模式文案卡片 */
  guidedCopyCard(item, index) {
    const isFav = Storage.isFavorited(item.copy);
    return `
      <div class="result-card guided-copy-card" data-index="${index}">
        <div class="result-meta">
          <span class="result-platform-badge">${item.themeEmoji || ''} ${item.themeName || ''}</span>
          <span class="result-platform-badge">${this._platformEmoji(item.platform)} ${this._platformName(item.platform)}</span>
        </div>
        <div class="result-copy">${this._esc(item.copy)}</div>
        ${item.hashtags && item.hashtags.length ? `<div class="result-hashtags">${item.hashtags.map((t) => `<span class="hashtag">${this._esc(t)}</span>`).join('')}</div>` : ''}
        ${item.tip ? `<div class="result-tip">💡 ${this._esc(item.tip)}</div>` : ''}
        <div class="result-actions">
          <button class="btn-action btn-copy" data-copy="${this._escAttr(item.copy)}">📋 一键复制</button>
          <button class="btn-action btn-fav ${isFav ? 'favorited' : ''}" data-copy="${this._escAttr(item.copy)}" data-item='${this._escAttr(JSON.stringify(item))}'>${isFav ? '⭐ 已收藏' : '☆ 收藏'}</button>
        </div>
      </div>
    `;
  },

  /** 设计框架卡片 */
  frameworkCard(framework) {
    const sections = [];
    if (framework.shooting) sections.push({ icon: '📸', label: '拍摄建议', text: framework.shooting });
    if (framework.music) sections.push({ icon: '🎵', label: '推荐BGM/氛围', text: framework.music });
    if (framework.colorTone) sections.push({ icon: '🎨', label: '色调/滤镜', text: framework.colorTone });
    if (framework.editing) sections.push({ icon: '✂️', label: '剪辑/排版', text: framework.editing });
    if (framework.structure) sections.push({ icon: '📝', label: '内容结构', text: framework.structure });

    return `
      <div class="framework-card-inner">
        <div class="framework-header">
          <span class="framework-icon">🧑‍🎨</span>
          <span>你的专属设计框架</span>
        </div>
        <div class="framework-body">
          ${sections.map((s) => `
            <div class="framework-row">
              <div class="framework-row-icon">${s.icon}</div>
              <div class="framework-row-content">
                <div class="framework-row-label">${s.label}</div>
                <div class="framework-row-text">${this._esc(s.text)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  historyList(items) {
    if (!items || !items.length) {
      return `<div class="empty-panel"><div class="empty-icon">📭</div><p>还没有生成过文案哦~</p></div>`;
    }
    return items.map((item) => `
      <div class="result-card" style="animation:none;">
        <div class="result-meta">
          <span class="result-platform-badge">${this._platformEmoji(item.platform)} ${this._platformName(item.platform)}</span>
          <span class="result-platform-badge" style="background:var(--purple-100);color:var(--purple-500);">${this._toneName(item.tone)}</span>
          <span style="font-size:0.75rem;color:var(--text-muted);">${this._formatDate(item.savedAt)}</span>
        </div>
        <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem;">关键词：${this._esc(item.keywords || '')}</div>
        <div class="result-copy" style="font-size:0.9rem;">${this._esc(item.copy)}</div>
        ${item.hashtags && item.hashtags.length ? `<div class="result-hashtags">${item.hashtags.map((t) => `<span class="hashtag">${this._esc(t)}</span>`).join('')}</div>` : ''}
        <div class="result-actions">
          <button class="btn-action btn-copy" data-copy="${this._escAttr(item.copy)}">📋 一键复制</button>
          <button class="btn-action btn-remove-history" data-id="${item.id}">🗑 删除</button>
        </div>
      </div>
    `).join('');
  },

  favoritesList(items) {
    if (!items || !items.length) {
      return `<div class="empty-panel"><div class="empty-icon">💝</div><p>收藏你喜欢的文案，方便以后查看~</p></div>`;
    }
    return items.map((item) => `
      <div class="result-card" style="animation:none;">
        <div class="result-meta">
          <span class="result-platform-badge">${this._platformEmoji(item.platform)} ${this._platformName(item.platform)}</span>
          <span class="result-platform-badge" style="background:var(--purple-100);color:var(--purple-500);">${this._toneName(item.tone)}</span>
        </div>
        <div class="result-copy" style="font-size:0.9rem;">${this._esc(item.copy)}</div>
        ${item.hashtags && item.hashtags.length ? `<div class="result-hashtags">${item.hashtags.map((t) => `<span class="hashtag">${this._esc(t)}</span>`).join('')}</div>` : ''}
        <div class="result-actions">
          <button class="btn-action btn-copy" data-copy="${this._escAttr(item.copy)}">📋 一键复制</button>
          <button class="btn-action btn-remove-fav favorited" data-copy="${this._escAttr(item.copy)}">⭐ 取消收藏</button>
        </div>
      </div>
    `).join('');
  },

  _platformEmoji(p) { const m = { xiaohongshu: '📕', weibo: '📢', douyin: '🎵', pengyouquan: '💬', instagram: '📷' }; return m[p] || '📝'; },
  _platformName(p) { const m = { xiaohongshu: '小红书', weibo: '微博', douyin: '抖音', pengyouquan: '朋友圈', instagram: 'Instagram' }; return m[p] || p; },
  _toneName(t) { const m = { cute: '活泼可爱', gentle: '温柔治愈', literary: '文艺清新', simple: '简约大气', viral: '高热度爆款' }; return m[t] || t; },
  _formatDate(iso) {
    try {
      const d = new Date(iso), n = new Date(), diff = n - d;
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
      return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch { return ''; }
  },
  _esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; },
  _escAttr(s) { return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },
};
