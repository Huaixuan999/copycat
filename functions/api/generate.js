// (Same as api/generate.js for Cloudflare Pages)
const platformStyles = {
  xiaohongshu: { name: '小红书', style: '精致种草风格，像姐妹聊天一样真诚分享，可以分点列举，多用emoji增加可读性，字数200-500字', length: '200-500字' },
  weibo: { name: '微博', style: '短小精悍，有态度有个性，带话题标签，字数140字左右', length: '100-200字' },
  douyin: { name: '抖音', style: '短平快抓眼球，口语化强有节奏感，适合视频标题，字数30-80字', length: '30-80字' },
  pengyouquan: { name: '朋友圈', style: '轻松随意像发给自己朋友看的，真实感强，字数50-150字', length: '50-150字' },
  instagram: { name: 'Instagram', style: '视觉导向简洁有调性，中英文混搭OK，字数30-100字', length: '30-100字' },
};
const toneStyles = {
  cute: '活泼可爱，用叠词语气词', gentle: '温柔治愈，给人力量感',
  literary: '文艺清新，有诗意', simple: '简约大气有格调',
  viral: '高热度爆款，简短有力一句话抓眼球，高级感，容易引发点赞收藏转发',
};
const contentTypeStyles = {
  promotion: '产品推广/种草', daily: '日常生活分享', mood: '心情语录',
  food: '美食探店', travel: '旅行攻略', love: '恋爱专属标题，抖音高赞视频标题风格',
};

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' };

const tryParse = (text) => {
  let c = text.replace(/```json\s*/gi,'').replace(/```\s*/g,'').trim();
  try { return JSON.parse(c); } catch {}
  const m = c.match(/\{[\s\S]*\}/); if (m) { try { return JSON.parse(m[0]); } catch {} }
  const cm = c.match(/"copy"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (cm) return { copy: cm[1].replace(/\\"/g,'"').replace(/\\n/g,'\n'), hashtags:[], tip:'' };
  return null;
};

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: '只支持 POST 请求哦~' }), { status: 405, headers: corsHeaders });

  try {
    const body = await request.json();
    const isGuided = body.mode === 'guided';

    if (isGuided) {
      const { theme, themeName, themeEmoji, platform, answers } = body;
      const platformInfo = platformStyles[platform] || platformStyles.xiaohongshu;
      const qaText = answers.map(a => `Q: ${a.question}\nA: ${a.answer || '(未填)'}`).join('\n');

      const systemPrompt = `你是一个顶级社交媒体内容策划师兼文案写手"小喵"。两步任务：
第一步：给出「内容设计框架」，像朋友分享心得一样自然。包含拍摄建议、BGM氛围、色调滤镜、剪辑排版、内容结构。
第二步：写一条${platformInfo.name}文案。
文案铁律——像真人写的：句子长短不一像聊天，不用"总的来说""让我们一起""在这个快节奏的时代"等AI套话，emoji当点缀不堆砌，有态度有个性。字数${platformInfo.length}。
只输出JSON：{"framework":{"shooting":"...","music":"...","colorTone":"...","editing":"...","structure":"..."},"copy":"文案","hashtags":["#标签"],"tip":"小建议"}`;

      const userPrompt = `用户想做「${themeEmoji} ${themeName}」内容，发${platformInfo.name}。问答记录：\n${qaText}\n请先给设计框架，再生成文案。绝对像真人写的。只输出JSON。`;

      const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}` },
        body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], max_tokens: 1536, temperature: 0.88 }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error?.message || `API错误(${resp.status})`);
      const result = tryParse(data.choices[0].message.content) || { framework:{}, copy: data.choices[0].message.content, hashtags:[], tip:'' };

      return new Response(JSON.stringify({
        success: true,
        data: { framework: result.framework || {}, copy: result.copy || '', hashtags: result.hashtags || [], tip: result.tip || '', theme, themeName, themeEmoji, platform, answers },
      }), { headers: corsHeaders });
    }

    // Quick mode
    const { keywords, platform, tone, contentType } = body;
    if (!keywords?.trim()) return new Response(JSON.stringify({ error: '请输入关键词~ 🐱' }), { status: 400, headers: corsHeaders });

    const platformInfo = platformStyles[platform] || platformStyles.xiaohongshu;
    const toneInfo = toneStyles[tone] || toneStyles.cute;
    const typeInfo = contentTypeStyles[contentType] || contentTypeStyles.daily;
    const isLove = contentType === 'love';
    const length = isLove ? '10-50字' : (tone === 'viral' ? '30-80字' : platformInfo.length);
    const pStyle = isLove ? '抖音高赞恋爱视频标题风格' : (tone === 'viral' ? `${platformInfo.style}，极简精炼` : platformInfo.style);

    const sys = `你是顶级社交媒体文案写手"小喵"。像真人写的不像AI，会调语气用emoji，口语化有温度。${tone==='viral'?'简短有冲击力像杂志标题。':''}${isLove?'专门写恋爱标题，像抖音百万点赞视频封面文案，甜而不腻有高级心动感。':''}只输出JSON：{"copy":"文案","hashtags":["#标签"],"tip":"建议"}`;

    const usr = `平台：${platformInfo.name}（${pStyle}）风格：${toneInfo} 类型：${typeInfo} 关键词：${keywords.trim()}${isLove?'\n恋爱标题要简短10-50字，不是土味情话！':''}${tone==='viral'&&!isLove?'\n极简短不超过80字！':''}\n语言要自然像真人写的，不用AI套话，emoji适度。直接返回JSON。`;

    const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }], max_tokens: 1024, temperature: 0.9 }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message || `API错误`);
    const result = tryParse(data.choices[0].message.content) || { copy: data.choices[0].message.content, hashtags:[], tip:'' };

    return new Response(JSON.stringify({
      success: true,
      data: { copy: result.copy || '', hashtags: result.hashtags || [], tip: result.tip || '', platform: platformInfo.name, tone, contentType, keywords: keywords.trim() },
    }), { headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: '生成失败啦~ 稍后再试喵 🐱', detail: error.message }), { status: 500, headers: corsHeaders });
  }
}
