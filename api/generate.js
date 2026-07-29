// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// Platform style descriptions
const platformStyles = {
  xiaohongshu: {
    name: '小红书',
    style: '精致种草风格，像姐妹聊天一样真诚分享，可以分点列举，多用emoji增加可读性，字数200-500字',
    length: '200-500字',
  },
  weibo: {
    name: '微博',
    style: '短小精悍，有态度有个性，可以用网络流行语，带话题标签，字数140字左右',
    length: '100-200字',
  },
  douyin: {
    name: '抖音',
    style: '短平快，抓眼球，口语化强，有节奏感，适合视频配音或标题文案，字数30-80字',
    length: '30-80字',
  },
  pengyouquan: {
    name: '朋友圈',
    style: '轻松随意，像发给自己朋友看的，真实感强，不要太正式也不用太多emoji，字数50-150字',
    length: '50-150字',
  },
  instagram: {
    name: 'Instagram',
    style: '视觉导向，简洁有调性，英文+中文混搭也OK，hashtag重要，字数30-100字',
    length: '30-100字',
  },
};

// Tone descriptions
const toneStyles = {
  cute: '活泼可爱，用叠词、语气词（呀、啦、嘛、哒），充满少女感',
  gentle: '温柔治愈，像睡前故事一样温暖，给人力量感',
  literary: '文艺清新，有诗意但不矫情，画面感强',
  simple: '简约大气，不啰嗦，有格调，点到为止',
  viral: '高热度爆款风格，简短有力一句话抓眼球，节奏感强，带高级感但不装腔，容易引发点赞收藏转发，字数控制在30-80字',
};

// Content type descriptions
const contentTypeStyles = {
  promotion: '产品推广/种草文案，突出产品亮点和使用感受',
  daily: '日常生活分享，记录美好瞬间',
  mood: '心情语录，表达情感和感悟',
  food: '美食探店分享，描述味道和体验',
  travel: '旅行攻略/游记，分享美景和旅行tips',
};

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, headers);
    res.end(JSON.stringify({ error: '只支持 POST 请求哦~' }));
    return;
  }

  try {
    const { keywords, platform, tone, contentType } = req.body;

    if (!keywords || !keywords.trim()) {
      res.writeHead(400, headers);
      res.end(JSON.stringify({ error: '请输入关键词或主题哦~ 🐱' }));
      return;
    }

    const platformInfo = platformStyles[platform] || platformStyles.xiaohongshu;
    const toneInfo = toneStyles[tone] || toneStyles.cute;
    const typeInfo = contentTypeStyles[contentType] || contentTypeStyles.daily;

    // 高热度爆款风格覆盖：简短有力
    const length = tone === 'viral' ? '30-80字' : platformInfo.length;
    const platformStyle = tone === 'viral'
      ? `${platformInfo.style}，但文案要极其简短精炼，控制在${length}`
      : platformInfo.style;

    const systemPrompt = `你是一个顶尖的社交媒体文案写手，名字叫"小喵"。你的文案特点是：
- 像真人写的，完全看不出AI痕迹
- 会根据不同平台调整语气和格式
- 懂得用恰到好处的emoji
- 口语化、有温度、有个性
- 拒绝套话、拒绝"姐妹们谁懂啊"之类过度使用的话术
${tone === 'viral' ? '- 文案极其简短，一句话就能抓住人心，像高级杂志标题一样有质感\n- 节奏感强，留白多，每个字都有分量' : ''}

你总是以JSON格式返回结果，格式为：
{"copy": "文案正文", "hashtags": ["#标签1", "#标签2", "#标签3"], "tip": "一条给用户的文案小建议"}`;

    const userPrompt = `请帮我写一条社交媒体文案：

平台：${platformInfo.name}（${platformStyle}）
文案风格：${toneInfo}
文案类型：${typeInfo}
关键词/主题：${keywords.trim()}

请生成符合以上要求的文案。记住：${tone === 'viral' ? '\n最重要：文案要极简短，不超过80字，像爆款帖子一样有冲击力，一句话就能让人想点赞收藏转发。有高级感但不冷冰冰。' : ''}
1. 语言要自然，像真人随手写的，千万不能有AI翻译腔
2. 不要用"让我们一起来看看"、"总的来说"这类AI常用句式
3. emoji用在该用的地方，不要每一句都加
4. 文案长度适合${platformInfo.name}平台（${length}）${tone === 'viral' ? '，越短越好，留白即高级' : ''}
5. 标签要实用、有热度

直接返回JSON，不要其他内容。`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1024,
        temperature: 0.9,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `API 返回错误 (${response.status})`);
    }

    const text = data.choices[0].message.content;
    let result;

    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = { copy: text, hashtags: [], tip: '文案已生成~' };
      }
    } catch {
      result = { copy: text, hashtags: [], tip: '文案已生成~' };
    }

    res.writeHead(200, headers);
    res.end(
      JSON.stringify({
        success: true,
        data: {
          copy: result.copy || '',
          hashtags: result.hashtags || [],
          tip: result.tip || '',
          platform: platformInfo.name,
          tone,
          contentType,
          keywords: keywords.trim(),
        },
      })
    );
  } catch (error) {
    console.error('Generate error:', error);

    res.writeHead(500, headers);
    res.end(
      JSON.stringify({
        error: '生成失败啦~ 请稍后再试试喵 🐱',
        detail: error.message,
      })
    );
  }
};
