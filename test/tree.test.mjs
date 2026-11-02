import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTree } from '../src/client/tree-model.js';
const catalog = {
  workspaces: [{ id: 'w', title: 'Work', sessionIds: ['root', 'hidden', 'shown', 'orphan', 'cycle'] }],
  sessions: [{ id: 'root', title: 'Native title' }],
  branches: [
    { sessionId: 'hidden', parentSessionId: 'root', label: 'Secret', visible: false },
    { sessionId: 'shown', parentSessionId: 'root', label: 'Visible child', visible: true },
    { sessionId: 'orphan', parentSessionId: 'hidden', label: 'Promoted descendant', visible: true },
    { sessionId: 'cycle', parentSessionId: 'cycle', label: 'Cycle', visible: true },
  ],
};
test('tree omits hidden ancestors and keeps promoted descendants reachable', () => {
  const [group] = buildTree(catalog);
  assert.deepEqual(group.nodes.map(n => n.id), ['root', 'orphan']);
  assert.equal(group.nodes[0].label, 'Native title');
  assert.deepEqual(group.nodes[0].children.map(n => n.id), ['shown']);
});
test('search preserves the parent chain and never reveals hidden branches', () => {
  assert.equal(buildTree(catalog, 'CHILD')[0].nodes[0].children[0].id, 'shown');
  assert.deepEqual(buildTree(catalog, 'Secret'), []);
  assert.deepEqual(buildTree(catalog, 'missing'), []);
  assert.equal(buildTree(catalog, '   ')[0].nodes.length, 2);
});
