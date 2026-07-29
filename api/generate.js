const platformStyles = {
  xiaohongshu: { name: '小红书', style: '精致种草风格，像姐妹聊天一样真诚分享，可以分点列举，多用emoji增加可读性，字数200-500字', length: '200-500字' },
  weibo: { name: '微博', style: '短小精悍，有态度有个性，可以用网络流行语，带话题标签，字数140字左右', length: '100-200字' },
  douyin: { name: '抖音', style: '短平快，抓眼球，口语化强，有节奏感，适合视频配音或标题文案，字数30-80字', length: '30-80字' },
  pengyouquan: { name: '朋友圈', style: '轻松随意，像发给自己朋友看的，真实感强，不要太正式也不用太多emoji，字数50-150字', length: '50-150字' },
  instagram: { name: 'Instagram', style: '视觉导向，简洁有调性，英文+中文混搭也OK，hashtag重要，字数30-100字', length: '30-100字' },
};
const toneStyles = {
  cute: '活泼可爱，用叠词、语气词（呀、啦、嘛、哒），充满少女感',
  gentle: '温柔治愈，像睡前故事一样温暖，给人力量感',
  literary: '文艺清新，有诗意但不矫情，画面感强',
  simple: '简约大气，不啰嗦，有格调，点到为止',
  viral: '高热度爆款风格，简短有力一句话抓眼球，节奏感强，带高级感但不装腔，容易引发点赞收藏转发，字数控制在30-80字',
};
const contentTypeStyles = {
  promotion: '产品推广/种草文案，突出产品亮点和使用感受',
  daily: '日常生活分享，记录美好瞬间',
  mood: '心情语录，表达情感和感悟',
  food: '美食探店分享，描述味道和体验',
  travel: '旅行攻略/游记，分享美景和旅行tips',
  love: '恋爱专属标题，抖音高播放量恋爱视频的标题风格，简短心动感，适合用作视频标题、封面文字、朋友圈秀恩爱文案',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const tryParse = (text) => {
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) {
    try { return JSON.parse(m[0]); } catch {}
    try { return JSON.parse(m[0].replace(/"hashtags"\s*:\s*\[([^\]]*)\]/, (_, tags) => {
      const parts = tags.match(/#[^\s",\]]+/g) || [];
      return `"hashtags":[${parts.map(t => `"${t.replace(/,/g,'')}"`).join(',')}]`;
    })); } catch {}
  }
  const copyM = cleaned.match(/"copy"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (copyM) return { copy: copyM[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'), hashtags: [], tip: '' };
  return null;
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, corsHeaders); res.end(); return; }
  if (req.method !== 'POST') { res.writeHead(405, corsHeaders); res.end(JSON.stringify({ error: '只支持 POST 请求哦~' })); return; }

  try {
    const body = await new Promise((resolve) => {
      let data = '';
      req.on('data', (chunk) => { data += chunk; });
      req.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve({}); } });
    });

    const isGuided = body.mode === 'guided';

    if (isGuided) {
      // ========== 引导模式 ==========
      const { theme, themeName, themeEmoji, platform, answers } = body;
      const platformInfo = platformStyles[platform] || platformStyles.xiaohongshu;

      // Format answers as readable conversation
      const qaText = answers.map((a) => `Q: ${a.question}\nA: ${a.answer || '(未填)'}`).join('\n');

      const systemPrompt = `你是一个顶级的社交媒体内容策划师兼文案写手，名字叫"小喵"。你的任务分两步：

第一步：根据用户的回答，创作一个「内容设计框架」。框架必须自然像朋友分享心得，不要用"建议如下"这种AI句式。包含：
- 拍摄/视觉建议（光线、构图、角度、场景等）
- 推荐BGM或音乐氛围（可以具体到风格，偶尔提歌名）
- 色调/滤镜方向（具体色调描述，不要只说"暖色调"）
- 剪辑/排版节奏（怎么裁剪、转场、文字排版）
- 内容结构建议（开头→中间→结尾怎么安排）

第二步：基于设计框架，写一条${platformInfo.name}文案。
文案铁律——必须像真人写的：
- 句子有长有短，像聊天一样自然
- 绝对不用"总的来说""让我们一起来看看""在这个快节奏的时代"等AI套话
- emoji作点缀（一句最多一个），不堆砌
- 有态度有个性，像他/她朋友写的而不是机器人
- 字数适合${platformInfo.name}平台（${platformInfo.length}）

输出必须是合法JSON（不要markdown包裹）：
{"framework":{"shooting":"...","music":"...","colorTone":"...","editing":"...","structure":"..."},"copy":"文案正文","hashtags":["#标签1","#标签2"],"tip":"一条实用小建议"}`;

      const userPrompt = `用户想做「${themeEmoji} ${themeName}」主题的内容，发在${platformInfo.name}平台。
我与用户的问答记录：
${qaText}

请先给出设计框架，再生成文案。记住：自然得像人写的，不要AI腔。只输出JSON。`;

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
          max_tokens: 1536,
          temperature: 0.88,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || `API 返回错误 (${response.status})`);
      const raw = data.choices[0].message.content;
      const result = tryParse(raw) || { framework: {}, copy: raw, hashtags: [], tip: '' };

      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        data: {
          framework: result.framework || {},
          copy: result.copy || '',
          hashtags: result.hashtags || [],
          tip: result.tip || '',
          theme,
          themeName,
          themeEmoji,
          platform,
          answers,
        },
      }));
      return;
    }

    // ========== 快速生成模式（原逻辑） ==========
    const { keywords, platform, tone, contentType } = body;
    if (!keywords || !keywords.trim()) {
      res.writeHead(400, corsHeaders);
      res.end(JSON.stringify({ error: '请输入关键词或主题哦~ 🐱' }));
      return;
    }

    const platformInfo = platformStyles[platform] || platformStyles.xiaohongshu;
    const toneInfo = toneStyles[tone] || toneStyles.cute;
    const typeInfo = contentTypeStyles[contentType] || contentTypeStyles.daily;

    const isLove = contentType === 'love';
    const length = isLove ? '10-50字' : (tone === 'viral' ? '30-80字' : platformInfo.length);
    const platformStyle = isLove
      ? `抖音高播放量恋爱视频的标题风格，一句话让人心动，像百万点赞视频的文案`
      : (tone === 'viral' ? `${platformInfo.style}，但文案要极其简短精炼，控制在${length}` : platformInfo.style);

    const systemPrompt = `你是一个顶尖的社交媒体文案写手，名字叫"小喵"。你的文案特点是：
- 像真人写的，完全看不出AI痕迹
- 会根据不同平台调整语气和格式
- 懂得用恰到好处的emoji
- 口语化、有温度、有个性
- 拒绝套话、拒绝"姐妹们谁懂啊"之类过度使用的话术
${tone === 'viral' ? '- 文案极其简短，一句话就能抓住人心，像高级杂志标题一样有质感\n- 节奏感强，留白多，每个字都有分量' : ''}
${isLove ? '- 专门写恋爱/情侣标题，从抖音高播放量恋爱视频中汲取灵感\n- 一句话让人心跳加速，甜而不腻，有高级心动感\n- 像百万点赞恋爱视频的封面标题，又像朋友圈秀恩爱的神仙文案\n- 参考风格：\n  "原来被爱的感觉是这样"\n  "他看我的眼神里有星星"\n  "在一起的第365天，依然心动"\n  "遇见你之后，所有的风景都温柔了"\n  "不是将就，是恰好是你"' : ''}

你总是以JSON格式返回结果，格式为：
{"copy": "文案正文", "hashtags": ["#标签1", "#标签2", "#标签3"], "tip": "一条给用户的文案小建议"}`;

    const userPrompt = `请帮我写一条社交媒体文案：

平台：${platformInfo.name}（${platformStyle}）
文案风格：${toneInfo}
文案类型：${typeInfo}
关键词/主题：${keywords.trim()}

请生成符合以上要求的文案。记住：${isLove ? '\n最重要：这是恋爱专属标题！要像抖音百万点赞恋爱视频的封面文案一样，一句话让人心动。必须简短（10-50字），甜而有高级感，像真实高播放量视频的标题，不是土味情话！' : ''}${tone === 'viral' && !isLove ? '\n最重要：文案要极简短，不超过80字，像爆款帖子一样有冲击力，一句话就能让人想点赞收藏转发。有高级感但不冷冰冰。' : ''}
1. 语言要自然，像真人随手写的，千万不能有AI翻译腔
2. 不要用"让我们一起来看看"、"总的来说"这类AI常用句式${isLove ? '\n2.5. 不要写土味情话！要有真正心动感，像抖音高赞恋爱视频的标题字幕' : ''}
3. emoji用在该用的地方，不要每一句都加
4. 文案长度${isLove ? '控制在10-50字，越短越有冲击力，一句话就够了' : `适合${platformInfo.name}平台（${length}）${tone === 'viral' ? '，越短越好，留白即高级' : ''}`}
5. 标签要实用、有热度${isLove ? '\n6. 每条都是独立的恋爱标题，适合配情侣合照、牵手照、甜蜜瞬间' : ''}

直接返回JSON，不要其他内容。`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        max_tokens: 1024,
        temperature: 0.9,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || `API 返回错误 (${response.status})`);
    const raw = data.choices[0].message.content;
    const result = tryParse(raw) || { copy: raw, hashtags: [], tip: '文案已生成~' };

    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({
      success: true,
      data: { copy: result.copy || '', hashtags: result.hashtags || [], tip: result.tip || '', platform: platformInfo.name, tone, contentType, keywords: keywords.trim() },
    }));
  } catch (error) {
    console.error('Generate error:', error);
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ error: '生成失败啦~ 请稍后再试试喵 🐱', detail: error.message }));
  }
};
