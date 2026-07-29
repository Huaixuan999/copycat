/**
 * API 调用模块
 * 调用后端 /api/generate 获取 AI 文案
 */

const API = {
  /**
   * 生成文案
   * @param {Object} params
   * @param {string} params.keywords - 关键词
   * @param {string} params.platform - 平台
   * @param {string} params.tone - 风格
   * @param {string} params.contentType - 内容类型
   * @returns {Promise<Object>}
   */
  async generate({ keywords, platform, tone, contentType }) {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords, platform, tone, contentType }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '生成失败，请稍后再试~');
    }

    if (!data.success) {
      throw new Error(data.error || '生成失败，请稍后再试~');
    }

    return data.data;
  },
};
