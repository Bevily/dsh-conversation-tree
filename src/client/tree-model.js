// Keep hidden ancestors out of the tree, including while searching.
export function buildTree(catalog, query = '') {
  const visible = catalog.branches.filter(branch => branch.visible === true);
  const allIds = new Set(catalog.branches.map(branch => branch.sessionId));
  const branches = new Map(visible.map(branch => [branch.sessionId, branch]));
  const titles = new Map(catalog.sessions.map(session => [session.id, session.title]));
  const children = new Map();
  for (const branch of visible) {
    const siblings = children.get(branch.parentSessionId) || [];
    siblings.push(branch); children.set(branch.parentSessionId, siblings);
  }
  const search = query.trim().toLocaleLowerCase();
  function node(id, seen = new Set()) {
    if (seen.has(id)) return null;
    const path = new Set(seen).add(id), branch = branches.get(id);
    const label = branch?.label || titles.get(id) || '未命名会话';
    const nested = (children.get(id) || []).map(child => node(child.sessionId, path)).filter(Boolean);
    if (search && !label.toLocaleLowerCase().includes(search) && !nested.length) return null;
    return { id, label, branch: Boolean(branch), children: nested };
  }
  return catalog.workspaces.map(workspace => ({
    ...workspace,
    nodes: workspace.sessionIds.filter(id => !allIds.has(id) || (branches.has(id) && !branches.has(branches.get(id).parentSessionId) && allIds.has(branches.get(id).parentSessionId))).map(id => node(id)).filter(Boolean),
  })).filter(workspace => !search || workspace.nodes.length);
}
