/**
 * 引导设计 — 主题问题库 + 流程管理
 */

// ============ 主题列表 ============
const THEMES = [
  { id: 'love', emoji: '💕', name: '恋爱', desc: '情侣合照、纪念日、心动瞬间' },
  { id: 'daily', emoji: '📝', name: '日常', desc: '生活碎片、随手记录' },
  { id: 'vlog', emoji: '🎬', name: 'Vlog', desc: '视频日记、剪辑作品' },
  { id: 'plog', emoji: '📷', name: 'Plog', desc: '图片日志、九宫格分享' },
  { id: 'travel', emoji: '✈️', name: '旅游', desc: '旅行攻略、风景大片' },
  { id: 'food', emoji: '🍜', name: '美食', desc: '探店打卡、做饭分享' },
  { id: 'fashion', emoji: '👗', name: '穿搭', desc: 'OOTD、购物分享' },
  { id: 'beauty', emoji: '💄', name: '美妆', desc: '化妆教程、好物推荐' },
  { id: 'review', emoji: '📊', name: '测评', desc: '开箱体验、好物测评' },
  { id: 'home', emoji: '🏠', name: '家居', desc: '房间改造、收纳布置' },
  { id: 'music', emoji: '🎵', name: '音乐', desc: '歌单分享、弹唱记录' },
  { id: 'other', emoji: '🌸', name: '其他', desc: '自由发挥，不限类型' },
];

// ============ 每主题的问题库 ============
const THEME_QUESTIONS = {
  love: [
    { id: 'mediaType', q: '这次想发图片还是视频呀？', type: 'single',
      options: ['📷 图片', '🎬 视频', '📱 两个都要'] },
    { id: 'moment', q: '想记录什么样的时刻呢？', type: 'text',
      placeholder: '比如：第一次牵手、一起看日落、纪念日惊喜...' },
    { id: 'vibe', q: '想要传递什么感觉？（可多选）', type: 'multi',
      options: ['✨ 甜蜜', '🎞️ 电影感', '🌅 温馨', '💫 氛围感', '🔥 热烈', '🌙 安静'] },
    { id: 'extra', q: '还有什么想法想告诉小喵的吗？', type: 'text',
      placeholder: '任何细节都可以说~（选填）', optional: true },
  ],
  daily: [
    { id: 'mediaType', q: '图片还是视频？', type: 'single',
      options: ['📷 图片', '🎬 视频', '📱 都要'] },
    { id: 'content', q: '今天想分享什么呀？', type: 'text',
      placeholder: '比如：周末日常、在家做饭、出门逛街...' },
    { id: 'vibe', q: '想要什么感觉？（可多选）', type: 'multi',
      options: ['🌸 温馨', '🎉 活泼', '🍃 安静', '💖 治愈', '✨ 精致', '😎 随意'] },
    { id: 'extra', q: '还有什么想法？', type: 'text',
      placeholder: '（选填）', optional: true },
  ],
  vlog: [
    { id: 'topic', q: '这个 Vlog 的主题是什么？', type: 'text',
      placeholder: '比如：我的一天、探店记录、旅拍短片...' },
    { id: 'style', q: '视频风格想走什么路线？', type: 'single',
      options: ['🎞️ 电影感', '📱 随手记录', '✨ 精致剪辑', '🎨 创意脑洞'] },
    { id: 'pace', q: '节奏感想要？', type: 'single',
      options: ['⚡ 快节奏冲击力', '🌿 慢悠悠治愈向', '🎯 自然不刻意'] },
    { id: 'extra', q: '还有补充的吗？', type: 'text',
      placeholder: '比如参考的博主、想用的BGM...（选填）', optional: true },
  ],
  plog: [
    { id: 'content', q: '这次 Plog 想记录什么？', type: 'text',
      placeholder: '比如：一周穿搭合集、周末探店、书桌日常...' },
    { id: 'style', q: '图片风格偏向？', type: 'single',
      options: ['🎨 精致排版', '📱 原图直出', '🌿 日系清新', '🖤 高级暗调'] },
    { id: 'count', q: '大概会发几张图？', type: 'single',
      options: ['1-3张（少而精）', '4-6张（刚好）', '7-9张（九宫格）'] },
    { id: 'extra', q: '还有什么想法？', type: 'text',
      placeholder: '（选填）', optional: true },
  ],
  travel: [
    { id: 'destination', q: '去哪里玩啦？（或者想去哪里？）', type: 'text',
      placeholder: '比如：大理、京都、海边...' },
    { id: 'style', q: '想做成什么类型的分享？', type: 'single',
      options: ['🗺️ 实用攻略', '📸 美图分享', '📖 旅行游记', '💰 省钱tips'] },
    { id: 'vibe', q: '旅行的心情是？', type: 'multi',
      options: ['🌅 浪漫', '🎉 热闹', '🌿 治愈', '⚡ 刺激', '🍃 放松'] },
    { id: 'extra', q: '还有什么想补充的？', type: 'text',
      placeholder: '（选填）', optional: true },
  ],
  food: [
    { id: 'content', q: '美食内容想怎么呈现？', type: 'single',
      options: ['🍽️ 探店打卡', '👩‍🍳 自己做饭', '🍰 甜品饮品', '📝 测评种草'] },
    { id: 'vibe', q: '风格想要？', type: 'single',
      options: ['🎨 精致摆拍', '📱 真实原图', '🔥 诱人流口水', '🌸 日系小清新'] },
    { id: 'highlight', q: '最想突出什么？', type: 'text',
      placeholder: '比如：口感惊艳、仪式感、性价比超高...' },
    { id: 'extra', q: '还有什么想法？', type: 'text',
      placeholder: '（选填）', optional: true },
  ],
  fashion: [
    { id: 'style', q: '穿搭风格是？', type: 'single',
      options: ['🌸 甜美少女', '😎 简约高级', '🔥 辣妹风', '🌿 日系文艺', '🎨 街头潮流'] },
    { id: 'scene', q: '什么场景的穿搭？', type: 'single',
      options: ['🏫 日常通勤', '🎉 约会聚会', '✈️ 旅行度假', '🏋️ 运动健身'] },
    { id: 'highlight', q: '最想展示什么？', type: 'text',
      placeholder: '比如：显瘦搭配、一衣多穿、色彩搭配...' },
    { id: 'extra', q: '还有什么要说的？', type: 'text',
      placeholder: '（选填）', optional: true },
  ],
  beauty: [
    { id: 'content', q: '美妆内容偏向？', type: 'single',
      options: ['💄 妆容教程', '🛍️ 产品推荐', '📝 使用心得', '🎨 创意妆容'] },
    { id: 'level', q: '面向什么人群？', type: 'single',
      options: ['🌱 新手友好', '💪 进阶技巧', '👑 专业分享', '😊 不限'] },
    { id: 'highlight', q: '最想强调什么？', type: 'text',
      placeholder: '比如：持妆效果、透亮感、平价好用...' },
    { id: 'extra', q: '还有什么想法？', type: 'text',
      placeholder: '（选填）', optional: true },
  ],
  review: [
    { id: 'product', q: '想测评什么？', type: 'text',
      placeholder: '比如：新手机、护肤品、家居好物...' },
    { id: 'angle', q: '测评角度？', type: 'multi',
      options: ['💰 性价比', '⭐ 使用体验', '📊 对比分析', '🎁 开箱展示'] },
    { id: 'honesty', q: '整体评价偏向？', type: 'single',
      options: ['👍 种草推荐', '🤔 客观中立', '👎 避雷吐槽'] },
    { id: 'extra', q: '还有什么想说的？', type: 'text',
      placeholder: '（选填）', optional: true },
  ],
  home: [
    { id: 'content', q: '家居内容是什么？', type: 'single',
      options: ['🏠 房间改造', '📦 收纳整理', '🛋️ 好物分享', '🎨 装饰布置'] },
    { id: 'style', q: '家居风格是？', type: 'single',
      options: ['🌸 温馨ins风', '🖤 极简高级', '🌿 日式原木', '🎨 彩色活泼'] },
    { id: 'highlight', q: '最想展示什么？', type: 'text',
      placeholder: '比如：小空间利用、平价改造、氛围感...' },
    { id: 'extra', q: '还有什么想法？', type: 'text',
      placeholder: '（选填）', optional: true },
  ],
  music: [
    { id: 'content', q: '音乐内容是什么？', type: 'single',
      options: ['🎵 歌单推荐', '🎸 弹唱演奏', '💿 专辑分享', '🎤 翻唱创作'] },
    { id: 'mood', q: '音乐氛围？', type: 'multi',
      options: ['🌙 安静治愈', '🔥 嗨起来', '💕 甜甜的', '🌧️ 情绪向', '☀️ 元气满满'] },
    { id: 'highlight', q: '最想传达什么？', type: 'text',
      placeholder: '比如：这首歌让我想到...、适合xxx场景听...' },
    { id: 'extra', q: '还有什么想法？', type: 'text',
      placeholder: '（选填）', optional: true },
  ],
  other: [
    { id: 'mediaType', q: '内容是什么类型？', type: 'single',
      options: ['📷 图片', '🎬 视频', '📝 纯文字', '📱 都要'] },
    { id: 'content', q: '简单描述一下你想做的内容？', type: 'text',
      placeholder: '想说什么就说什么~' },
    { id: 'vibe', q: '想要什么感觉？', type: 'multi',
      options: ['✨ 高级', '🌸 温柔', '🔥 炸裂', '😊 舒服', '🎨 有创意', '💖 走心'] },
    { id: 'extra', q: '还有什么要补充的？', type: 'text',
      placeholder: '（选填）', optional: true },
  ],
};

// ============ 引导流程管理 ============
const GuideFlow = {
  theme: null,
  currentQ: 0,
  answers: [],
  platform: 'xiaohongshu',

  init() {
    this.renderThemeGrid();
    this.updateProgress(0);
  },

  // 渲染主题网格
  renderThemeGrid() {
    const grid = document.getElementById('themeGrid');
    if (!grid) return;
    grid.innerHTML = THEMES.map((t) => `
      <button class="theme-card" data-theme="${t.id}">
        <span class="theme-emoji">${t.emoji}</span>
        <span class="theme-name">${t.name}</span>
        <span class="theme-desc">${t.desc}</span>
      </button>
    `).join('');

    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.theme-card');
      if (!card) return;
      this.selectTheme(card.dataset.theme);
    });
  },

  // 选择主题
  selectTheme(themeId) {
    this.theme = themeId;
    this.currentQ = 0;
    this.answers = [];

    // 高亮选中
    document.querySelectorAll('.theme-card').forEach((c) => {
      c.classList.toggle('selected', c.dataset.theme === themeId);
    });

    // 显示问题区
    document.getElementById('stepTheme').style.display = 'none';
    document.getElementById('stepQuestions').style.display = '';
    document.getElementById('guideEmptyState').style.display = 'none';
    this.updateProgress(1);

    const themeInfo = THEMES.find((t) => t.id === themeId);
    document.getElementById('questionTitle').textContent =
      `🐱 小喵想多了解一点「${themeInfo.emoji} ${themeInfo.name}」...`;

    this.renderCurrentQuestion();
  },

  // 渲染当前问题
  renderCurrentQuestion() {
    const questions = THEME_QUESTIONS[this.theme] || THEME_QUESTIONS.other;
    const q = questions[this.currentQ];
    if (!q) return;

    document.getElementById('questionProgress').textContent =
      `${this.currentQ + 1}/${questions.length}`;

    const card = document.getElementById('questionCard');
    let optionsHTML = '';
    const prevAnswer = this.answers[this.currentQ];

    if (q.type === 'single') {
      optionsHTML = `<div class="q-options">${q.options.map((opt) => `
        <button class="q-option-btn ${prevAnswer === opt ? 'selected' : ''}" data-value="${opt}">${opt}</button>
      `).join('')}</div>`;
    } else if (q.type === 'multi') {
      const selected = prevAnswer ? prevAnswer.split(', ') : [];
      optionsHTML = `<div class="q-options">${q.options.map((opt) => `
        <button class="q-option-btn multi ${selected.includes(opt) ? 'selected' : ''}" data-value="${opt}">${opt}</button>
      `).join('')}</div>`;
    } else {
      optionsHTML = `<input type="text" class="q-text-input" placeholder="${q.placeholder || ''}" value="${prevAnswer || ''}" id="qTextInput" />`;
    }

    card.innerHTML = `
      <div class="q-label">${q.id === 'extra' ? '✨ ' : ''}${q.q}${q.optional ? ' <span style="color:var(--text-muted);font-size:0.8rem;">(选填)</span>' : ''}</div>
      ${optionsHTML}
    `;

    // 按钮文本
    const isLast = this.currentQ >= questions.length - 1;
    const btnNext = document.getElementById('btnNextQ');
    btnNext.textContent = isLast ? '选平台 ➡' : '下一题 ➡';
    btnNext.onclick = () => this.nextQuestion();

    document.getElementById('btnPrevQ').style.display = this.currentQ > 0 ? '' : 'none';

    // 绑定选项事件
    card.querySelectorAll('.q-option-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (q.type === 'single') {
          card.querySelectorAll('.q-option-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          this.answers[this.currentQ] = btn.dataset.value;
        } else {
          btn.classList.toggle('selected');
          const sel = card.querySelectorAll('.q-option-btn.selected');
          this.answers[this.currentQ] = Array.from(sel).map(b => b.dataset.value).join(', ');
        }
      });
    });

    const textInput = card.querySelector('#qTextInput');
    if (textInput) {
      textInput.addEventListener('input', () => {
        this.answers[this.currentQ] = textInput.value;
      });
      // Focus the input
      setTimeout(() => textInput.focus(), 100);
    }
  },

  // 下一题
  nextQuestion() {
    const questions = THEME_QUESTIONS[this.theme] || THEME_QUESTIONS.other;
    const q = questions[this.currentQ];

    // 非可选问题必须回答
    if (!q.optional && !this.answers[this.currentQ]) {
      if (q.type === 'text') {
        const input = document.getElementById('qTextInput');
        if (!input || !input.value.trim()) {
          input?.focus();
          showToast('🐱', '这个问题帮小喵填一下嘛~');
          return;
        }
        this.answers[this.currentQ] = input.value;
      } else {
        showToast('🐱', '选一个选项再继续吧~');
        return;
      }
    }

    // Text input: capture current value
    if (q.type === 'text') {
      const input = document.getElementById('qTextInput');
      if (input) this.answers[this.currentQ] = input.value;
    }

    if (this.currentQ < questions.length - 1) {
      this.currentQ++;
      this.renderCurrentQuestion();
    } else {
      // All questions done, show platform selector
      document.getElementById('stepQuestions').style.display = 'none';
      document.getElementById('stepPlatform').style.display = '';
      this.updateProgress(2);
    }
  },

  // 上一步
  prevQuestion() {
    if (this.currentQ > 0) {
      this.currentQ--;
      this.renderCurrentQuestion();
    }
  },

  // 生成前的数据准备
  getData() {
    const questions = THEME_QUESTIONS[this.theme] || THEME_QUESTIONS.other;
    const themeInfo = THEMES.find((t) => t.id === this.theme);
    return {
      mode: 'guided',
      theme: this.theme,
      themeName: themeInfo ? themeInfo.name : '',
      themeEmoji: themeInfo ? themeInfo.emoji : '',
      platform: this.platform,
      answers: questions.map((q, i) => ({
        question: q.q,
        answer: this.answers[i] || '',
      })),
      contentType: this.theme,
    };
  },

  // 更新进度条
  updateProgress(step) {
    const steps = document.querySelectorAll('.progress-step');
    const lines = document.querySelectorAll('.progress-line');
    steps.forEach((s, i) => {
      s.classList.remove('done', 'current');
      if (i < step) s.classList.add('done');
      if (i === step) s.classList.add('current');
    });
    lines.forEach((l, i) => {
      l.classList.toggle('done', i < step);
    });
  },

  // 重置
  reset() {
    this.theme = null;
    this.currentQ = 0;
    this.answers = [];
    document.getElementById('stepTheme').style.display = '';
    document.getElementById('stepQuestions').style.display = 'none';
    document.getElementById('stepPlatform').style.display = 'none';
    document.getElementById('guideFrameworkSection').style.display = 'none';
    document.getElementById('guideCopySection').style.display = 'none';
    document.getElementById('guideEmptyState').style.display = '';
    document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
    this.updateProgress(0);
  },
};
