import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import css from './style.css';
import { buildTree } from './tree-model.js';

const KIND = 'dsh-conversation-tree/branch';
const ADDRESS = 'dsh-resource://conversation-tree/session/';
function tabParams(tab) {
  let branchId;
  if (tab.contentId.startsWith(ADDRESS)) branchId = decodeURIComponent(tab.contentId.slice(ADDRESS.length));
  return { branchId, label: tab.title, ...(tab.navigation.params ?? {}) };
}
const hidden = new Set();
let revision = 0;
const listeners = new Set();
const publish = () => { revision++; for (const fn of listeners) fn(); };
const subscribe = fn => { listeners.add(fn); return () => listeners.delete(fn); };
function hiddenStyle() {
  let element = document.getElementById('ct-hidden');
  if (!element) { element = document.createElement('style'); element.id = 'ct-hidden'; document.head.append(element); }
  element.textContent = [...hidden].map(id => `[data-row-key="session:${CSS.escape(id)}"]{display:none!important}`).join('\n');
}
async function api(body) {
  const response = await fetch('/api/conversation-tree', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const payload = await response.json().catch(() => ({ error: response.status === 401 ? 'DSH 连接已过期，请刷新页面后重试。' : `请求失败（${response.status}）` }));
  if (!response.ok) throw new Error(payload.error || `请求失败（${response.status}）`);
  if (payload.branch) { payload.branch.visible === false ? hidden.add(payload.branch.sessionId) : hidden.delete(payload.branch.sessionId); hiddenStyle(); }
  if (['fork', 'fork-message', 'promote'].includes(body.action)) publish();
  return payload;
}
function Icon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M6 7v10M6 12h8a4 4 0 0 0 4-4"/><circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/></svg>;
}
function ErrorText({ error }) { return error ? <span className="ct-error" role="alert">{error}</span> : null; }
const stop = event => event.stopPropagation();
function BranchAction({ sessionId, messageId, openBranch, pin, useSession }) {
  const running = useSession(s => s.running);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [isBranch, setIsBranch] = useState(false);
  useEffect(() => { let live = true; api({ action: 'catalog' }).then(c => { if (live) setIsBranch(!running && c.branches.some(b => b.sessionId === sessionId) && c.sessions.some(s => s.id === sessionId && s.lastOwnMessageId === messageId)); }).catch(() => {}); return () => { live = false; }; }, [sessionId, messageId, running]);
  const run = async action => {
    if (busy) return; setBusy(true); setError('');
    try {
      if (action === 'pin') await pin(sessionId);
      else { const result = await api({ action: 'fork-message', sessionId, messageId }); await openBranch(result.branch); }
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return <><button type="button" className="ct-button" disabled={busy} onClick={() => run('fork')}><Icon/>{busy ? '处理中…' : '分支'}</button>{isBranch && <button type="button" className="ct-button" disabled={busy} onClick={() => run('pin')}>钉回主线</button>}<ErrorText error={error}/></>;
}
function FixedChat({ renderSlot }) { return renderSlot('conversation.session', { view: 'chat' }); }
function NativeConversation({ sessionId, useSession, useConversation, useSessions, renderFactorySlot }) {
  const session = useSession(s => s), conversation = useConversation(s => s);
  const summaryBlank = useSessions(s => s.byId[sessionId]?.blank);
  const active = conversation.activeTargets.size > 0 || (!session.blank && !session.awaitingFirstTurn) || session.running;
  const shell = active ? 'active' : session.promptAttempted ? 'engaging' : 'blank';
  const settling = shell === 'blank' && session.openState === 'loading' && summaryBlank !== true;
  const hero = shell === 'blank' && (session.openState === 'open' || summaryBlank === true);
  return renderFactorySlot('conversation.content', { variant: 'embedded', phase: settling ? 'settling' : hero ? 'hero' : 'active', hero }, { slots: { views: FixedChat } });
}
function BranchBody({ useTabInfo, sessions, conversation, SessionProvider, renderSlot }) {
  const { tab } = useTabInfo();
  const params = tabParams(tab), branchId = params.branchId;
  const [reference, setReference] = useState(null), [error, setError] = useState(''), [retry, setRetry] = useState(0);
  useEffect(() => {
    let live = true, retained;
    setReference(null); setError('');
    if (!branchId) { setError('此旧标签没有分支地址，请关闭后从原回答重新打开。'); return; }
    api({ action: 'ensure', sessionId: branchId }).then(() => {
      if (!live) return;
      retained = sessions.retain(branchId, { source: 'mainView' }); setReference(retained);
    }).catch(e => { if (live) setError(e.message); });
    return () => { live = false; retained?.release(); };
  }, [branchId, sessions, retry]);
  useEffect(() => {
    if (!reference || reference.binding.sessionId !== branchId || !params.quote) return;
    const prompt = `> ${params.quote.trim()}\n`;
    try { const result = conversation.input.requestDraftInitialization(reference.binding, { prompt, clearPreviousDraft: true, whenDraftExists: 'replace' }); if (result === 'blocked') throw new Error('输入框正在发送，请稍后重新选择原文。'); }
    catch (e) { setError(e.message); }
  }, [reference, branchId, params.quote, params.quoteToken, conversation]);
  // Scrolling is wholly native. Mounting, streaming, tab switching and docking
  // never write scrollTop or invoke the native jump-to-bottom button.
  return <div className="ct-native" data-ct-session={branchId}>{error ? <div className="ct-state"><ErrorText error={error}/><button className="ct-button" onClick={() => setRetry(n => n + 1)}>重试</button></div> : reference && reference.binding.sessionId === branchId ? <SessionProvider session={reference}>{renderSlot('conversation-tree.chat', {})}</SessionProvider> : <div className="ct-state" role="status">正在打开分支…</div>}</div>;
}
function BranchTitle({ useTabInfo, sidebarRight, promote }) {
  const { tab, panel, sidebar } = useTabInfo();
  const params = tabParams(tab);
  const anchor = useRef(null), [host, setHost] = useState(null), [docked, setDocked] = useState(false), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => {
    const header = anchor.current?.closest('[data-dockkit-float-grip]');
    const strip = anchor.current?.closest('[data-dockkit-strip]');
    if (!header && !strip) { setHost(null); return; }
    setDocked(!header);
    const floatingPane = header?.closest('[data-dockkit-float]');
    floatingPane?.classList.add('ct-branch-float');
    const holder = document.createElement('span');
    holder.className = header ? 'ct-float-actions' : 'ct-docked-actions';
    if (header) header.insertBefore(holder, header.querySelector('[data-dockkit-float-close]'));
    else strip.append(holder);
    const chip = strip ? anchor.current.closest('[data-dockkit-tab]') : null;
    const syncActive = () => holder.classList.toggle('ct-current-actions', chip?.getAttribute('aria-selected') === 'true');
    const selectionObserver = chip ? new MutationObserver(syncActive) : null;
    if (chip) { syncActive(); selectionObserver.observe(chip, { attributes: true, attributeFilter: ['aria-selected'] }); }
    const nativeDock = header?.querySelector('[data-dockkit-float-dock]');
    const previous = nativeDock?.style.display; if (nativeDock) nativeDock.style.display = 'none';
    setHost(holder);
    return () => { selectionObserver?.disconnect(); floatingPane?.classList.remove('ct-branch-float'); holder.remove(); if (nativeDock) nativeDock.style.display = previous; };
  }, [panel.id, tab.id]);
  const act = async (event, action) => {
    event.preventDefault(); event.stopPropagation(); if (busy) return;
    setError(''); setBusy(true);
    try {
      if (action === 'dock') { sidebarRight.dock(panel.id); if (!sidebarRight.isExpanded()) sidebarRight.toggleExpanded(); }
      else if (action === 'float') {
        const width = Math.min(480, window.innerWidth - 32), height = Math.min(620, window.innerHeight - 100);
        sidebarRight.float(tab.id, { x: Math.max(16, window.innerWidth - width - 32), y: 64, width, height });
        if (sidebarRight.isExpanded()) sidebarRight.toggleExpanded();
      }
      else if (docked) {
        const target = sidebarRight.focusedTarget(anchor.current);
        if (!target || !sidebarRight.isTargetCurrent(target)) throw new Error('分支面板尚未就绪，请稍后重试。');
        // Keep this native tab and its composer mounted while changing the panel mode.
        await api({ action: 'promote', sessionId: params.branchId });
        if (!sidebarRight.isTargetCurrent(target)) throw new Error('分支面板已切换，请在当前分支中重试。');
        sidebarRight.toggleFullscreen(target);
      }
      else { await promote(params.branchId); tab.actions.close(); }
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const controls = <span className="ct-title-controls" onPointerDown={stop} onClick={stop}>
    <button type="button" className="ct-button" disabled={busy} onClick={e => act(e, docked ? 'float' : 'dock')} aria-label={docked ? '退回小窗' : '侧栏'} title={docked ? '退回小窗' : '停靠到右侧栏'}><TreeIcon kind={docked ? 'window' : 'panel'}/>{!docked && '侧栏'}</button>
    <button type="button" className="ct-button" disabled={busy} onClick={e => act(e, 'full')} aria-label={docked && sidebar.fullscreen ? '还原侧栏' : '全屏'} title={docked ? sidebar.fullscreen ? '还原为右侧栏' : '展开分支面板' : '在主页面打开分支'}><TreeIcon kind={docked && sidebar.fullscreen ? 'panel' : 'expand'}/>{!docked && '全屏'}</button><ErrorText error={error}/>
  </span>;
  return <><span ref={anchor} className="ct-title" title={params.label || '分支会话'}>{params.label || '分支会话'}</span>{host ? createPortal(controls, host) : null}</>;

}
function SelectionAction({ uiSession, openBranch }) {
  const current = useSyncExternalStore(uiSession.current.subscribe, () => uiSession.current.getSnapshot()?.key);
  const [target, setTarget] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
  useEffect(() => { setTarget(null); }, [current]);
  useEffect(() => {
    const capture = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) { setTarget(null); return; }
      const range = selection.getRangeAt(0);
      const elementOf = node => node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      const start = elementOf(range.startContainer), end = elementOf(range.endContainer);
      if (start?.closest('input,textarea,[contenteditable="true"],.ct-selection')) return;
      const row = start?.closest('[data-chat-turn]');
      if (!row || end?.closest('[data-chat-turn]') !== row) { setTarget(null); return; }
      const quote = selection.toString().trim(); if (!quote) return;
      const sessionId = row.closest('[data-ct-session]')?.dataset.ctSession || current;
      const rect = range.getBoundingClientRect();
      setError(''); setTarget({ sessionId, turn: Number(row.dataset.chatTurn), quote, x: Math.max(8, Math.min(rect.left, window.innerWidth - 260)), y: Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - 80)) });
    };
    const dismiss = event => { if (!event.target.closest('.ct-selection')) setTarget(null); };
    const keyboard = event => { if (event.key === 'Escape') setTarget(null); else if (event.shiftKey) capture(); };
    document.addEventListener('pointerup', capture); document.addEventListener('keyup', keyboard); document.addEventListener('pointerdown', dismiss);
    return () => { document.removeEventListener('pointerup', capture); document.removeEventListener('keyup', keyboard); document.removeEventListener('pointerdown', dismiss); };
  }, [current]);
  if (!target) return null;
  const follow = async () => {
    if (busy) return; setBusy(true); setError('');
    try {
      const { branch } = await api({ action: 'fork', sessionId: target.sessionId, turn: target.turn, kind: 'selection', label: target.quote.replace(/\s+/g, ' ').slice(0, 64) });
      await openBranch(branch, target.quote); window.getSelection()?.removeAllRanges(); setTarget(null);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return <div className="ct-selection" style={{ left: target.x, top: target.y }} onPointerDown={e => e.preventDefault()}><button className="ct-button" disabled={busy} onClick={follow}>{busy ? '正在创建…' : '从这里追问'}</button><ErrorText error={error}/></div>;
}
function TreeIcon({ kind, ...props }) {
  const paths = {
    window: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M11 11h10v10H11z"/></>,
    panel: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/></>,
    expand: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></>,
    folder: <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3Z"/>,
    chat: <path d="M20 11.5a8 8 0 0 1-8 8H4l1.6-3.2A8 8 0 1 1 20 11.5Z"/>,
    branch: <><path d="M6 5v14m0-7h7a5 5 0 0 0 5-5"/><circle cx="6" cy="4" r="2"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="5" r="2"/></>,
    chevron: <path d="m9 5 7 7-7 7"/>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 7a7 7 0 0 1 11.5-1L20 9M4 15l2.4 3A7 7 0 0 0 18 17"/></>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
  };
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[kind]}</svg>;
}
function TreePage({ uiWorkspace, useSessions }) {
  const version = useSyncExternalStore(subscribe, () => revision);
  const nativeVersion = useSessions(s => s.ids);
  const [catalog, setCatalog] = useState(null), [error, setError] = useState(''), [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState(new Set()), [loading, setLoading] = useState(true), [opening, setOpening] = useState(null);
  useEffect(() => {
    let live = true; setLoading(true);
    api({ action: 'catalog' }).then(data => { if (live) { setCatalog(data); setError(''); } }).catch(e => { if (live) setError(e.message); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [version, nativeVersion]);
  const groups = catalog ? buildTree(catalog, query) : [];
  const toggle = key => setCollapsed(previous => { const next = new Set(previous); next.has(key) ? next.delete(key) : next.add(key); return next; });
  const expanded = key => Boolean(query.trim()) || !collapsed.has(key);
  const open = async id => { if (opening) return; setOpening(id); setError(''); try { await uiWorkspace.openSession(id); } catch (e) { setError(e.message); } finally { setOpening(null); } };
  const node = item => <li key={item.id} className="ct-tree-node">
    <div className="ct-tree-row">
      {item.children.length ? <button className="ct-tree-disclosure" disabled={Boolean(query.trim())} aria-label={`${expanded(item.id) ? '收起' : '展开'} ${item.label}`} aria-expanded={expanded(item.id)} onClick={() => toggle(item.id)}><TreeIcon kind="chevron"/></button> : <span className="ct-tree-disclosure-space"/>}
      <button className="ct-tree-link" title={item.label} disabled={opening !== null} onClick={() => open(item.id)}>
        <span className={`ct-node-icon${item.branch ? ' ct-node-branch' : ''}`}><TreeIcon kind={item.branch ? 'branch' : 'chat'}/></span>
        <span className="ct-node-label">{item.label}</span>
        {item.branch && <span className="ct-branch-tag">分支</span>}
        <span className="ct-row-arrow"><TreeIcon kind="arrow"/></span>
      </button>
    </div>
    {item.children.length > 0 && expanded(item.id) && <ul className="ct-tree-children">{item.children.map(node)}</ul>}
  </li>;
  const allKeys = [];
  function collect(items) { for (const item of items) { if (item.children.length) allKeys.push(item.id); collect(item.children); } }
  for (const group of groups) { allKeys.push(`workspace:${group.id}`); collect(group.nodes); }
  const rootCount = catalog ? buildTree(catalog).reduce((sum, group) => sum + group.nodes.filter(item => !item.branch).length, 0) : 0;
  const branchCount = catalog?.branches.filter(branch => branch.visible === true).length || 0;
  return <section className="ct-tree" aria-label="会话树"><div className="ct-tree-content">
    <header className="ct-tree-header"><div><h1>会话树</h1><p>按工作区查看会话，沿分支继续探索。</p></div><button className="ct-button ct-refresh" disabled={loading} onClick={publish} aria-label="刷新会话树" title="刷新会话树"><TreeIcon kind="refresh"/></button></header>
    <div className="ct-tree-toolbar"><label className="ct-tree-search"><TreeIcon kind="search"/><input type="search" aria-label="搜索会话与分支" placeholder="搜索会话与分支…" value={query} onChange={e => setQuery(e.target.value)}/>{query && <button className="ct-button" onClick={() => setQuery('')} aria-label="清除搜索"><TreeIcon kind="close"/></button>}</label><div className="ct-tree-expand"><button className="ct-button" disabled={!catalog || Boolean(query.trim())} onClick={() => setCollapsed(new Set())}>全部展开</button><button className="ct-button" disabled={!catalog || Boolean(query.trim())} onClick={() => setCollapsed(new Set(allKeys))}>全部收起</button></div></div>
    {error && <div className="ct-tree-error" role="alert"><span>{error}</span><button className="ct-button" disabled={loading} onClick={publish}>重试</button></div>}
    {!catalog && loading ? <div className="ct-tree-skeleton" role="status" aria-label="正在加载会话树"><i/><i/><i/></div> : catalog && <>
      <div className="ct-tree-meta" role="status">{query.trim() ? `找到 ${groups.reduce((sum, group) => sum + group.nodes.length, 0)} 组匹配会话` : `${catalog.workspaces.length} 个工作区 · ${rootCount} 个主会话 · ${branchCount} 个分支`}</div>
      <div className="ct-tree-groups">{groups.map(group => <section className="ct-workspace" key={group.id}>
        <button className="ct-workspace-heading" disabled={Boolean(query.trim())} onClick={() => toggle(`workspace:${group.id}`)} aria-expanded={expanded(`workspace:${group.id}`)}><span className="ct-workspace-chevron"><TreeIcon kind="chevron"/></span><TreeIcon kind="folder"/><span className="ct-workspace-name" title={group.path || group.title}>{group.title === 'default-workspace' ? '默认工作区' : group.title}</span><span className="ct-workspace-count">{group.nodes.length}</span></button>
        {expanded(`workspace:${group.id}`) && (group.nodes.length ? <ul className="ct-tree-roots">{group.nodes.map(node)}</ul> : <p className="ct-workspace-empty">此工作区还没有会话</p>)}
      </section>)}</div>
      {!groups.length && <div className="ct-tree-empty"><TreeIcon kind={query.trim() ? 'search' : 'chat'} width="28" height="28"/><h2>{query.trim() ? '没有找到相关会话' : '从一段会话开始'}</h2><p>{query.trim() ? '试试其他关键词，或清除搜索查看全部会话。' : '创建原生会话后，它会按工作区显示在这里。'}</p>{query && <button className="ct-button" onClick={() => setQuery('')}>清除搜索</button>}</div>}
      {!query.trim() && <footer className="ct-tree-hint"><TreeIcon kind="branch"/><span>分支在“全屏”打开后，会显示在对应会话下。</span></footer>}
    </>}
  </div></section>;
}

export default {
  inject: ['slots', 'sessions', 'conversation', 'uiSession', 'uiWorkspace', 'sidebarRight', 'sidebarRightTabs'],
  apply(ctx) {
    ctx.effect(() => { const style = document.createElement('style'); style.textContent = css; document.head.append(style); return () => { style.remove(); hidden.clear(); document.getElementById('ct-hidden')?.remove(); }; }, 'conversation-tree: styles');
    ctx.effect(() => {
      let live = true;
      const refresh = () => api({ action: 'catalog' }).then(data => { if (!live) return; hidden.clear(); for (const b of data.branches) if (b.visible !== true) hidden.add(b.sessionId); hiddenStyle(); }).catch(error => console.warn('conversation-tree:', error));
      refresh(); window.addEventListener('focus', refresh);
      return () => { live = false; window.removeEventListener('focus', refresh); };
    }, 'conversation-tree: visibility');
    const promote = async id => { await api({ action: 'promote', sessionId: id }); await ctx.uiWorkspace.openSession(id); };
    const pin = async id => {
      const result = await api({ action: 'pin', sessionId: id });
      const reference = ctx.sessions.retain(result.parentSessionId, { source: 'mainView' });
      try {
        const initialized = ctx.conversation.input.requestDraftInitialization(reference.binding, { prompt: '\n\n' + result.prompt, whenDraftExists: 'append' });
        if (initialized === 'blocked') throw new Error('主线输入框正在发送，请稍后再钉回。');
        await ctx.uiWorkspace.openSession(result.parentSessionId);
      } finally { reference.release(); }
    };
    const openBranch = async (branch, quote) => {
      const wasExpanded = ctx.sidebarRight.isExpanded();
      const activeBefore = ctx.sidebarRight.active();
      ctx.sidebarRight.openResource(ADDRESS + encodeURIComponent(branch.sessionId), { kind: KIND, ...(activeBefore?.kind === KIND ? { replaceTab: activeBefore.id } : {}), revealIfOpened: false, params: { branchId: branch.sessionId, label: branch.label, ...(quote ? { quote, quoteToken: crypto.randomUUID() } : {}) } });
      if (!wasExpanded) {
        const active = ctx.sidebarRight.active();
        if (!active || active.kind !== KIND) throw new Error('DSH 未能激活分支标签。');
        const width = Math.min(480, window.innerWidth - 32), height = Math.min(620, window.innerHeight - 100);
        ctx.sidebarRight.float(active.id, { x: Math.max(16, window.innerWidth - width - 32), y: 64, width, height });
        if (ctx.sidebarRight.isExpanded()) ctx.sidebarRight.toggleExpanded();
      }
    };
    const slot = (name, config, Component, props = {}) => ctx.effect(() => ctx.slots.inject(name, () => ctx.slots.register({ name, ...config, inject: () => props }, Component)), `conversation-tree: ${name}`);
    ctx.effect(() => ctx.sidebarRightTabs.register({ id: KIND, kind: KIND, patterns: [ADDRESS + '**'], title: address => { const id = decodeURIComponent(address.slice(ADDRESS.length)); return ctx.sessions.list.getSnapshot().byId[id]?.title || '分支会话'; }, keepMounted: true }), 'conversation-tree: tab');
    slot('sidebar.right.pane.tab', { key: KIND, children: { 'conversation-tree.chat': { kind: 'single', scope: 'session' } } }, BranchBody, { sessions: ctx.sessions, conversation: ctx.conversation });
    slot('sidebar.right.pane.tab.title', { key: KIND }, BranchTitle, { sidebarRight: ctx.sidebarRight, promote });
    slot('conversation-tree.chat', {}, NativeConversation);
    slot('conversation.chat.assistant-actions', { id: 'conversation-tree', order: 80 }, BranchAction, { openBranch, pin });
    slot('shell.overlay', { id: 'conversation-tree-selection', order: 84 }, SelectionAction, { uiSession: ctx.uiSession, openBranch });
    slot('sidebar.panellist', { id: 'conversation-tree', order: 20, label: '会话树' }, Icon);
    slot('main', { key: 'conversation-tree' }, TreePage, { uiWorkspace: ctx.uiWorkspace });
  },
};
