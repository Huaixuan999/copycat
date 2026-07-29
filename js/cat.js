/**
 * 猫咪吉祥物模块
 * 管理所有猫咪 SVG 和动画状态
 */

const CatMascot = {
  // 猫咪状态
  state: 'idle', // idle | thinking | happy

  // SVG templates for different cat states
  svgs: {
    // 初始状态 - 可爱打招呼的小猫
    idle: `
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <!-- Body -->
        <ellipse cx="60" cy="85" rx="30" ry="25" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1.5"/>
        <!-- Head -->
        <circle cx="60" cy="48" r="30" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1.5"/>
        <!-- Ears -->
        <polygon points="33,30 27,8 46,22" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1.5"/>
        <polygon points="87,30 93,8 74,22" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1.5"/>
        <!-- Inner ears -->
        <polygon points="36,28 32,14 44,24" fill="#FFD4D4"/>
        <polygon points="84,28 88,14 76,24" fill="#FFD4D4"/>
        <!-- Eyes -->
        <ellipse cx="48" cy="45" rx="6" ry="7" fill="#4A3F4F"/>
        <ellipse cx="72" cy="45" rx="6" ry="7" fill="#4A3F4F"/>
        <!-- Eye sparkles -->
        <circle cx="45" cy="42" r="2" fill="white"/>
        <circle cx="51" cy="43" r="1" fill="white"/>
        <circle cx="69" cy="42" r="2" fill="white"/>
        <circle cx="75" cy="43" r="1" fill="white"/>
        <!-- Nose -->
        <ellipse cx="60" cy="52" rx="3.5" ry="2.5" fill="#FFB0B0"/>
        <!-- Mouth -->
        <path d="M55,55 Q60,59 65,55" fill="none" stroke="#D4C5C0" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Whiskers -->
        <line x1="22" y1="48" x2="38" y2="50" stroke="#E8D5D0" stroke-width="1" stroke-linecap="round"/>
        <line x1="22" y1="54" x2="38" y2="53" stroke="#E8D5D0" stroke-width="1" stroke-linecap="round"/>
        <line x1="82" y1="50" x2="98" y2="48" stroke="#E8D5D0" stroke-width="1" stroke-linecap="round"/>
        <line x1="82" y1="53" x2="98" y2="54" stroke="#E8D5D0" stroke-width="1" stroke-linecap="round"/>
        <!-- Paw (waving) -->
        <g class="cat-paw-wave">
          <ellipse cx="35" cy="68" rx="10" ry="8" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1.5" transform="rotate(-20, 35, 68)"/>
          <circle cx="31" cy="63" r="2.5" fill="#FFD4D4"/>
          <circle cx="35" cy="61" r="2.5" fill="#FFD4D4"/>
          <circle cx="39" cy="63" r="2.5" fill="#FFD4D4"/>
        </g>
        <!-- Blush -->
        <ellipse cx="38" cy="54" rx="5" ry="3" fill="#FFD4D4" opacity="0.6"/>
        <ellipse cx="82" cy="54" rx="5" ry="3" fill="#FFD4D4" opacity="0.6"/>
        <!-- Tail -->
        <path d="M85,90 Q105,80 100,65 Q96,55 90,60" fill="none" stroke="#E8D5D0" stroke-width="5" stroke-linecap="round" class="cat-tail"/>
      </svg>
    `,

    // 思考状态 - 歪头思考
    thinking: `
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="85" rx="30" ry="25" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1.5"/>
        <g class="cat-head-tilt">
          <animateTransform attributeName="transform" type="rotate" values="0 60 48;5 60 48;0 60 48;-5 60 48;0 60 48" dur="2s" repeatCount="indefinite"/>
          <circle cx="60" cy="48" r="30" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1.5"/>
          <polygon points="33,30 27,8 46,22" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1.5"/>
          <polygon points="87,30 93,8 74,22" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1.5"/>
          <polygon points="36,28 32,14 44,24" fill="#FFD4D4"/>
          <polygon points="84,28 88,14 76,24" fill="#FFD4D4"/>
          <!-- Thinking eyes (looking up/right) -->
          <ellipse cx="50" cy="44" rx="5" ry="6" fill="#4A3F4F"/>
          <ellipse cx="74" cy="44" rx="5" ry="6" fill="#4A3F4F"/>
          <circle cx="48" cy="41" r="2" fill="white"/>
          <circle cx="72" cy="41" r="2" fill="white"/>
          <!-- Thinking mouth (pursed to side) -->
          <ellipse cx="58" cy="53" rx="2" ry="2" fill="#FFB0B0"/>
          <path d="M55,57 Q58,55 61,57" fill="none" stroke="#D4C5C0" stroke-width="1.2" stroke-linecap="round"/>
          <ellipse cx="38" cy="54" rx="5" ry="3" fill="#FFD4D4" opacity="0.6"/>
          <ellipse cx="82" cy="54" rx="5" ry="3" fill="#FFD4D4" opacity="0.6"/>
          <line x1="22" y1="48" x2="38" y2="50" stroke="#E8D5D0" stroke-width="1" stroke-linecap="round"/>
          <line x1="22" y1="54" x2="38" y2="53" stroke="#E8D5D0" stroke-width="1" stroke-linecap="round"/>
          <line x1="82" y1="50" x2="98" y2="48" stroke="#E8D5D0" stroke-width="1" stroke-linecap="round"/>
          <line x1="82" y1="53" x2="98" y2="54" stroke="#E8D5D0" stroke-width="1" stroke-linecap="round"/>
        </g>
        <!-- Thinking paw on chin -->
        <ellipse cx="48" cy="65" rx="8" ry="6" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1.5" transform="rotate(10, 48, 65)"/>
        <circle cx="45" cy="62" r="2" fill="#FFD4D4"/>
        <circle cx="49" cy="60" r="2" fill="#FFD4D4"/>
        <!-- Tail curled -->
        <path d="M85,90 Q100,80 95,60 Q90,50 85,55" fill="none" stroke="#E8D5D0" stroke-width="5" stroke-linecap="round"/>
        <!-- Thought bubbles -->
        <circle cx="95" cy="30" r="3" fill="#FFD4D4" opacity="0.5">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="103" cy="22" r="4" fill="#FFD4D4" opacity="0.4">
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.5s" begin="0.3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="112" cy="12" r="5" fill="#FFD4D4" opacity="0.3">
          <animate attributeName="opacity" values="0.1;0.5;0.1" dur="1.5s" begin="0.6s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `,

    // 开心状态 - 完成后开心
    happy: `
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="85" rx="30" ry="25" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1.5"/>
        <circle cx="60" cy="48" r="30" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1.5"/>
        <polygon points="33,30 27,8 46,22" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1.5"/>
        <polygon points="87,30 93,8 74,22" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1.5"/>
        <polygon points="36,28 32,14 44,24" fill="#FFD4D4"/>
        <polygon points="84,28 88,14 76,24" fill="#FFD4D4"/>
        <!-- Happy eyes (curved) -->
        <path d="M42,44 Q48,38 54,44" fill="none" stroke="#4A3F4F" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M66,44 Q72,38 78,44" fill="none" stroke="#4A3F4F" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Happy mouth (open smile) -->
        <path d="M52,54 Q60,64 68,54" fill="#FFB0B0" stroke="#FFB0B0" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M52,54 Q60,64 68,54" fill="none" stroke="#D4C5C0" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Tongue -->
        <ellipse cx="60" cy="58" rx="4" ry="3" fill="#FFA0A0"/>
        <!-- Blush -->
        <ellipse cx="37" cy="54" rx="6" ry="3.5" fill="#FFD4D4" opacity="0.7"/>
        <ellipse cx="83" cy="54" rx="6" ry="3.5" fill="#FFD4D4" opacity="0.7"/>
        <!-- Whiskers -->
        <line x1="24" y1="48" x2="38" y2="50" stroke="#E8D5D0" stroke-width="1" stroke-linecap="round"/>
        <line x1="24" y1="54" x2="38" y2="53" stroke="#E8D5D0" stroke-width="1" stroke-linecap="round"/>
        <line x1="82" y1="50" x2="96" y2="48" stroke="#E8D5D0" stroke-width="1" stroke-linecap="round"/>
        <line x1="82" y1="53" x2="96" y2="54" stroke="#E8D5D0" stroke-width="1" stroke-linecap="round"/>
        <!-- Both paws up (happy) -->
        <g class="cat-paws-up">
          <ellipse cx="38" cy="60" rx="8" ry="6" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1.5" transform="rotate(-30, 38, 60)"/>
          <circle cx="35" cy="56" r="2" fill="#FFD4D4"/>
          <circle cx="39" cy="54" r="2" fill="#FFD4D4"/>
          <ellipse cx="82" cy="60" rx="8" ry="6" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1.5" transform="rotate(30, 82, 60)"/>
          <circle cx="81" cy="54" r="2" fill="#FFD4D4"/>
          <circle cx="85" cy="56" r="2" fill="#FFD4D4"/>
        </g>
        <!-- Sparkles -->
        <text x="15" y="20" font-size="10" class="cat-sparkle">✨</text>
        <text x="95" y="25" font-size="8" class="cat-sparkle">⭐</text>
        <text x="100" y="45" font-size="6" class="cat-sparkle">💕</text>
        <!-- Tail (happy wag) -->
        <path d="M88,88 Q108,75 105,55" fill="none" stroke="#E8D5D0" stroke-width="5" stroke-linecap="round" class="cat-tail-wag"/>
      </svg>
    `,

    // 空状态猫咪 - 好奇张望
    empty: `
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="85" rx="28" ry="22" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1.5"/>
        <circle cx="60" cy="50" r="28" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1.5"/>
        <polygon points="35,30 29,10 47,22" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1.5"/>
        <polygon points="85,30 91,10 73,22" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1.5"/>
        <polygon points="38,28 34,16 45,24" fill="#FFD4D4"/>
        <polygon points="82,28 86,16 75,24" fill="#FFD4D4"/>
        <!-- Big curious eyes -->
        <ellipse cx="48" cy="47" rx="6.5" ry="7.5" fill="#4A3F4F"/>
        <ellipse cx="72" cy="47" rx="6.5" ry="7.5" fill="#4A3F4F"/>
        <circle cx="45" cy="44" r="2.5" fill="white"/>
        <circle cx="51" cy="45" r="1.2" fill="white"/>
        <circle cx="69" cy="44" r="2.5" fill="white"/>
        <circle cx="75" cy="45" r="1.2" fill="white"/>
        <!-- Small "o" mouth -->
        <ellipse cx="60" cy="55" rx="3" ry="3.5" fill="#FFB0B0"/>
        <ellipse cx="38" cy="56" rx="5" ry="3" fill="#FFD4D4" opacity="0.6"/>
        <ellipse cx="82" cy="56" rx="5" ry="3" fill="#FFD4D4" opacity="0.6"/>
        <line x1="24" y1="50" x2="40" y2="52" stroke="#E8D5D0" stroke-width="1" stroke-linecap="round"/>
        <line x1="24" y1="56" x2="40" y2="55" stroke="#E8D5D0" stroke-width="1" stroke-linecap="round"/>
        <line x1="80" y1="52" x2="96" y2="50" stroke="#E8D5D0" stroke-width="1" stroke-linecap="round"/>
        <line x1="80" y1="55" x2="96" y2="56" stroke="#E8D5D0" stroke-width="1" stroke-linecap="round"/>
        <!-- Paws on ground -->
        <ellipse cx="42" cy="95" rx="8" ry="5" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1" stroke-linecap="round"/>
        <ellipse cx="78" cy="95" rx="8" ry="5" fill="#FFF5F0" stroke="#E8D5D0" stroke-width="1" stroke-linecap="round"/>
        <!-- Tail -->
        <path d="M85,88 Q100,82 98,68" fill="none" stroke="#E8D5D0" stroke-width="4.5" stroke-linecap="round"/>
        <!-- Question mark -->
        <text x="92" y="28" font-size="14" fill="#FFB0B0" opacity="0.7">?</text>
      </svg>
    `,
  },

  /**
   * 渲染猫咪到指定容器
   */
  render(containerId, state) {
    const container = document.getElementById(containerId);
    if (!container) return;
    this.state = state || 'idle';
    container.innerHTML = this.svgs[this.state] || this.svgs.idle;
  },

  /**
   * 切换猫咪状态
   */
  setState(state) {
    this.state = state;
    ['heroCat', 'genHeroCat', 'headerCat', 'loadingCat', 'guideLoadingCat', 'emptyCat'].forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.innerHTML) {
        el.innerHTML = this.svgs[state] || this.svgs.idle;
      }
    });
  },

  /**
   * 初始化所有猫咪
   */
  init() {
    this.render('heroCat', 'idle');
    this.render('genHeroCat', 'idle');
    this.render('headerCat', 'idle');
    this.render('loadingCat', 'thinking');
    this.render('guideLoadingCat', 'thinking');
    // emptyCat is inside a div with class empty-cat, not an SVG container
    const emptyCatEl = document.querySelector('.empty-cat');
    if (emptyCatEl) {
      emptyCatEl.innerHTML = this.svgs.empty;
    }
  },

  /**
   * 点击猫咪卖萌
   */
  bindClick(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const original = this.state;
      this.setState('happy');
      setTimeout(() => this.setState(original), 1500);
    });
  },
};
