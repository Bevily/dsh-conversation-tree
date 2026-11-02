import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { StateStore } from '../src/host/state.js';
import { createService } from '../src/host/service.js';
import { completedTurn, seedAt } from '../src/host/events.js';
function events() {
  return [1, 2].flatMap(turn => [
    { type: 'turn/start', data: { turn } },
    { type: 'user/message', data: { id: `u${turn}`, content: [{ type: 'text', text: `问题 ${turn}` }] } },
    { type: 'assistant/message', data: { message: { id: `a${turn}`, content: [{ type: 'text', text: `回答 ${turn}` }] } } },
    { type: 'turn/end', data: { turn, reason: { kind: 'completed' } } },
  ]).map((e, index) => ({ ...e, seq: index * 2, time: 1000 + index }));
}
async function fixture() {
  const file = join(await mkdtemp(join(tmpdir(), 'ct-test-')), 'state.json');
  const store = new StateStore(file), sessions = new Map(), agents = new Map(); let creations = 0, failAttach = false;
  sessions.set('parent', { header: { id: 'parent', cwd: '/project' }, inheritedEventCount: 0, snapshotEvents: () => events() });
  const workspace = { id: 'workspace', title: '项目', sessionIds: ['parent'], async attachSession(id) { if (failAttach) throw new Error('attach failed'); if (!this.sessionIds.includes(id)) this.sessionIds.push(id); } };
  const ctx = { sessions: { get: id => sessions.get(id), flush: async () => {} }, sessionQuery: { readSession: async id => { const s = sessions.get(id); if (!s) throw new Error('missing'); return { session: s.header, events: s.snapshotEvents(), inheritedEventCount: s.inheritedEventCount }; } }, agents: { get: id => agents.get(id), create: async options => {
    creations++; const log = [...options.seed]; const session = { header: { id: options.sessionId, ...options.meta }, inheritedEventCount: options.inheritedEventCount, snapshotEvents: () => log, append: (type, data) => log.push({ type, data, seq: log.at(-1).seq + 1, time: 2000 }) };
    const agent = { session }; const handle = { agent, dispose() {} }; await options.setup({}, agent); sessions.set(options.sessionId, session); agents.set(options.sessionId, agent); return handle;
  }, resume: async ({ resumeSessionId }) => { const agent = { session: sessions.get(resumeSessionId) }; agents.set(resumeSessionId, agent); return { agent }; } }, get: key => key === 'workspaceRegistry' ? { list: () => [workspace] } : undefined };
  return { file, store, ctx, sessions, agents, service: createService(ctx, store), creations: () => creations, failAttach: value => { failAttach = value; } };
}
test('seed uses array boundary, preserves exact prefix with non-contiguous seq', () => {
  const log = events(), target = completedTurn(log, { messageId: 'a1' }), seed = seedAt(log, target);
  assert.deepEqual(seed.slice(0, -1), log.slice(0, 4)); assert.equal(seed.at(-1).seq, 7); assert.equal(seed.at(-1).type, 'session/end-seed'); assert.equal(log.length, 8);
});
test('running or unknown turn cannot fork', () => { assert.throws(() => completedTurn(events().slice(0, -1), { turn: 2 }), /完整/); assert.throws(() => completedTurn(events(), { turn: 3 })); });
test('concurrent same-turn selection is one real agent; different turns and kinds are independent', async () => {
  const f = await fixture(), ask = turn => f.service.handle({ action: 'fork', sessionId: 'parent', turn, kind: 'selection' });
  const [a, b] = await Promise.all([ask(1), ask(1)]); assert.equal(a.branch.sessionId, b.branch.sessionId); assert.equal(f.creations(), 1);
  const c = await ask(2), d = await f.service.handle({ action: 'fork-message', sessionId: 'parent', messageId: 'a1' });
  assert.notEqual(a.branch.sessionId, c.branch.sessionId); assert.notEqual(a.branch.sessionId, d.branch.sessionId);
  assert.equal((await f.service.handle({ action: 'selection-get', sessionId: 'parent', turn: 2 })).branch.sessionId, c.branch.sessionId);
});
test('hidden metadata persists; only promote exposes the branch; restart reuses identity', async () => {
  const f = await fixture(), result = await f.service.handle({ action: 'fork', sessionId: 'parent', turn: 1, kind: 'selection' });
  assert.equal(result.branch.visible, false);
  f.agents.clear(); const restarted = createService(f.ctx, new StateStore(f.file));
  const reused = await restarted.handle({ action: 'fork', sessionId: 'parent', turn: 1, kind: 'selection' });
  assert.equal(reused.branch.sessionId, result.branch.sessionId); assert.equal(f.creations(), 1);
  await restarted.handle({ action: 'promote', sessionId: reused.branch.sessionId });
  assert.equal(JSON.parse(await readFile(f.file, 'utf8')).branches[0].visible, true);
});
test('pin excludes inherited answers and never sends to the parent', async () => {
  const f = await fixture(), { branch } = await f.service.handle({ action: 'fork', sessionId: 'parent', turn: 1 });
  await assert.rejects(f.service.handle({ action: 'pin', sessionId: branch.sessionId }), /独立回答/);
  const child = f.sessions.get(branch.sessionId);
  for (const e of events().slice(0, 4)) child.append(e.type, e.data);
  const result = await f.service.handle({ action: 'pin', sessionId: branch.sessionId });
  assert.equal(result.parentSessionId, 'parent'); assert.match(result.prompt, /回答 1/); assert.equal(f.ctx.sessions.get('parent').snapshotEvents().length, 8);
});
test('state failure does not poison subsequent transactions or erase corrupt data', async () => {
  const f = await fixture(); await assert.rejects(f.store.transact(() => { throw new Error('failure'); }));
  assert.equal(await f.store.transact(() => 42), 42);
  await writeFile(f.file, '{broken'); await assert.rejects(f.store.transact(() => {})); assert.equal(await readFile(f.file, 'utf8'), '{broken');
});
test('invalid actions and session ids are rejected', async () => { const f = await fixture(); await assert.rejects(f.service.handle({ action: 'fork', sessionId: '../escape' }), /标识/); await assert.rejects(f.service.handle({ action: 'unknown', sessionId: 'parent' }), /未知/); });
test('failed workspace attach is recovered without creating duplicate sessions', async () => {
  const f = await fixture(); f.failAttach(true);
  const request = { action: 'fork', sessionId: 'parent', turn: 1, kind: 'selection' };
  await assert.rejects(f.service.handle(request), /attach failed/);
  assert.equal((await f.store.read()).branches.length, 1);
  f.failAttach(false); const result = await f.service.handle(request);
  assert.equal(result.reused, true); assert.equal(f.creations(), 1);
});
test('branch status identifies only the last independent completed answer for pinning', async () => {
  const f = await fixture(), { branch } = await f.service.handle({ action: 'fork', sessionId: 'parent', turn: 1 });
  let status = await f.service.handle({ action: 'branch-status', sessionId: branch.sessionId });
  assert.equal(status.lastOwnMessageId, null);
  const child = f.sessions.get(branch.sessionId); for (const e of events()) child.append(e.type, e.data);
  status = await f.service.handle({ action: 'branch-status', sessionId: branch.sessionId });
  assert.equal(status.lastOwnMessageId, 'a2');
});
test('slow catalog history reads do not block promotion', async () => {
  const f = await fixture(), { branch } = await f.service.handle({ action: 'fork', sessionId: 'parent', turn: 1 });
  const workspace = f.ctx.get('workspaceRegistry').list()[0];
  workspace.sessionIds.push('slow');
  let entered, release;
  const started = new Promise(resolve => { entered = resolve; });
  const blocked = new Promise(resolve => { release = resolve; });
  const original = f.ctx.sessionQuery.readSession;
  f.ctx.sessionQuery.readSession = async id => {
    if (id !== 'slow') return original(id);
    entered(); await blocked; return { events: [], header: { id } };
  };
  const catalog = f.service.handle({ action: 'catalog' });
  await started;
  let timeout;
  try {
    const promoted = await Promise.race([
      f.service.handle({ action: 'promote', sessionId: branch.sessionId }),
      new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('promotion waited for unrelated history')), 500); }),
    ]);
    assert.equal(promoted.branch.visible, true);
  } finally { clearTimeout(timeout); release(); await catalog; }
});
test('promotion avoids live history snapshots and repeated workspace writes', async () => {
  const f = await fixture(), { branch } = await f.service.handle({ action: 'fork', sessionId: 'parent', turn: 1 });
  f.sessions.get(branch.sessionId).snapshotEvents = () => { throw new Error('promotion copied history'); };
  f.failAttach(true);
  await f.service.handle({ action: 'promote', sessionId: branch.sessionId });
  f.store.write = async () => { throw new Error('unchanged promotion rewrote metadata'); };
  await f.service.handle({ action: 'promote', sessionId: branch.sessionId });
});
test('message action status does not read unrelated session histories', async () => {
  const f = await fixture(), { branch } = await f.service.handle({ action: 'fork', sessionId: 'parent', turn: 1 });
  f.sessions.get('parent').snapshotEvents = () => { throw new Error('unrelated history read'); };
  assert.deepEqual(await f.service.handle({ action: 'branch-status', sessionId: 'parent' }), { lastOwnMessageId: null });
  assert.deepEqual(await f.service.handle({ action: 'branch-status', sessionId: branch.sessionId }), { lastOwnMessageId: null });
});
