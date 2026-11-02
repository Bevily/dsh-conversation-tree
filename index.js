import { homedir } from 'node:os';
import { join } from 'node:path';
import { StateStore } from './src/host/state.js';
import { createService } from './src/host/service.js';
import { ApiError } from './src/host/events.js';
export const name = 'conversation-tree';
export const inject = ['agents', 'connection', 'sessions', 'sessionQuery', 'workspaceRegistry'];
export function apply(ctx) {
  const store = new StateStore(join(process.env.DSH_HOME?.trim() || join(homedir(), '.dsh'), 'plugins', 'conversation-tree', 'state.json'));
  const service = createService(ctx, store);
  ctx.effect(() => () => service.dispose(), 'conversation-tree: agents');
  ctx.effect(() => ctx.connection.fetch.register({
    path: '/api/conversation-tree', methods: ['POST'], requestBody: 'buffered',
    fetch: async request => {
      try {
        const raw = await request.text();
        if (Buffer.byteLength(raw) > 64 * 1024) throw new ApiError(413, '请求过大。');
        let body; try { body = JSON.parse(raw); } catch { throw new ApiError(400, '请求不是合法 JSON。'); }
        return Response.json(await service.handle(body), { headers: { 'cache-control': 'no-store' } });
      } catch (error) {
        if (!(error instanceof ApiError)) ctx.logger?.warn?.(error.stack ?? String(error));
        return Response.json({ error: error instanceof ApiError ? error.message : '会话树操作失败，请查看 DSH 日志。' }, { status: error.status ?? 500, headers: { 'cache-control': 'no-store' } });
      }
    },
  }), 'conversation-tree: API');
}
