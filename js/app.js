/**
 * 文案喵 v2.0 — 主应用逻辑
 * 双模式：引导设计 + 快速生成 + 历史收藏
 */
(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  // ============ 全局状态 ============
  const state = {
    currentMode: 'guide',       // 'guide' | 'generate'
    // Quick mode
    platform: 'xiaohongshu',
    tone: 'cute',
    contentType: 'daily',
    isGenerating: false,
    currentResults: [],
    // Guide mode
    guideResults: [],
  };

  // ============ DOM 引用 ============
  // Quick mode
  const keywordInput = $('#keywordInput');
  const btnGenerate = $('#btnGenerate');
  const loadingSection = $('#loadingSection');
  const resultsSection = $('#resultsSection');
  const resultsList = $('#resultsList');
  const emptyState = $('#emptyState');
  // Guide mode
  const stepPlatform = $('#stepPlatform');
  const guideLoadingSection = $('#guideLoadingSection');
  const guideFrameworkSection = $('#guideFrameworkSection');
  const frameworkCard = $('#frameworkCard');
  const guideCopySection = $('#guideCopySection');
  const guideResultsList = $('#guideResultsList');
  const guideEmptyState = $('#guideEmptyState');
  const btnStartGenerate = $('#btnStartGenerate');
  const btnRegenerate = $('#btnRegenerate');
  const btnNewDesign = $('#btnNewDesign');
  const btnPrevQ = $('#btnPrevQ');
  // Shared
  const toast = $('#toast');
  const favBadge = $('#favBadge');
  const historyContent = $('#historyContent');
  const favoritesContent = $('#favoritesContent');

  // ============ 初始化 ============
  function init() {
    CatMascot.init();
    CatMascot.bindClick('heroCat');
    CatMascot.bindClick('headerCat');

    const settings = Storage.getSettings();
    state.platform = settings.platform || 'xiaohongshu';
    state.tone = settings.tone || 'cute';
    state.contentType = settings.contentType || 'daily';
    restoreQuickChipStates();
    updateFavBadge();
    renderHistory();
    renderFavorites();
    createDecorations();
    bindEvents();
    GuideFlow.init();
  }

  function restoreQuickChipStates() {
    $$('#platformChips .chip').forEach(c => c.classList.toggle('active', c.dataset.value === state.platform));
    $$('#toneChips .chip').forEach(c => c.classList.toggle('active', c.dataset.value === state.tone));
    $$('#typeChips .chip').forEach(c => c.classList.toggle('active', c.dataset.value === state.contentType));
  }

  // ============ 事件绑定 ============
  function bindEvents() {
    // Nav panel switching
    $$('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const panel = btn.dataset.panel;
        if (panel === 'guide' || panel === 'generator') {
          state.currentMode = panel;
        }
        switchPanel(panel);
      });
    });

    $('#logo').addEventListener('click', () => switchPanel('guide'));

    // ======= Quick Mode Events =======
    keywordInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleQuickGenerate(); });
    btnGenerate?.addEventListener('click', handleQuickGenerate);

    $('#platformChips')?.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      $$('#platformChips .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.platform = chip.dataset.value;
      Storage.saveSettings({ platform: state.platform });
    });

    $('#toneChips')?.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      $$('#toneChips .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.tone = chip.dataset.value;
      Storage.saveSettings({ tone: state.tone });
    });

    $('#typeChips')?.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      $$('#typeChips .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.contentType = chip.dataset.value;
      Storage.saveSettings({ contentType: state.contentType });
    });

    $('.example-chip')?.forEach(chip => {
      chip.addEventListener('click', () => {
        if (keywordInput) keywordInput.value = chip.textContent.trim();
        handleQuickGenerate();
      });
    });

    resultsList?.addEventListener('click', handleResultAction);
    $('#btnClearResults')?.addEventListener('click', () => {
      if (resultsSection) resultsSection.style.display = 'none';
      if (emptyState) emptyState.style.display = '';
      state.currentResults = [];
    });

    // ======= Guide Mode Events =======
    btnPrevQ?.addEventListener('click', () => GuideFlow.prevQuestion());

    // Guide platform selector
    $('#guidePlatformChips')?.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      $$('#guidePlatformChips .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      GuideFlow.platform = chip.dataset.value;
    });

    btnStartGenerate?.addEventListener('click', handleGuidedGenerate);
    btnRegenerate?.addEventListener('click', handleGuidedGenerate);
    btnNewDesign?.addEventListener('click', () => GuideFlow.reset());

    // ======= History & Favorites =======
    historyContent?.addEventListener('click', handleHistoryAction);
    favoritesContent?.addEventListener('click', handleFavoritesAction);
    $('#btnClearHistory')?.addEventListener('click', clearHistory);
    $('#btnClearFavorites')?.addEventListener('click', clearFavorites);
  }

  // ============ 面板切换 ============
  function switchPanel(panel) {
    $$('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.panel === panel));
    $$('.panel').forEach(p => p.classList.toggle('active', p.id === `panel-${panel}`));
    if (panel === 'history') renderHistory();
    if (panel === 'favorites') renderFavorites();
  }

  // ============ 快速生成 ============
  async function handleQuickGenerate() {
    const keywords = keywordInput?.value.trim();
    if (!keywords) {
      keywordInput?.focus();
      showToast('🐱', '请输入关键词喵~');
      return;
    }
    if (state.isGenerating) return;

    state.isGenerating = true;
    btnGenerate.disabled = true;
    btnGenerate.querySelector('.btn-generate-text').textContent = '生成中...';
    if (emptyState) emptyState.style.display = 'none';
    if (loadingSection) loadingSection.style.display = '';
    if (resultsSection) resultsSection.style.display = 'none';
    CatMascot.setState('thinking');
    runLoadingMessages('loadingText');

    try {
      const result = await API.generate({ keywords, platform: state.platform, tone: state.tone, contentType: state.contentType });
      state.currentResults.unshift(result);
      Storage.addHistory(result);
      renderQuickResults();
      if (loadingSection) loadingSection.style.display = 'none';
      if (resultsSection) resultsSection.style.display = '';
      CatMascot.setState('happy');
      showToast('✨', '文案生成好啦~');
      setTimeout(() => CatMascot.setState('idle'), 3000);
    } catch (error) {
      if (loadingSection) loadingSection.style.display = 'none';
      if (emptyState) emptyState.style.display = '';
      CatMascot.setState('idle');
      showToast('😿', error.message || '生成失败~');
      console.error(error);
    } finally {
      state.isGenerating = false;
      btnGenerate.disabled = false;
      btnGenerate.querySelector('.btn-generate-text').textContent = '生成文案';
    }
  }

  function renderQuickResults() {
    if (!state.currentResults.length) { if (resultsSection) resultsSection.style.display = 'none'; if (emptyState) emptyState.style.display = ''; return; }
    if (resultsList) resultsList.innerHTML = state.currentResults.map((item, i) => Templates.resultCard(item, i)).join('');
  }

  function handleResultAction(e) {
    const t = e.target.closest('button'); if (!t) return;
    if (t.classList.contains('btn-copy')) copyToClipboard(t.dataset.copy, t);
    if (t.classList.contains('btn-fav')) { toggleFavorite(t.dataset.copy, t.dataset.item, t); }
    if (t.classList.contains('btn-regenerate')) {
      if (keywordInput) keywordInput.value = t.dataset.keywords;
      state.platform = t.dataset.platform; state.tone = t.dataset.tone; state.contentType = t.dataset.type;
      restoreQuickChipStates(); handleQuickGenerate(); window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ============ 引导生成 ============
  async function handleGuidedGenerate() {
    if (state.isGenerating) return;
    const guideData = GuideFlow.getData();

    state.isGenerating = true;
    btnStartGenerate && (btnStartGenerate.disabled = true);
    stepPlatform && (stepPlatform.style.display = 'none');
    guideFrameworkSection && (guideFrameworkSection.style.display = 'none');
    guideCopySection && (guideCopySection.style.display = 'none');
    guideLoadingSection && (guideLoadingSection.style.display = '');
    if (guideEmptyState) guideEmptyState.style.display = 'none';
    CatMascot.setState('thinking');
    runLoadingMessages('guideLoadingText');
    GuideFlow.updateProgress(2);

    try {
      const result = await API.generateGuided(guideData);
      guideLoadingSection && (guideLoadingSection.style.display = 'none');
      CatMascot.setState('happy');

      // Show framework
      if (result.framework && Object.keys(result.framework).length > 0) {
        GuideFlow.updateProgress(2);
        frameworkCard.innerHTML = Templates.frameworkCard(result.framework);
        guideFrameworkSection.style.display = '';
      }

      // Show copy
      GuideFlow.updateProgress(3);
      guideCopySection.style.display = '';
      const copyData = {
        ...result,
        themeName: guideData.themeName,
        themeEmoji: guideData.themeEmoji,
      };
      guideResultsList.innerHTML = Templates.guidedCopyCard(copyData, 0);
      state.guideResults = [copyData];

      // Save to history
      Storage.addHistory({ ...result, keywords: `${guideData.themeEmoji} ${guideData.themeName}`, platform: result.platform || guideData.platform, tone: 'guided', contentType: guideData.theme || 'guided' });

      showToast('✨', '框架和文案都生成好啦~');
      setTimeout(() => CatMascot.setState('idle'), 3000);
    } catch (error) {
      guideLoadingSection && (guideLoadingSection.style.display = 'none');
      if (guideEmptyState) guideEmptyState.style.display = '';
      CatMascot.setState('idle');
      showToast('😿', error.message || '生成失败~');
      console.error(error);
    } finally {
      state.isGenerating = false;
      btnStartGenerate && (btnStartGenerate.disabled = false);
    }
  }

  // ============ 历史 & 收藏 ============
  function renderHistory() { if (historyContent) historyContent.innerHTML = Templates.historyList(Storage.getHistory()); }
  function renderFavorites() { if (favoritesContent) favoritesContent.innerHTML = Templates.favoritesList(Storage.getFavorites()); }
  function updateFavBadge() {
    const c = Storage.getFavorites().length;
    if (c > 0) { favBadge.style.display = 'flex'; favBadge.textContent = c; }
    else favBadge.style.display = 'none';
  }

  function handleHistoryAction(e) {
    const t = e.target.closest('button'); if (!t) return;
    if (t.classList.contains('btn-copy')) copyToClipboard(t.dataset.copy, t);
    if (t.classList.contains('btn-remove-history')) { Storage.removeHistoryItem(parseInt(t.dataset.id)); renderHistory(); showToast('🗑️', '已删除'); }
  }

  function handleFavoritesAction(e) {
    const t = e.target.closest('button'); if (!t) return;
    if (t.classList.contains('btn-copy')) copyToClipboard(t.dataset.copy, t);
    if (t.classList.contains('btn-remove-fav')) { Storage.removeFavorite(t.dataset.copy); renderFavorites(); updateFavBadge(); showToast('💔', '已取消收藏'); }
  }

  function clearHistory() { if (confirm('确定清空所有历史？')) { Storage.clearHistory(); renderHistory(); showToast('🗑️', '已清空'); } }
  function clearFavorites() { if (confirm('确定清空所有收藏？')) { Storage.clearFavorites(); renderFavorites(); updateFavBadge(); showToast('🗑️', '已清空'); } }

  function toggleFavorite(copyText, itemJson, btn) {
    let item;
    try { item = JSON.parse(itemJson); } catch { item = { copy: copyText, platform: state.platform, tone: state.tone }; }
    if (Storage.isFavorited(copyText)) { Storage.removeFavorite(copyText); btn.classList.remove('favorited'); btn.innerHTML = '☆ 收藏'; showToast('💔', '已取消'); }
    else { Storage.addFavorite(item); btn.classList.add('favorited'); btn.innerHTML = '⭐ 已收藏'; showToast('⭐', '已收藏'); }
    updateFavBadge();
  }

  // ============ 复制 ============
  async function copyToClipboard(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      if (button) { const o = button.innerHTML; button.classList.add('copied'); button.innerHTML = '✅ 已复制'; setTimeout(() => { button.classList.remove('copied'); button.innerHTML = o; }, 2000); }
      showToast('📋', '已复制~');
    } catch {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0;'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      showToast('📋', '已复制~');
    }
  }

  // ============ Toast ============
  let toastTimer;
  function showToast(icon, msg) {
    clearTimeout(toastTimer);
    toast.querySelector('.toast-icon').textContent = icon;
    toast.querySelector('.toast-text').textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
  }
  window.showToast = showToast; // expose for guide.js

  // ============ Loading messages ============
  function runLoadingMessages(elId) {
    const msgs = ['小喵正在构思...', '让内容更有设计感...', '打磨每一个细节...', '马上就好~'];
    const el = document.getElementById(elId);
    if (!el) return;
    let i = 0;
    el.textContent = msgs[0];
    const timer = setInterval(() => { i = (i + 1) % msgs.length; el.textContent = msgs[i]; }, 1500);
    return timer;
  }

  // ============ 浮动装饰 ============
  function createDecorations() {
    const c = $('#decorations'); if (!c) return;
    const emojis = ['🌸','🐾','💕','⭐','🎀','✨','🍰','💖','🌺','🦋','☁️','🌈'];
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 18; i++) {
      const el = document.createElement('span'); el.className = 'deco-item'; el.textContent = emojis[i % emojis.length];
      el.style.setProperty('--size', `${0.8 + Math.random() * 1.8}rem`);
      el.style.setProperty('--dur', `${8 + Math.random() * 12}s`);
      el.style.setProperty('--delay', `${Math.random() * 10}s`);
      el.style.left = `${Math.random() * 95}%`; el.style.top = `${Math.random() * 90}%`;
      el.style.opacity = `${0.12 + Math.random() * 0.18}`;
      frag.appendChild(el);
    }
    c.appendChild(frag);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
