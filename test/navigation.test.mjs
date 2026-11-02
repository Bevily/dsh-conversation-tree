import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openPromotedSession } from '../src/client/navigation.js';
function source() {
  let key = 'parent'; const listeners = new Set();
  return { getSnapshot: () => ({ key }), subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }, select(id) { key = id; for (const fn of listeners) fn(); }, count: () => listeners.size };
}
test('promotion detaches the embedded composer before opening and waits for main selection', async () => {
  const current = source(), steps = [];
  const pending = openPromotedSession({ sessionId: 'branch', current, uiWorkspace: { openSession(id) { assert.equal(id, 'branch'); steps.push('open'); } }, detach() { steps.push('detach'); }, restore() { steps.push('restore'); } });
  await Promise.resolve(); assert.deepEqual(steps, ['detach', 'open']);
  current.select('branch'); await pending;
  assert.deepEqual(steps, ['detach', 'open']); assert.equal(current.count(), 0);
});
test('failed or timed-out main navigation restores the branch', async () => {
  for (const fail of [false, true]) {
    const current = source(); let restored = false;
    await assert.rejects(openPromotedSession({ sessionId: 'branch', current, timeoutMs: 5, uiWorkspace: { openSession() { if (fail) throw new Error('navigation failed'); } }, detach() {}, restore() { restored = true; } }));
    assert.equal(restored, true); assert.equal(current.count(), 0);
  }
});
