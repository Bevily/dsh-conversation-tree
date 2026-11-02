// The native composer has one mounted editor per Session. Detach the embedded
// editor before opening the main view, retaining the binding across the handoff.
export async function openPromotedSession({ sessionId, uiWorkspace, current, detach, restore, timeoutMs = 10000 }) {
  let unsubscribe = () => {}, timer;
  try {
    await detach();
    await new Promise((resolve, reject) => {
      const check = () => { if (current.getSnapshot()?.key === sessionId) resolve(); };
      unsubscribe = current.subscribe(check);
      timer = setTimeout(() => reject(new Error('未能打开普通会话，已重新打开分支，请重试。')), timeoutMs);
      try { uiWorkspace.openSession(sessionId); check(); } catch (error) { reject(error); }
    });
  } catch (error) {
    await restore();
    throw error;
  } finally {
    clearTimeout(timer);
    unsubscribe();
  }
}
