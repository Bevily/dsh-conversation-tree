import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coalesceReads } from '../src/client/requests.js';
test('many message rows share one pending lookup per session, and refresh after settlement', async () => {
  let calls = 0, finish;
  const read = coalesceReads(async id => { calls++; await new Promise(resolve => { finish = resolve; }); return id; });
  const rows = Array.from({ length: 50 }, () => read('branch'));
  await Promise.resolve(); assert.equal(calls, 1);
  finish(); assert.deepEqual(await Promise.all(rows), Array(50).fill('branch'));
  const next = read('branch'); await Promise.resolve(); assert.equal(calls, 2); finish(); await next;
});
test('failed lookups can retry and different sessions are independent', async () => {
  let calls = 0;
  const read = coalesceReads(async id => { calls++; if (calls === 1) throw new Error('offline'); return id; });
  await assert.rejects(read('branch'), /offline/);
  assert.deepEqual(await Promise.all([read('branch'), read('parent')]), ['branch', 'parent']);
  assert.equal(calls, 3);
});
