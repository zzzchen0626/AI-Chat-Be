/** 阿里云百炼 OpenAI 兼容模式地址 */
export const DASHSCOPE_COMPATIBLE_BASE_URL =
  'https://dashscope.aliyuncs.com/compatible-mode/v1';

/** 从环境变量读取 Key（由 ConfigModule 加载 src/.env） */
export function requireDashscopeApiKey(): string {
  const key = process.env.DASHSCOPE_API_KEY?.trim();
  if (!key) {
    throw new Error(
      '缺少环境变量 DASHSCOPE_API_KEY，请在 src/.env 中配置阿里云百炼 API Key',
    );
  }
  return key;
}
