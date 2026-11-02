// Test-only provider. Run under DSH's bundled Electron Node runtime.
const runtime = process.env.CT_DSH_ASAR || '/Applications/DeepSeek Harness.app/Contents/Resources/app.asar';
const { LlmAdapter } = await import(`${runtime}/dsh/node_modules/@deepseek-ai/dsh-llm/lib/index.js`);
export const inject = ['llm'];
class LocalAdapter extends LlmAdapter {
  async listModels(provider) { return [{ provider, id: 'fixture', name: '本地验收模型', contextWindow: 100000, maxTokens: 4096 }]; }
  async resolveModel(provider, id) { return { provider, id, name: '本地验收模型', contextWindow: 100000, maxTokens: 4096 }; }
  async *stream(options) {
    const prompt = options.messages.findLast(m => m.role === 'user')?.content?.filter(b => b.type === 'text').map(b => b.text).join(' ') || '';
    if (prompt.includes('测试错误')) { yield { type: 'finish', reason: { kind: 'error', failure: { code: 'TEST_ERROR', message: '本地验收错误态' } } }; return; }
    const text = `本地验收回复：${prompt}\n\n此回复来自本地测试 provider，用于检查原生会话、分支上下文和输入框。`;
    yield { type: 'block-start', index: 0, blockType: 'text' };
    for (const part of text.match(/.{1,8}/gs)) { await new Promise(r => setTimeout(r, 35)); yield { type: 'text-delta', index: 0, text: part }; }
    yield { type: 'block-end', index: 0, block: { type: 'text', text } };
    yield { type: 'finish', reason: { kind: 'stop' } };
  }
}
export function apply(ctx) { ctx.effect(() => ctx.llm.registerAdapter(['ct-local'], new LocalAdapter()), 'test provider'); }
