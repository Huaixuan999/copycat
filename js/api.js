/**
 * API 调用模块
 */

const API = {
  async generate({ keywords, platform, tone, contentType }) {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords, platform, tone, contentType }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '生成失败，请稍后再试~');
    if (!data.success) throw new Error(data.error || '生成失败，请稍后再试~');
    return data.data;
  },

  /**
   * 引导模式生成（框架 + 文案）
   */
  async generateGuided(guideData) {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guideData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '生成失败，请稍后再试~');
    if (!data.success) throw new Error(data.error || '生成失败，请稍后再试~');
    return data.data;
  },
};
