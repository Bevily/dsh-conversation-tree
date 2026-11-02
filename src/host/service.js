import { randomUUID } from 'node:crypto';
import { ApiError, completedTurn, line, modelOf, seedAt, titleOf, turnsOf } from './events.js';

export function createService(ctx, store) {
  const owned = new Map();
  const resuming = new Map();
  const registry = () => ctx.get('workspaceRegistry');
  const workspaces = () => registry()?.list() ?? [];
  async function read(id) {
    const live = ctx.sessions.get(id);
    if (live) return { events: live.snapshotEvents(0), header: live.header, inheritedEventCount: live.inheritedEventCount ?? 0 };
    const data = await ctx.sessionQuery.readSession(id);
    return { ...data, header: data.session ?? data.header };
  }
  function workspaceFor(state, id) {
    const seen = new Set();
    while (id && !seen.has(id)) {
      seen.add(id);
      const workspace = workspaces().find(w => w.sessionIds.includes(id));
      if (workspace) return workspace;
      id = state.branches.find(b => b.sessionId === id)?.parentSessionId;
    }
  }
  async function composition(source) {
    const presets = ctx.get('agentPresets');
    const presetId = source.events.findLast(e => e.type === 'agent-preset/selected')?.data.agentPreset ?? source.header.agentPreset;
    const preset = presets ? await presets.resolve(presetId) : undefined;
    const selection = modelOf(source.events) ?? ctx.get('agentDefaultModel')?.currentSelection();
    return {
      presetId: preset?.id ?? presetId,
      ...(selection ? { agentOptions: selection } : {}),
      setup: async (agentCtx, agent) => {
        if (preset) await presets.mount(agentCtx, preset.id);
        // Native API installs the model-selection projection as well. The loop
        // accepts the captured agentOptions; later native composer changes win.
      },
    };
  }
  async function ensureAgent(id) {
    if (ctx.agents.get(id)) return;
    if (resuming.has(id)) return resuming.get(id);
    const pending = (async () => {
      const source = await read(id);
      const config = await composition(source);
      const handle = await ctx.agents.resume({ resumeSessionId: id, ...(config.agentOptions ? { agentOptions: config.agentOptions } : {}), setup: config.setup });
      owned.set(id, handle);
    })();
    resuming.set(id, pending);
    try { await pending; } finally { resuming.delete(id); }
  }
  async function fork(body) {
    return store.transact(async (state, save) => {
      const source = await read(body.sessionId);
      const target = completedTurn(source.events, body);
      const kind = body.kind === 'selection' ? 'selection' : 'message';
      const existing = state.branches.find(b => b.parentSessionId === body.sessionId && String(b.turn) === String(target.turn) && b.kind === kind);
      if (existing) { await ensureAgent(existing.sessionId); const workspace = workspaceFor(state, existing.parentSessionId); if (workspace) await workspace.attachSession(existing.sessionId); return { branch: existing, reused: true }; }
      const workspace = workspaceFor(state, body.sessionId);
      if (!workspace) throw new ApiError(409, '请先将父会话加入一个工作区，再创建分支。');
      const config = await composition(source);
      const sessionId = `session-${randomUUID()}`;
      const label = line(body.label) || line(target.userText) || `第 ${target.turn} 轮分支`;
      const seed = seedAt(source.events, target);
      const handle = await ctx.agents.create({
        sessionId, seed, inheritedEventCount: seed.length - 1,
        meta: { ...(source.header.cwd ? { cwd: source.header.cwd } : {}), parentSession: body.sessionId, isSeeded: true, ...(config.presetId ? { agentPreset: config.presetId } : {}) },
        ...(config.agentOptions ? { agentOptions: config.agentOptions } : {}),
        setup: async (agentCtx, agent) => {
          await config.setup(agentCtx, agent);
          agent.session.append('session/title', { title: label, messageSeqs: [], source: { kind: 'user' } });
        },
      });
      owned.set(sessionId, handle);
      await ctx.sessions.flush(handle.agent.session);
      const branch = { sessionId, parentSessionId: body.sessionId, turn: target.turn, boundarySeq: target.boundarySeq, kind, label, visible: false, workspaceId: workspace.id, createdAt: Date.now() };
      // Persist hiding metadata before workspace attachment, so a retry/restart
      // can recover an incomplete attachment without creating another Session.
      state.branches.push(branch);
      await save();
      await workspace.attachSession(sessionId);
      return { branch, reused: false };
    });
  }
  async function catalog() {
    // Only mutations belong on the transaction queue. Reading histories while
    // holding it used to block promotion behind unrelated session I/O.
    const state = await store.read();
    const sessions = new Map();
    const ids = new Set(state.branches.flatMap(b => [b.sessionId, b.parentSessionId]));
    const spaces = workspaces();
    for (const workspace of spaces) for (const id of workspace.sessionIds) ids.add(id);
    await Promise.all([...ids].map(async id => {
      try { const source = await read(id); sessions.set(id, { id, title: titleOf(source.events, source.header) }); }
      catch { sessions.set(id, { id, title: '未命名会话', unavailable: true }); }
    }));
    return { branches: state.branches, sessions: [...sessions.values()], workspaces: spaces.map(w => ({ id: w.id, title: w.title || '工作区', path: w.path, sessionIds: w.sessionIds })) };
  }
  async function branchStatus(id) {
    const state = await store.read();
    if (!state.branches.some(branch => branch.sessionId === id)) return { lastOwnMessageId: null };
    const source = await read(id);
    const own = turnsOf(source.events.slice(source.inheritedEventCount ?? 0)).filter(t => t.status === 'done' && t.assistantText.trim()).at(-1);
    return { lastOwnMessageId: own?.messageIds.at(-1) ?? null };
  }
  async function handle(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ApiError(400, '请求必须是 JSON 对象。');
    if (body.action !== 'catalog' && !/^[a-zA-Z0-9_-]{1,160}$/.test(body.sessionId ?? '')) throw new ApiError(400, '无效的会话标识。');
    switch (body.action) {
      case 'catalog': return catalog();
      case 'branch-status': return branchStatus(body.sessionId);
      case 'fork':
      case 'fork-message': return fork(body);
      case 'selection-get': return store.transact(async state => ({ branch: state.branches.find(b => b.parentSessionId === body.sessionId && String(b.turn) === String(body.turn) && b.kind === 'selection') ?? null }));
      case 'ensure': {
        const state = await store.read();
        const branch = state.branches.find(b => b.sessionId === body.sessionId);
        if (!branch) throw new ApiError(404, '分支不存在。');
        await ensureAgent(body.sessionId);
        const workspace = workspaceFor(state, branch.parentSessionId);
        if (workspace) await workspace.attachSession(branch.sessionId);
        return { branch };
      }
      case 'promote': return store.transact(async (state, save) => {
        const branch = state.branches.find(b => b.sessionId === body.sessionId);
        if (!branch) throw new ApiError(404, '分支不存在。');
        // An open branch already has a live Session; do not copy its history
        // just to confirm it exists during a view switch.
        if (!ctx.sessions.get(branch.sessionId)) await ctx.sessionQuery.readSession(branch.sessionId);
        const workspace = workspaceFor(state, branch.parentSessionId);
        if (!workspace) throw new ApiError(409, '父会话工作区已不可用。');
        if (!workspace.sessionIds.includes(branch.sessionId)) await workspace.attachSession(branch.sessionId);
        if (branch.visible !== true || branch.workspaceId !== workspace.id) {
          branch.visible = true; branch.workspaceId = workspace.id; await save();
        }
        return { branch };
      });
      case 'pin': {
        const state = await store.read();
        const branch = state.branches.find(b => b.sessionId === body.sessionId);
        if (!branch) throw new ApiError(404, '分支不存在。');
        const source = await read(branch.sessionId);
        const own = source.events.slice(source.inheritedEventCount ?? 0);
        const last = turnsOf(own).filter(t => t.status === 'done' && t.assistantText.trim()).at(-1);
        if (!last) throw new ApiError(409, '分支尚无已完成的独立回答。');
        const full = last.assistantText.trim();
        // Transparent extractive summary; no hidden model request or auto-send.
        const summary = full.length <= 2000 ? full : `${full.slice(0, 2000)}\n\n（回答较长，以上为摘录，请编辑后发送。）`;
        return { parentSessionId: branch.parentSessionId, prompt: `[分支结论 · ${branch.label}]\n\n${summary}` };
      }
      default: throw new ApiError(400, '未知的操作。');
    }
  }
  return { handle, async dispose() { await Promise.all([...owned.values()].map(h => h.dispose?.())); owned.clear(); } };
}
