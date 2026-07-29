/**
 * 文案喵 - 主应用逻辑
 * 事件绑定、状态管理、页面切换
 */

(function () {
  'use strict';

  // ============ 应用状态 ============
  const state = {
    platform: 'xiaohongshu',
    tone: 'cute',
    contentType: 'daily',
    isGenerating: false,
    currentResults: [],
  };

  // ============ DOM 引用 ============
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const keywordInput = $('#keywordInput');
  const btnGenerate = $('#btnGenerate');
  const loadingSection = $('#loadingSection');
  const loadingText = $('#loadingText');
  const resultsSection = $('#resultsSection');
  const resultsList = $('#resultsList');
  const emptyState = $('#emptyState');
  const toast = $('#toast');
  const favBadge = $('#favBadge');
  const historyContent = $('#historyContent');
  const favoritesContent = $('#favoritesContent');

  // ============ 初始化 ============
  function init() {
    CatMascot.init();
    CatMascot.bindClick('heroCat');
    CatMascot.bindClick('headerCat');

    // 加载用户设置
    const settings = Storage.getSettings();
    state.platform = settings.platform || 'xiaohongshu';
    state.tone = settings.tone || 'cute';
    state.contentType = settings.contentType || 'daily';

    // 恢复 UI 选中状态
    restoreChipStates();
    updateFavBadge();
    renderHistory();
    renderFavorites();
    createDecorations();
    bindEvents();
  }

  function restoreChipStates() {
    // Platform
    $$('#platformChips .chip').forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.value === state.platform);
    });
    // Tone
    $$('#toneChips .chip').forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.value === state.tone);
    });
    // Content type
    $$('#typeChips .chip').forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.value === state.contentType);
    });
  }

  // ============ 事件绑定 ============
  function bindEvents() {
    // 搜索框回车
    keywordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleGenerate();
    });

    // 生成按钮
    btnGenerate.addEventListener('click', handleGenerate);

    // 平台选择
    $('#platformChips').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      $$('#platformChips .chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      state.platform = chip.dataset.value;
      Storage.saveSettings({ platform: state.platform });
    });

    // 风格选择
    $('#toneChips').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      $$('#toneChips .chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      state.tone = chip.dataset.value;
      Storage.saveSettings({ tone: state.tone });
    });

    // 类型选择
    $('#typeChips').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      $$('#typeChips .chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      state.contentType = chip.dataset.value;
      Storage.saveSettings({ contentType: state.contentType });
    });

    // 示例标签点击
    $$('.example-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        keywordInput.value = chip.textContent.trim();
        handleGenerate();
      });
    });

    // 导航切换
    $$('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const panel = btn.dataset.panel;
        switchPanel(panel);
      });
    });

    // Logo 点击回到生成页
    $('#logo').addEventListener('click', () => {
      switchPanel('generator');
    });

    // 结果区域事件委托
    resultsList.addEventListener('click', handleResultAction);

    // 历史面板事件委托
    historyContent.addEventListener('click', handleHistoryAction);

    // 收藏面板事件委托
    favoritesContent.addEventListener('click', handleFavoritesAction);

    // 清空结果
    $('#btnClearResults').addEventListener('click', () => {
      resultsSection.style.display = 'none';
      emptyState.style.display = '';
      state.currentResults = [];
    });

    // 清空历史
    $('#btnClearHistory').addEventListener('click', () => {
      if (confirm('确定要清空所有历史记录吗？')) {
        Storage.clearHistory();
        renderHistory();
        showToast('🗑️', '历史记录已清空');
      }
    });

    // 清空收藏
    $('#btnClearFavorites').addEventListener('click', () => {
      if (confirm('确定要清空所有收藏吗？')) {
        Storage.clearFavorites();
        renderFavorites();
        updateFavBadge();
        showToast('🗑️', '收藏已清空');
      }
    });
  }

  // ============ 面板切换 ============
  function switchPanel(panel) {
    // 更新导航按钮
    $$('.nav-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.panel === panel);
    });

    // 更新面板显示
    $$('.panel').forEach((p) => {
      p.classList.toggle('active', p.id === `panel-${panel}`);
    });

    // 刷新面板内容
    if (panel === 'history') renderHistory();
    if (panel === 'favorites') renderFavorites();
  }

  // ============ 文案生成 ============
  async function handleGenerate() {
    const keywords = keywordInput.value.trim();
    if (!keywords) {
      keywordInput.focus();
      keywordInput.style.borderColor = 'var(--pink-500)';
      setTimeout(() => {
        keywordInput.style.borderColor = '';
      }, 1500);
      showToast('🐱', '请输入关键词喵~');
      return;
    }

    if (state.isGenerating) return;

    // 开始生成
    state.isGenerating = true;
    btnGenerate.disabled = true;
    btnGenerate.querySelector('.btn-generate-text').textContent = '生成中...';
    emptyState.style.display = 'none';
    loadingSection.style.display = '';
    resultsSection.style.display = 'none';
    CatMascot.setState('thinking');

    // 更新加载文案
    const loadingMessages = [
      '小喵正在努力思考中...',
      '正在打磨每一个字...',
      '让文案更自然一点...',
      '加点可爱的元素...',
      '马上就写好啦~',
    ];
    let msgIndex = 0;
    const msgTimer = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      loadingText.textContent = loadingMessages[msgIndex];
    }, 1500);

    try {
      const result = await API.generate({
        keywords,
        platform: state.platform,
        tone: state.tone,
        contentType: state.contentType,
      });

      clearInterval(msgTimer);

      // 添加到结果
      state.currentResults.unshift(result);

      // 保存到历史
      Storage.addHistory(result);

      // 渲染结果
      renderResults();

      // 显示结果区
      loadingSection.style.display = 'none';
      resultsSection.style.display = '';
      CatMascot.setState('happy');
      showToast('✨', '文案生成好啦~');

      // 3秒后恢复猫咪状态
      setTimeout(() => CatMascot.setState('idle'), 3000);
    } catch (error) {
      clearInterval(msgTimer);
      loadingSection.style.display = 'none';
      emptyState.style.display = '';
      CatMascot.setState('idle');
      showToast('😿', error.message || '生成失败，请稍后再试~');
      console.error('Generate error:', error);
    } finally {
      state.isGenerating = false;
      btnGenerate.disabled = false;
      btnGenerate.querySelector('.btn-generate-text').textContent = '生成文案';
    }
  }

  // ============ 渲染结果 ============
  function renderResults() {
    if (!state.currentResults.length) {
      resultsSection.style.display = 'none';
      emptyState.style.display = '';
      return;
    }

    resultsList.innerHTML = state.currentResults
      .map((item, i) => Templates.resultCard(item, i))
      .join('');
  }

  // ============ 结果区事件处理 ============
  function handleResultAction(e) {
    const target = e.target.closest('button');
    if (!target) return;

    // 复制
    if (target.classList.contains('btn-copy')) {
      const text = target.dataset.copy;
      copyToClipboard(text, target);
    }

    // 收藏 / 取消收藏
    if (target.classList.contains('btn-fav')) {
      const copyText = target.dataset.copy;
      let item;
      try {
        item = JSON.parse(target.dataset.item);
      } catch {
        item = { copy: copyText, platform: state.platform, tone: state.tone, contentType: state.contentType };
      }

      if (Storage.isFavorited(copyText)) {
        Storage.removeFavorite(copyText);
        target.classList.remove('favorited');
        target.innerHTML = '☆ 收藏';
        showToast('💔', '已取消收藏');
      } else {
        Storage.addFavorite(item);
        target.classList.add('favorited');
        target.innerHTML = '⭐ 已收藏';
        showToast('⭐', '已添加到收藏');
      }
      updateFavBadge();
    }

    // 重新生成
    if (target.classList.contains('btn-regenerate')) {
      keywordInput.value = target.dataset.keywords;
      state.platform = target.dataset.platform;
      state.tone = target.dataset.tone;
      state.contentType = target.dataset.type;
      restoreChipStates();
      handleGenerate();
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ============ 历史面板事件 ============
  function handleHistoryAction(e) {
    const target = e.target.closest('button');
    if (!target) return;

    if (target.classList.contains('btn-copy')) {
      copyToClipboard(target.dataset.copy, target);
    }

    if (target.classList.contains('btn-remove-history')) {
      const id = parseInt(target.dataset.id);
      Storage.removeHistoryItem(id);
      renderHistory();
      showToast('🗑️', '已删除');
    }
  }

  // ============ 收藏面板事件 ============
  function handleFavoritesAction(e) {
    const target = e.target.closest('button');
    if (!target) return;

    if (target.classList.contains('btn-copy')) {
      copyToClipboard(target.dataset.copy, target);
    }

    if (target.classList.contains('btn-remove-fav')) {
      Storage.removeFavorite(target.dataset.copy);
      renderFavorites();
      updateFavBadge();
      showToast('💔', '已取消收藏');
    }
  }

  // ============ 渲染历史和收藏 ============
  function renderHistory() {
    const history = Storage.getHistory();
    historyContent.innerHTML = Templates.historyList(history);
  }

  function renderFavorites() {
    const favorites = Storage.getFavorites();
    favoritesContent.innerHTML = Templates.favoritesList(favorites);
  }

  function updateFavBadge() {
    const count = Storage.getFavorites().length;
    if (count > 0) {
      favBadge.style.display = 'flex';
      favBadge.textContent = count;
    } else {
      favBadge.style.display = 'none';
    }
  }

  // ============ 复制功能 ============
  async function copyToClipboard(text, button) {
    try {
      await navigator.clipboard.writeText(text);

      if (button) {
        const originalHTML = button.innerHTML;
        button.classList.add('copied');
        button.innerHTML = '✅ 已复制';
        setTimeout(() => {
          button.classList.remove('copied');
          button.innerHTML = originalHTML;
        }, 2000);
      }

      showToast('📋', '已复制到剪贴板~');
    } catch {
      // Fallback: 选中文本
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('📋', '已复制到剪贴板~');
    }
  }

  // ============ Toast 提示 ============
  let toastTimer;

  function showToast(icon, message) {
    clearTimeout(toastTimer);
    toast.querySelector('.toast-icon').textContent = icon;
    toast.querySelector('.toast-text').textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  // ============ 浮动装饰 ============
  function createDecorations() {
    const container = $('#decorations');
    const emojis = ['🌸', '🐾', '💕', '⭐', '🎀', '✨', '🍰', '💖', '🌺', '🦋', '☁️', '🌈'];
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < 18; i++) {
      const el = document.createElement('span');
      el.className = 'deco-item';
      el.textContent = emojis[i % emojis.length];
      el.style.setProperty('--size', `${0.8 + Math.random() * 1.8}rem`);
      el.style.setProperty('--dur', `${8 + Math.random() * 12}s`);
      el.style.setProperty('--delay', `${Math.random() * 10}s`);
      el.style.left = `${Math.random() * 95}%`;
      el.style.top = `${Math.random() * 90}%`;
      el.style.opacity = `${0.12 + Math.random() * 0.18}`;
      fragment.appendChild(el);
    }

    container.appendChild(fragment);
  }

  // ============ 启动 ============
  document.addEventListener('DOMContentLoaded', init);
})();
