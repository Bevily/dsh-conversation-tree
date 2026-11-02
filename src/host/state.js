import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

// Serialize the entire read/modify/write transaction, including agent creation.
// A rejected operation must never poison subsequent operations.
export class StateStore {
  constructor(file) { this.file = file; this.queue = Promise.resolve(); }
  async read() {
    try {
      const state = JSON.parse(await readFile(this.file, 'utf8'));
      if (state.version !== 1 || !Array.isArray(state.branches)) throw new Error('不支持的会话树状态格式');
      const ids = new Set();
      for (const row of state.branches) {
        if (!row.sessionId || !row.parentSessionId || row.sessionId === row.parentSessionId || ids.has(row.sessionId)) throw new Error('会话树状态记录无效');
        ids.add(row.sessionId);
      }
      return state;
    } catch (error) {
      if (error.code === 'ENOENT') return { version: 1, branches: [] };
      // Fail closed: never silently overwrite unreadable metadata with an empty tree.
      throw error;
    }
  }
  async write(state) {
    await mkdir(dirname(this.file), { recursive: true });
    const temp = `${this.file}.${randomUUID()}.tmp`;
    await writeFile(temp, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
    await rename(temp, this.file);
  }
  transact(operation) {
    const result = this.queue.then(async () => {
      const state = await this.read();
      return operation(state, () => this.write(state));
    });
    this.queue = result.catch(() => {});
    return result;
  }
}
