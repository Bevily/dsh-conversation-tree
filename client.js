window.__ModuleLoader__.load({ id: 'dsh-conversation-tree', factory(require) { const module = { exports: {} }; const exports = module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.jsx
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_react = __toESM(require("react"), 1);
var import_react_dom = require("react-dom");

// src/client/style.css
var style_default = `/* Native DSH tokens take precedence; restrained Swiss fallback for new controls. */
.ct-button,.ct-tree,.ct-selection,.ct-native{font-family:var(--dsw-font-family,"Helvetica Neue",sans-serif);color:var(--dsw-alias-label-primary,#202124);font-size:13px;box-sizing:border-box}
.ct-button{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:4px 8px;min-height:28px;border:0;border-radius:var(--dsw-radius-sm,4px);background:transparent;color:var(--dsw-alias-label-secondary,#60646c);font:inherit;cursor:pointer;white-space:nowrap}
.ct-button:hover,.ct-tree-link:hover{background:var(--dsw-alias-interactive-bg-hover,#f7f7f8)}
.ct-button:focus-visible,.ct-tree-link:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#002fa7);outline-offset:2px}
.ct-button:disabled{opacity:.5;cursor:wait}.ct-error{display:inline-block;color:var(--dsw-alias-state-error-primary,#b42318);font-size:12px;white-space:normal;padding:4px;max-width:300px}
.ct-native{height:100%;min-height:0;display:flex;flex-direction:column;overflow:hidden;background:var(--dsw-alias-bg-base,#fff)}
.ct-native>[data-slot]{min-height:0;flex:1}
.ct-native [data-slot="conversation.input.model"],.ct-native [data-slot="conversation.input.permission"],.ct-native [data-slot="conversation.input.plan"]{display:none!important}
.ct-native [class*="workspaceControl"],.ct-native [class*="workspaceSelector"]{display:none!important}
.ct-state{padding:24px;color:var(--dsw-alias-label-secondary,#60646c)}
.ct-float-actions,.ct-title-controls{display:inline-flex;align-items:center;gap:2px;flex:none}.ct-float-actions{margin-left:auto}.ct-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ct-selection{position:fixed;z-index:1000;display:flex;align-items:center;padding:3px;border:1px solid var(--dsw-alias-border-l2,#ddd);border-radius:var(--dsw-radius-sm,4px);background:var(--dsw-alias-bg-base,#fff);max-width:min(420px,calc(100vw - 16px))}
/* The page fills the native main slot; only the reading column is bounded. */
.ct-tree{width:100%;flex:1;min-width:0;height:100%;overflow:auto;background:var(--dsw-alias-bg-base,#fff)}
.ct-tree-content{box-sizing:border-box;width:100%;max-width:1120px;margin:0 auto;padding:40px 48px 32px}
.ct-tree button,.ct-tree input{font:inherit}
.ct-tree-header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:28px}
.ct-tree h1{font-size:24px;line-height:32px;font-weight:600;letter-spacing:-.4px;margin:0}
.ct-tree-header p{margin:8px 0 0;color:var(--dsw-alias-label-secondary,#60646c);line-height:20px}
.ct-refresh{width:32px;height:32px;border:1px solid var(--dsw-alias-border-l2,#e5e5e8);border-radius:var(--dsw-radius-md,8px)}
.ct-tree-toolbar{display:flex;align-items:center;gap:16px;margin-bottom:18px}
.ct-tree-search{display:flex;align-items:center;gap:8px;flex:1;min-width:0;min-height:38px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2,#e5e5e8);border-radius:var(--dsw-radius-md,8px);color:var(--dsw-alias-label-tertiary,#8b8d94);background:var(--dsw-alias-bg-layer-1,#f7f7f8)}
.ct-tree-search:focus-within{outline:2px solid var(--dsw-alias-state-business-primary,#4d6bfe);outline-offset:2px}
.ct-tree-search input{width:100%;min-width:0;padding:9px 0;border:0;outline:none;background:transparent;color:var(--dsw-alias-label-primary,#202124);line-height:20px}
.ct-tree-search input::placeholder{color:var(--dsw-alias-label-tertiary,#8b8d94)}
.ct-tree-search input::-webkit-search-cancel-button{display:none}
.ct-tree-search>.ct-button{padding:2px;min-height:24px}
.ct-tree-expand{display:flex;gap:2px;flex-shrink:0}
.ct-tree-meta{color:var(--dsw-alias-label-tertiary,#8b8d94);font-size:12px;line-height:20px;margin-bottom:12px}
.ct-workspace{padding:8px 0 18px;border-bottom:1px solid var(--dsw-alias-border-l2,#e5e5e8);margin-bottom:12px}
.ct-workspace-heading{display:flex;align-items:center;gap:9px;width:100%;padding:8px 10px;border:0;border-radius:var(--dsw-radius-md,8px);color:var(--dsw-alias-label-secondary,#60646c);background:transparent;text-align:left;cursor:pointer}
.ct-workspace-heading:hover,.ct-tree-disclosure:hover,.ct-tree-row:hover{background:var(--dsw-alias-interactive-bg-hover,#f3f4f6)}
.ct-workspace-name{color:var(--dsw-alias-label-primary,#202124);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ct-workspace-count{margin-left:auto;font-size:12px;color:var(--dsw-alias-label-tertiary,#8b8d94);font-variant-numeric:tabular-nums}
.ct-workspace-chevron{display:flex;width:14px;flex-shrink:0}
.ct-workspace-chevron svg{width:14px;height:14px}
.ct-workspace-heading[aria-expanded=true] .ct-workspace-chevron svg,.ct-tree-disclosure[aria-expanded=true] svg{transform:rotate(90deg)}
.ct-tree ul{list-style:none;margin:0;padding:0}
.ct-tree .ct-tree-roots{margin-top:5px}
.ct-tree-row{display:flex;align-items:center;min-width:0;border-radius:var(--dsw-radius-md,8px);padding-left:8px}
.ct-tree-disclosure,.ct-tree-disclosure-space{width:20px;height:28px;flex-shrink:0}
.ct-tree-disclosure{display:flex;align-items:center;justify-content:center;background:transparent;border:0;border-radius:4px;color:var(--dsw-alias-label-tertiary,#8b8d94);cursor:pointer;padding:0}
.ct-tree-disclosure svg{width:13px;height:13px}
.ct-tree-link{display:flex;align-items:center;gap:10px;width:100%;min-width:0;min-height:42px;padding:7px 12px 7px 8px;text-align:left;color:inherit;font:inherit;cursor:pointer;background:transparent;border:0;border-radius:var(--dsw-radius-md,8px)}
.ct-tree-link:hover{background:transparent}
.ct-node-icon{display:flex;flex-shrink:0;color:var(--dsw-alias-label-tertiary,#8b8d94)}
.ct-node-branch{color:var(--dsw-alias-label-secondary,#60646c)}
.ct-node-label{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;line-height:22px}
.ct-branch-tag{flex-shrink:0;font-size:11px;color:var(--dsw-alias-label-tertiary,#8b8d94);border:1px solid var(--dsw-alias-border-l2,#e5e5e8);border-radius:4px;padding:0 5px;line-height:18px}
.ct-row-arrow{display:flex;margin-left:auto;color:var(--dsw-alias-label-secondary,#60646c);opacity:0}
.ct-tree-link:hover .ct-row-arrow,.ct-tree-link:focus-visible .ct-row-arrow{opacity:1}
.ct-tree-link:disabled{cursor:wait;opacity:.6}
.ct-tree .ct-tree-children{margin-left:37px;padding-left:10px;border-left:1px solid var(--dsw-alias-border-l2,#e5e5e8)}
.ct-tree button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#4d6bfe);outline-offset:1px}
.ct-workspace-empty{margin:12px 38px;color:var(--dsw-alias-label-tertiary,#8b8d94)}
.ct-tree-hint{display:flex;align-items:center;gap:8px;margin-top:24px;color:var(--dsw-alias-label-tertiary,#8b8d94);font-size:12px;line-height:20px}
.ct-tree-hint svg{flex-shrink:0;width:16px;height:16px}
.ct-tree-empty{display:flex;flex-direction:column;align-items:center;text-align:center;padding:64px 16px;color:var(--dsw-alias-label-tertiary,#8b8d94)}
.ct-tree-empty h2{font-size:15px;font-weight:500;margin:16px 0 0;color:var(--dsw-alias-label-primary,#202124)}
.ct-tree-empty p{margin:8px 0 12px;line-height:22px}
.ct-tree-error{display:flex;align-items:center;justify-content:space-between;gap:12px;color:var(--dsw-alias-state-error-primary,#b42318);padding:10px 12px;border:1px solid currentColor;border-radius:8px;margin-bottom:16px;overflow-wrap:anywhere}
.ct-tree-skeleton{display:flex;flex-direction:column;gap:18px;padding:24px 12px}
.ct-tree-skeleton i{display:block;height:18px;width:60%;border-radius:4px;background:var(--dsw-alias-bg-layer-1,#f1f2f4)}
.ct-tree-skeleton i:nth-child(2){width:45%;margin-left:28px}.ct-tree-skeleton i:nth-child(3){width:52%;margin-left:28px}
@media(max-width:760px){.ct-tree-content{padding:28px 24px}.ct-tree-toolbar{align-items:stretch;flex-direction:column;gap:8px}.ct-tree-expand{align-self:flex-end}.ct-tree-header{margin-bottom:22px}.ct-tree .ct-tree-children{margin-left:22px;padding-left:4px}}
@media(max-width:420px){.ct-tree-content{padding:24px 16px}.ct-branch-tag{display:none}.ct-tree h1{font-size:22px}.ct-tree .ct-tree-children{margin-left:14px}}

/* DSH 0.2.1's composer paints over the native corner grip. Keep the native
   pointer handler and persisted geometry, but put its hit area above the body. */
.ct-branch-float > [data-dockkit-float-resize]{z-index:20;width:24px;height:24px;pointer-events:auto}
.ct-branch-float > [data-dockkit-float-resize]::after{width:9px;height:9px;right:5px;bottom:5px;opacity:.65}
.ct-branch-float > [data-dockkit-float-resize]:hover::after,.ct-branch-float > [data-dockkit-float-resize]:active::after{opacity:1}

/* Explicit button surfaces distinguish float actions from the title text. */
.ct-title-controls{gap:6px;margin-inline:6px}
.ct-title-controls>.ct-button{gap:5px;min-height:26px;padding:3px 8px;border:1px solid var(--dsw-alias-border-l2,#ddd);border-radius:var(--dsw-radius-sm,5px);background:var(--dsw-alias-bg-layer-1,#f7f7f8);color:var(--dsw-alias-label-primary,#202124);font-size:12px;line-height:18px}
.ct-title-controls>.ct-button svg{width:14px;height:14px;flex-shrink:0}
.ct-title-controls>.ct-button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,#eeeef0)}
.ct-title-controls>.ct-button:active:not(:disabled){opacity:.75}

/* When a branch is selected, dedicate the dock strip to its title and actions.
   Other tabs remain in the native layout and return when the branch leaves. */
[data-dockkit-strip]:has([data-dockkit-tab][aria-selected="true"] .ct-title)>:not([data-dockkit-strip-tabs]):not(.ct-docked-actions){display:none!important}
[data-dockkit-strip]:has([data-dockkit-tab][aria-selected="true"] .ct-title) [data-dockkit-tab]:not([aria-selected="true"]),
[data-dockkit-strip]:has([data-dockkit-tab][aria-selected="true"] .ct-title) [data-dockkit-tab-close]{display:none!important}
[data-dockkit-strip]:has([data-dockkit-tab][aria-selected="true"] .ct-title) [data-dockkit-strip-tabs]{flex:1;min-width:0;overflow:hidden}
[data-dockkit-strip]:has([data-dockkit-tab][aria-selected="true"] .ct-title) [data-dockkit-tab][aria-selected="true"]{flex:1;min-width:0;max-width:none;background:transparent;box-shadow:none;border:0}
[data-dockkit-strip]:has([data-dockkit-tab][aria-selected="true"] .ct-title) [data-dockkit-tab]>:first-child{flex:1;min-width:0;max-width:none}
.ct-docked-actions{display:none;flex:none;margin-left:auto}
[data-dockkit-strip]:has([data-dockkit-tab][aria-selected="true"] .ct-title)>.ct-docked-actions.ct-current-actions{display:inline-flex}
.ct-docked-actions .ct-title-controls{gap:4px;margin-inline:4px}
.ct-docked-actions .ct-button{width:28px;height:28px;padding:5px}
.ct-docked-actions .ct-button svg{width:16px;height:16px}
`;

// src/client/tree-model.js
function buildTree(catalog, query = "") {
  const visible = catalog.branches.filter((branch) => branch.visible === true);
  const allIds = new Set(catalog.branches.map((branch) => branch.sessionId));
  const branches = new Map(visible.map((branch) => [branch.sessionId, branch]));
  const titles = new Map(catalog.sessions.map((session) => [session.id, session.title]));
  const children = /* @__PURE__ */ new Map();
  for (const branch of visible) {
    const siblings = children.get(branch.parentSessionId) || [];
    siblings.push(branch);
    children.set(branch.parentSessionId, siblings);
  }
  const search = query.trim().toLocaleLowerCase();
  function node(id, seen = /* @__PURE__ */ new Set()) {
    if (seen.has(id)) return null;
    const path = new Set(seen).add(id), branch = branches.get(id);
    const label = branch?.label || titles.get(id) || "\u672A\u547D\u540D\u4F1A\u8BDD";
    const nested = (children.get(id) || []).map((child) => node(child.sessionId, path)).filter(Boolean);
    if (search && !label.toLocaleLowerCase().includes(search) && !nested.length) return null;
    return { id, label, branch: Boolean(branch), children: nested };
  }
  return catalog.workspaces.map((workspace) => ({
    ...workspace,
    nodes: workspace.sessionIds.filter((id) => !allIds.has(id) || branches.has(id) && !branches.has(branches.get(id).parentSessionId) && allIds.has(branches.get(id).parentSessionId)).map((id) => node(id)).filter(Boolean)
  })).filter((workspace) => !search || workspace.nodes.length);
}

// src/client/index.jsx
var KIND = "dsh-conversation-tree/branch";
var ADDRESS = "dsh-resource://conversation-tree/session/";
function tabParams(tab) {
  let branchId;
  if (tab.contentId.startsWith(ADDRESS)) branchId = decodeURIComponent(tab.contentId.slice(ADDRESS.length));
  return { branchId, label: tab.title, ...tab.navigation.params ?? {} };
}
var hidden = /* @__PURE__ */ new Set();
var revision = 0;
var listeners = /* @__PURE__ */ new Set();
var publish = () => {
  revision++;
  for (const fn of listeners) fn();
};
var subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
function hiddenStyle() {
  let element = document.getElementById("ct-hidden");
  if (!element) {
    element = document.createElement("style");
    element.id = "ct-hidden";
    document.head.append(element);
  }
  element.textContent = [...hidden].map((id) => `[data-row-key="session:${CSS.escape(id)}"]{display:none!important}`).join("\n");
}
async function api(body) {
  const response = await fetch("/api/conversation-tree", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const payload = await response.json().catch(() => ({ error: response.status === 401 ? "DSH \u8FDE\u63A5\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u540E\u91CD\u8BD5\u3002" : `\u8BF7\u6C42\u5931\u8D25\uFF08${response.status}\uFF09` }));
  if (!response.ok) throw new Error(payload.error || `\u8BF7\u6C42\u5931\u8D25\uFF08${response.status}\uFF09`);
  if (payload.branch) {
    payload.branch.visible === false ? hidden.add(payload.branch.sessionId) : hidden.delete(payload.branch.sessionId);
    hiddenStyle();
  }
  if (["fork", "fork-message", "promote"].includes(body.action)) publish();
  return payload;
}
function Icon() {
  return /* @__PURE__ */ import_react.default.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", "aria-hidden": "true" }, /* @__PURE__ */ import_react.default.createElement("path", { d: "M6 7v10M6 12h8a4 4 0 0 0 4-4" }), /* @__PURE__ */ import_react.default.createElement("circle", { cx: "6", cy: "5", r: "2" }), /* @__PURE__ */ import_react.default.createElement("circle", { cx: "6", cy: "19", r: "2" }), /* @__PURE__ */ import_react.default.createElement("circle", { cx: "18", cy: "5", r: "2" }));
}
function ErrorText({ error }) {
  return error ? /* @__PURE__ */ import_react.default.createElement("span", { className: "ct-error", role: "alert" }, error) : null;
}
var stop = (event) => event.stopPropagation();
function BranchAction({ sessionId, messageId, openBranch, pin, useSession }) {
  const running = useSession((s) => s.running);
  const [busy, setBusy] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)("");
  const [isBranch, setIsBranch] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    let live = true;
    api({ action: "catalog" }).then((c) => {
      if (live) setIsBranch(!running && c.branches.some((b) => b.sessionId === sessionId) && c.sessions.some((s) => s.id === sessionId && s.lastOwnMessageId === messageId));
    }).catch(() => {
    });
    return () => {
      live = false;
    };
  }, [sessionId, messageId, running]);
  const run = async (action) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (action === "pin") await pin(sessionId);
      else {
        const result = await api({ action: "fork-message", sessionId, messageId });
        await openBranch(result.branch);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "ct-button", disabled: busy, onClick: () => run("fork") }, /* @__PURE__ */ import_react.default.createElement(Icon, null), busy ? "\u5904\u7406\u4E2D\u2026" : "\u5206\u652F"), isBranch && /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "ct-button", disabled: busy, onClick: () => run("pin") }, "\u9489\u56DE\u4E3B\u7EBF"), /* @__PURE__ */ import_react.default.createElement(ErrorText, { error }));
}
function FixedChat({ renderSlot }) {
  return renderSlot("conversation.session", { view: "chat" });
}
function NativeConversation({ sessionId, useSession, useConversation, useSessions, renderFactorySlot }) {
  const session = useSession((s) => s), conversation = useConversation((s) => s);
  const summaryBlank = useSessions((s) => s.byId[sessionId]?.blank);
  const active = conversation.activeTargets.size > 0 || !session.blank && !session.awaitingFirstTurn || session.running;
  const shell = active ? "active" : session.promptAttempted ? "engaging" : "blank";
  const settling = shell === "blank" && session.openState === "loading" && summaryBlank !== true;
  const hero = shell === "blank" && (session.openState === "open" || summaryBlank === true);
  return renderFactorySlot("conversation.content", { variant: "embedded", phase: settling ? "settling" : hero ? "hero" : "active", hero }, { slots: { views: FixedChat } });
}
function BranchBody({ useTabInfo, sessions, conversation, SessionProvider, renderSlot }) {
  const { tab } = useTabInfo();
  const params = tabParams(tab), branchId = params.branchId;
  const [reference, setReference] = (0, import_react.useState)(null), [error, setError] = (0, import_react.useState)(""), [retry, setRetry] = (0, import_react.useState)(0);
  (0, import_react.useEffect)(() => {
    let live = true, retained;
    setReference(null);
    setError("");
    if (!branchId) {
      setError("\u6B64\u65E7\u6807\u7B7E\u6CA1\u6709\u5206\u652F\u5730\u5740\uFF0C\u8BF7\u5173\u95ED\u540E\u4ECE\u539F\u56DE\u7B54\u91CD\u65B0\u6253\u5F00\u3002");
      return;
    }
    api({ action: "ensure", sessionId: branchId }).then(() => {
      if (!live) return;
      retained = sessions.retain(branchId, { source: "mainView" });
      setReference(retained);
    }).catch((e) => {
      if (live) setError(e.message);
    });
    return () => {
      live = false;
      retained?.release();
    };
  }, [branchId, sessions, retry]);
  (0, import_react.useEffect)(() => {
    if (!reference || reference.binding.sessionId !== branchId || !params.quote) return;
    const prompt = `> ${params.quote.trim()}
`;
    try {
      const result = conversation.input.requestDraftInitialization(reference.binding, { prompt, clearPreviousDraft: true, whenDraftExists: "replace" });
      if (result === "blocked") throw new Error("\u8F93\u5165\u6846\u6B63\u5728\u53D1\u9001\uFF0C\u8BF7\u7A0D\u540E\u91CD\u65B0\u9009\u62E9\u539F\u6587\u3002");
    } catch (e) {
      setError(e.message);
    }
  }, [reference, branchId, params.quote, params.quoteToken, conversation]);
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "ct-native", "data-ct-session": branchId }, error ? /* @__PURE__ */ import_react.default.createElement("div", { className: "ct-state" }, /* @__PURE__ */ import_react.default.createElement(ErrorText, { error }), /* @__PURE__ */ import_react.default.createElement("button", { className: "ct-button", onClick: () => setRetry((n) => n + 1) }, "\u91CD\u8BD5")) : reference && reference.binding.sessionId === branchId ? /* @__PURE__ */ import_react.default.createElement(SessionProvider, { session: reference }, renderSlot("conversation-tree.chat", {})) : /* @__PURE__ */ import_react.default.createElement("div", { className: "ct-state", role: "status" }, "\u6B63\u5728\u6253\u5F00\u5206\u652F\u2026"));
}
function BranchTitle({ useTabInfo, sidebarRight, promote }) {
  const { tab, panel } = useTabInfo();
  const params = tabParams(tab);
  const anchor = (0, import_react.useRef)(null), [host, setHost] = (0, import_react.useState)(null), [docked, setDocked] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)(""), [busy, setBusy] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    const header = anchor.current?.closest("[data-dockkit-float-grip]");
    const strip = anchor.current?.closest("[data-dockkit-strip]");
    if (!header && !strip) {
      setHost(null);
      return;
    }
    setDocked(!header);
    const floatingPane = header?.closest("[data-dockkit-float]");
    floatingPane?.classList.add("ct-branch-float");
    const holder = document.createElement("span");
    holder.className = header ? "ct-float-actions" : "ct-docked-actions";
    if (header) header.insertBefore(holder, header.querySelector("[data-dockkit-float-close]"));
    else strip.append(holder);
    const chip = strip ? anchor.current.closest("[data-dockkit-tab]") : null;
    const syncActive = () => holder.classList.toggle("ct-current-actions", chip?.getAttribute("aria-selected") === "true");
    const selectionObserver = chip ? new MutationObserver(syncActive) : null;
    if (chip) {
      syncActive();
      selectionObserver.observe(chip, { attributes: true, attributeFilter: ["aria-selected"] });
    }
    const nativeDock = header?.querySelector("[data-dockkit-float-dock]");
    const previous = nativeDock?.style.display;
    if (nativeDock) nativeDock.style.display = "none";
    setHost(holder);
    return () => {
      selectionObserver?.disconnect();
      floatingPane?.classList.remove("ct-branch-float");
      holder.remove();
      if (nativeDock) nativeDock.style.display = previous;
    };
  }, [panel.id, tab.id]);
  const act = async (event, action) => {
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      if (action === "dock") {
        sidebarRight.dock(panel.id);
        if (!sidebarRight.isExpanded()) sidebarRight.toggleExpanded();
      } else if (action === "float") {
        const width = Math.min(480, window.innerWidth - 32), height = Math.min(620, window.innerHeight - 100);
        sidebarRight.float(tab.id, { x: Math.max(16, window.innerWidth - width - 32), y: 64, width, height });
        if (sidebarRight.isExpanded()) sidebarRight.toggleExpanded();
      } else {
        await promote(params.branchId);
        tab.actions.close();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const controls = /* @__PURE__ */ import_react.default.createElement("span", { className: "ct-title-controls", onPointerDown: stop, onClick: stop }, /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "ct-button", disabled: busy, onClick: (e) => act(e, docked ? "float" : "dock"), "aria-label": docked ? "\u9000\u56DE\u5C0F\u7A97" : "\u4FA7\u680F", title: docked ? "\u9000\u56DE\u5C0F\u7A97" : "\u505C\u9760\u5230\u53F3\u4FA7\u680F" }, /* @__PURE__ */ import_react.default.createElement(TreeIcon, { kind: docked ? "window" : "panel" }), !docked && "\u4FA7\u680F"), /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "ct-button", disabled: busy, onClick: (e) => act(e, "full"), "aria-label": "\u5168\u5C4F", title: "\u5728\u4E3B\u9875\u9762\u6253\u5F00\u5206\u652F" }, /* @__PURE__ */ import_react.default.createElement(TreeIcon, { kind: "expand" }), !docked && "\u5168\u5C4F"), /* @__PURE__ */ import_react.default.createElement(ErrorText, { error }));
  return /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("span", { ref: anchor, className: "ct-title", title: params.label || "\u5206\u652F\u4F1A\u8BDD" }, params.label || "\u5206\u652F\u4F1A\u8BDD"), host ? (0, import_react_dom.createPortal)(controls, host) : null);
}
function SelectionAction({ uiSession, openBranch }) {
  const current = (0, import_react.useSyncExternalStore)(uiSession.current.subscribe, () => uiSession.current.getSnapshot()?.key);
  const [target, setTarget] = (0, import_react.useState)(null), [busy, setBusy] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)("");
  (0, import_react.useEffect)(() => {
    setTarget(null);
  }, [current]);
  (0, import_react.useEffect)(() => {
    const capture = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) {
        setTarget(null);
        return;
      }
      const range = selection.getRangeAt(0);
      const elementOf = (node) => node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      const start = elementOf(range.startContainer), end = elementOf(range.endContainer);
      if (start?.closest('input,textarea,[contenteditable="true"],.ct-selection')) return;
      const row = start?.closest("[data-chat-turn]");
      if (!row || end?.closest("[data-chat-turn]") !== row) {
        setTarget(null);
        return;
      }
      const quote = selection.toString().trim();
      if (!quote) return;
      const sessionId = row.closest("[data-ct-session]")?.dataset.ctSession || current;
      const rect = range.getBoundingClientRect();
      setError("");
      setTarget({ sessionId, turn: Number(row.dataset.chatTurn), quote, x: Math.max(8, Math.min(rect.left, window.innerWidth - 260)), y: Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - 80)) });
    };
    const dismiss = (event) => {
      if (!event.target.closest(".ct-selection")) setTarget(null);
    };
    const keyboard = (event) => {
      if (event.key === "Escape") setTarget(null);
      else if (event.shiftKey) capture();
    };
    document.addEventListener("pointerup", capture);
    document.addEventListener("keyup", keyboard);
    document.addEventListener("pointerdown", dismiss);
    return () => {
      document.removeEventListener("pointerup", capture);
      document.removeEventListener("keyup", keyboard);
      document.removeEventListener("pointerdown", dismiss);
    };
  }, [current]);
  if (!target) return null;
  const follow = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const { branch } = await api({ action: "fork", sessionId: target.sessionId, turn: target.turn, kind: "selection", label: target.quote.replace(/\s+/g, " ").slice(0, 64) });
      await openBranch(branch, target.quote);
      window.getSelection()?.removeAllRanges();
      setTarget(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "ct-selection", style: { left: target.x, top: target.y }, onPointerDown: (e) => e.preventDefault() }, /* @__PURE__ */ import_react.default.createElement("button", { className: "ct-button", disabled: busy, onClick: follow }, busy ? "\u6B63\u5728\u521B\u5EFA\u2026" : "\u4ECE\u8FD9\u91CC\u8FFD\u95EE"), /* @__PURE__ */ import_react.default.createElement(ErrorText, { error }));
}
function TreeIcon({ kind, ...props }) {
  const paths = {
    window: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M11 11h10v10H11z" })),
    panel: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("rect", { x: "3", y: "4", width: "18", height: "16", rx: "2" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M15 4v16" })),
    expand: /* @__PURE__ */ import_react.default.createElement("path", { d: "M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" }),
    search: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("circle", { cx: "10.5", cy: "10.5", r: "6.5" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "m16 16 4 4" })),
    folder: /* @__PURE__ */ import_react.default.createElement("path", { d: "M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3Z" }),
    chat: /* @__PURE__ */ import_react.default.createElement("path", { d: "M20 11.5a8 8 0 0 1-8 8H4l1.6-3.2A8 8 0 1 1 20 11.5Z" }),
    branch: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M6 5v14m0-7h7a5 5 0 0 0 5-5" }), /* @__PURE__ */ import_react.default.createElement("circle", { cx: "6", cy: "4", r: "2" }), /* @__PURE__ */ import_react.default.createElement("circle", { cx: "6", cy: "20", r: "2" }), /* @__PURE__ */ import_react.default.createElement("circle", { cx: "18", cy: "5", r: "2" })),
    chevron: /* @__PURE__ */ import_react.default.createElement("path", { d: "m9 5 7 7-7 7" }),
    refresh: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M20 7v5h-5M4 17v-5h5" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M6.1 7a7 7 0 0 1 11.5-1L20 9M4 15l2.4 3A7 7 0 0 0 18 17" })),
    close: /* @__PURE__ */ import_react.default.createElement("path", { d: "m6 6 12 12M6 18 18 6" }),
    arrow: /* @__PURE__ */ import_react.default.createElement("path", { d: "M5 12h14m-5-5 5 5-5 5" })
  };
  return /* @__PURE__ */ import_react.default.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", ...props }, paths[kind]);
}
function TreePage({ uiWorkspace, useSessions }) {
  const version = (0, import_react.useSyncExternalStore)(subscribe, () => revision);
  const nativeVersion = useSessions((s) => s.ids);
  const [catalog, setCatalog] = (0, import_react.useState)(null), [error, setError] = (0, import_react.useState)(""), [query, setQuery] = (0, import_react.useState)("");
  const [collapsed, setCollapsed] = (0, import_react.useState)(/* @__PURE__ */ new Set()), [loading, setLoading] = (0, import_react.useState)(true), [opening, setOpening] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    let live = true;
    setLoading(true);
    api({ action: "catalog" }).then((data) => {
      if (live) {
        setCatalog(data);
        setError("");
      }
    }).catch((e) => {
      if (live) setError(e.message);
    }).finally(() => {
      if (live) setLoading(false);
    });
    return () => {
      live = false;
    };
  }, [version, nativeVersion]);
  const groups = catalog ? buildTree(catalog, query) : [];
  const toggle = (key) => setCollapsed((previous) => {
    const next = new Set(previous);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });
  const expanded = (key) => Boolean(query.trim()) || !collapsed.has(key);
  const open = async (id) => {
    if (opening) return;
    setOpening(id);
    setError("");
    try {
      await uiWorkspace.openSession(id);
    } catch (e) {
      setError(e.message);
    } finally {
      setOpening(null);
    }
  };
  const node = (item) => /* @__PURE__ */ import_react.default.createElement("li", { key: item.id, className: "ct-tree-node" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "ct-tree-row" }, item.children.length ? /* @__PURE__ */ import_react.default.createElement("button", { className: "ct-tree-disclosure", disabled: Boolean(query.trim()), "aria-label": `${expanded(item.id) ? "\u6536\u8D77" : "\u5C55\u5F00"} ${item.label}`, "aria-expanded": expanded(item.id), onClick: () => toggle(item.id) }, /* @__PURE__ */ import_react.default.createElement(TreeIcon, { kind: "chevron" })) : /* @__PURE__ */ import_react.default.createElement("span", { className: "ct-tree-disclosure-space" }), /* @__PURE__ */ import_react.default.createElement("button", { className: "ct-tree-link", title: item.label, disabled: opening !== null, onClick: () => open(item.id) }, /* @__PURE__ */ import_react.default.createElement("span", { className: `ct-node-icon${item.branch ? " ct-node-branch" : ""}` }, /* @__PURE__ */ import_react.default.createElement(TreeIcon, { kind: item.branch ? "branch" : "chat" })), /* @__PURE__ */ import_react.default.createElement("span", { className: "ct-node-label" }, item.label), item.branch && /* @__PURE__ */ import_react.default.createElement("span", { className: "ct-branch-tag" }, "\u5206\u652F"), /* @__PURE__ */ import_react.default.createElement("span", { className: "ct-row-arrow" }, /* @__PURE__ */ import_react.default.createElement(TreeIcon, { kind: "arrow" })))), item.children.length > 0 && expanded(item.id) && /* @__PURE__ */ import_react.default.createElement("ul", { className: "ct-tree-children" }, item.children.map(node)));
  const allKeys = [];
  function collect(items) {
    for (const item of items) {
      if (item.children.length) allKeys.push(item.id);
      collect(item.children);
    }
  }
  for (const group of groups) {
    allKeys.push(`workspace:${group.id}`);
    collect(group.nodes);
  }
  const rootCount = catalog ? buildTree(catalog).reduce((sum, group) => sum + group.nodes.filter((item) => !item.branch).length, 0) : 0;
  const branchCount = catalog?.branches.filter((branch) => branch.visible === true).length || 0;
  return /* @__PURE__ */ import_react.default.createElement("section", { className: "ct-tree", "aria-label": "\u4F1A\u8BDD\u6811" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "ct-tree-content" }, /* @__PURE__ */ import_react.default.createElement("header", { className: "ct-tree-header" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("h1", null, "\u4F1A\u8BDD\u6811"), /* @__PURE__ */ import_react.default.createElement("p", null, "\u6309\u5DE5\u4F5C\u533A\u67E5\u770B\u4F1A\u8BDD\uFF0C\u6CBF\u5206\u652F\u7EE7\u7EED\u63A2\u7D22\u3002")), /* @__PURE__ */ import_react.default.createElement("button", { className: "ct-button ct-refresh", disabled: loading, onClick: publish, "aria-label": "\u5237\u65B0\u4F1A\u8BDD\u6811", title: "\u5237\u65B0\u4F1A\u8BDD\u6811" }, /* @__PURE__ */ import_react.default.createElement(TreeIcon, { kind: "refresh" }))), /* @__PURE__ */ import_react.default.createElement("div", { className: "ct-tree-toolbar" }, /* @__PURE__ */ import_react.default.createElement("label", { className: "ct-tree-search" }, /* @__PURE__ */ import_react.default.createElement(TreeIcon, { kind: "search" }), /* @__PURE__ */ import_react.default.createElement("input", { type: "search", "aria-label": "\u641C\u7D22\u4F1A\u8BDD\u4E0E\u5206\u652F", placeholder: "\u641C\u7D22\u4F1A\u8BDD\u4E0E\u5206\u652F\u2026", value: query, onChange: (e) => setQuery(e.target.value) }), query && /* @__PURE__ */ import_react.default.createElement("button", { className: "ct-button", onClick: () => setQuery(""), "aria-label": "\u6E05\u9664\u641C\u7D22" }, /* @__PURE__ */ import_react.default.createElement(TreeIcon, { kind: "close" }))), /* @__PURE__ */ import_react.default.createElement("div", { className: "ct-tree-expand" }, /* @__PURE__ */ import_react.default.createElement("button", { className: "ct-button", disabled: !catalog || Boolean(query.trim()), onClick: () => setCollapsed(/* @__PURE__ */ new Set()) }, "\u5168\u90E8\u5C55\u5F00"), /* @__PURE__ */ import_react.default.createElement("button", { className: "ct-button", disabled: !catalog || Boolean(query.trim()), onClick: () => setCollapsed(new Set(allKeys)) }, "\u5168\u90E8\u6536\u8D77"))), error && /* @__PURE__ */ import_react.default.createElement("div", { className: "ct-tree-error", role: "alert" }, /* @__PURE__ */ import_react.default.createElement("span", null, error), /* @__PURE__ */ import_react.default.createElement("button", { className: "ct-button", disabled: loading, onClick: publish }, "\u91CD\u8BD5")), !catalog && loading ? /* @__PURE__ */ import_react.default.createElement("div", { className: "ct-tree-skeleton", role: "status", "aria-label": "\u6B63\u5728\u52A0\u8F7D\u4F1A\u8BDD\u6811" }, /* @__PURE__ */ import_react.default.createElement("i", null), /* @__PURE__ */ import_react.default.createElement("i", null), /* @__PURE__ */ import_react.default.createElement("i", null)) : catalog && /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("div", { className: "ct-tree-meta", role: "status" }, query.trim() ? `\u627E\u5230 ${groups.reduce((sum, group) => sum + group.nodes.length, 0)} \u7EC4\u5339\u914D\u4F1A\u8BDD` : `${catalog.workspaces.length} \u4E2A\u5DE5\u4F5C\u533A \xB7 ${rootCount} \u4E2A\u4E3B\u4F1A\u8BDD \xB7 ${branchCount} \u4E2A\u5206\u652F`), /* @__PURE__ */ import_react.default.createElement("div", { className: "ct-tree-groups" }, groups.map((group) => /* @__PURE__ */ import_react.default.createElement("section", { className: "ct-workspace", key: group.id }, /* @__PURE__ */ import_react.default.createElement("button", { className: "ct-workspace-heading", disabled: Boolean(query.trim()), onClick: () => toggle(`workspace:${group.id}`), "aria-expanded": expanded(`workspace:${group.id}`) }, /* @__PURE__ */ import_react.default.createElement("span", { className: "ct-workspace-chevron" }, /* @__PURE__ */ import_react.default.createElement(TreeIcon, { kind: "chevron" })), /* @__PURE__ */ import_react.default.createElement(TreeIcon, { kind: "folder" }), /* @__PURE__ */ import_react.default.createElement("span", { className: "ct-workspace-name", title: group.path || group.title }, group.title === "default-workspace" ? "\u9ED8\u8BA4\u5DE5\u4F5C\u533A" : group.title), /* @__PURE__ */ import_react.default.createElement("span", { className: "ct-workspace-count" }, group.nodes.length)), expanded(`workspace:${group.id}`) && (group.nodes.length ? /* @__PURE__ */ import_react.default.createElement("ul", { className: "ct-tree-roots" }, group.nodes.map(node)) : /* @__PURE__ */ import_react.default.createElement("p", { className: "ct-workspace-empty" }, "\u6B64\u5DE5\u4F5C\u533A\u8FD8\u6CA1\u6709\u4F1A\u8BDD"))))), !groups.length && /* @__PURE__ */ import_react.default.createElement("div", { className: "ct-tree-empty" }, /* @__PURE__ */ import_react.default.createElement(TreeIcon, { kind: query.trim() ? "search" : "chat", width: "28", height: "28" }), /* @__PURE__ */ import_react.default.createElement("h2", null, query.trim() ? "\u6CA1\u6709\u627E\u5230\u76F8\u5173\u4F1A\u8BDD" : "\u4ECE\u4E00\u6BB5\u4F1A\u8BDD\u5F00\u59CB"), /* @__PURE__ */ import_react.default.createElement("p", null, query.trim() ? "\u8BD5\u8BD5\u5176\u4ED6\u5173\u952E\u8BCD\uFF0C\u6216\u6E05\u9664\u641C\u7D22\u67E5\u770B\u5168\u90E8\u4F1A\u8BDD\u3002" : "\u521B\u5EFA\u539F\u751F\u4F1A\u8BDD\u540E\uFF0C\u5B83\u4F1A\u6309\u5DE5\u4F5C\u533A\u663E\u793A\u5728\u8FD9\u91CC\u3002"), query && /* @__PURE__ */ import_react.default.createElement("button", { className: "ct-button", onClick: () => setQuery("") }, "\u6E05\u9664\u641C\u7D22")), !query.trim() && /* @__PURE__ */ import_react.default.createElement("footer", { className: "ct-tree-hint" }, /* @__PURE__ */ import_react.default.createElement(TreeIcon, { kind: "branch" }), /* @__PURE__ */ import_react.default.createElement("span", null, "\u5206\u652F\u5728\u201C\u5168\u5C4F\u201D\u6253\u5F00\u540E\uFF0C\u4F1A\u663E\u793A\u5728\u5BF9\u5E94\u4F1A\u8BDD\u4E0B\u3002")))));
}
var index_default = {
  inject: ["slots", "sessions", "conversation", "uiSession", "uiWorkspace", "sidebarRight", "sidebarRightTabs"],
  apply(ctx) {
    ctx.effect(() => {
      const style = document.createElement("style");
      style.textContent = style_default;
      document.head.append(style);
      return () => {
        style.remove();
        hidden.clear();
        document.getElementById("ct-hidden")?.remove();
      };
    }, "conversation-tree: styles");
    ctx.effect(() => {
      let live = true;
      const refresh = () => api({ action: "catalog" }).then((data) => {
        if (!live) return;
        hidden.clear();
        for (const b of data.branches) if (b.visible !== true) hidden.add(b.sessionId);
        hiddenStyle();
      }).catch((error) => console.warn("conversation-tree:", error));
      refresh();
      window.addEventListener("focus", refresh);
      return () => {
        live = false;
        window.removeEventListener("focus", refresh);
      };
    }, "conversation-tree: visibility");
    const promote = async (id) => {
      await api({ action: "promote", sessionId: id });
      await ctx.uiWorkspace.openSession(id);
    };
    const pin = async (id) => {
      const result = await api({ action: "pin", sessionId: id });
      const reference = ctx.sessions.retain(result.parentSessionId, { source: "mainView" });
      try {
        const initialized = ctx.conversation.input.requestDraftInitialization(reference.binding, { prompt: "\n\n" + result.prompt, whenDraftExists: "append" });
        if (initialized === "blocked") throw new Error("\u4E3B\u7EBF\u8F93\u5165\u6846\u6B63\u5728\u53D1\u9001\uFF0C\u8BF7\u7A0D\u540E\u518D\u9489\u56DE\u3002");
        await ctx.uiWorkspace.openSession(result.parentSessionId);
      } finally {
        reference.release();
      }
    };
    const openBranch = async (branch, quote) => {
      const wasExpanded = ctx.sidebarRight.isExpanded();
      const activeBefore = ctx.sidebarRight.active();
      ctx.sidebarRight.openResource(ADDRESS + encodeURIComponent(branch.sessionId), { kind: KIND, ...activeBefore?.kind === KIND ? { replaceTab: activeBefore.id } : {}, revealIfOpened: false, params: { branchId: branch.sessionId, label: branch.label, ...quote ? { quote, quoteToken: crypto.randomUUID() } : {} } });
      if (!wasExpanded) {
        const active = ctx.sidebarRight.active();
        if (!active || active.kind !== KIND) throw new Error("DSH \u672A\u80FD\u6FC0\u6D3B\u5206\u652F\u6807\u7B7E\u3002");
        const width = Math.min(480, window.innerWidth - 32), height = Math.min(620, window.innerHeight - 100);
        ctx.sidebarRight.float(active.id, { x: Math.max(16, window.innerWidth - width - 32), y: 64, width, height });
        if (ctx.sidebarRight.isExpanded()) ctx.sidebarRight.toggleExpanded();
      }
    };
    const slot = (name, config, Component, props = {}) => ctx.effect(() => ctx.slots.inject(name, () => ctx.slots.register({ name, ...config, inject: () => props }, Component)), `conversation-tree: ${name}`);
    ctx.effect(() => ctx.sidebarRightTabs.register({ id: KIND, kind: KIND, patterns: [ADDRESS + "**"], title: (address) => {
      const id = decodeURIComponent(address.slice(ADDRESS.length));
      return ctx.sessions.list.getSnapshot().byId[id]?.title || "\u5206\u652F\u4F1A\u8BDD";
    }, keepMounted: true }), "conversation-tree: tab");
    slot("sidebar.right.pane.tab", { key: KIND, children: { "conversation-tree.chat": { kind: "single", scope: "session" } } }, BranchBody, { sessions: ctx.sessions, conversation: ctx.conversation });
    slot("sidebar.right.pane.tab.title", { key: KIND }, BranchTitle, { sidebarRight: ctx.sidebarRight, promote });
    slot("conversation-tree.chat", {}, NativeConversation);
    slot("conversation.chat.assistant-actions", { id: "conversation-tree", order: 80 }, BranchAction, { openBranch, pin });
    slot("shell.overlay", { id: "conversation-tree-selection", order: 84 }, SelectionAction, { uiSession: ctx.uiSession, openBranch });
    slot("sidebar.panellist", { id: "conversation-tree", order: 20, label: "\u4F1A\u8BDD\u6811" }, Icon);
    slot("main", { key: "conversation-tree" }, TreePage, { uiWorkspace: ctx.uiWorkspace });
  }
};
return module.exports.default; } });
