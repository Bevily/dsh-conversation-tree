export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export const line = (s, max = 88) => typeof s === 'string' ? s.replace(/\s+/g, ' ').trim().slice(0, max) : '';
export function textOf(data) {
  const message = data?.message ?? data;
  if (typeof message?.content === 'string') return message.content;
  return (message?.content ?? []).filter(b => b.type === 'text').map(b => b.text ?? '').join('\n');
}
export function turnsOf(events) {
  const turns = []; let current;
  events.forEach((event, index) => {
    if (event.type === 'turn/start') current = { turn: event.data.turn, startIndex: index, status: 'running', messageIds: [], assistantText: '', userText: '' };
    if (!current) return;
    if (event.type === 'user/message') current.userText ||= textOf(event.data);
    if (event.type === 'assistant/message') {
      current.assistantText = textOf(event.data) || current.assistantText;
      const id = event.data?.message?.id ?? event.data?.id;
      if (id) current.messageIds.push(id);
    }
    if (event.type === 'turn/end' && event.data.turn === current.turn) {
      turns.push({ ...current, status: 'done', boundaryIndex: index, boundarySeq: event.seq }); current = undefined;
    }
  });
  if (current) turns.push(current);
  return turns;
}
export function completedTurn(events, { turn, messageId }) {
  const found = turnsOf(events).find(t => messageId ? t.messageIds.includes(messageId) : String(t.turn) === String(turn));
  if (!found || found.status !== 'done' || !found.assistantText.trim()) throw new ApiError(409, '只能从已有完整回答的轮次创建分支。');
  return found;
}
export function seedAt(events, target) {
  const prefix = structuredClone(events.slice(0, target.boundaryIndex + 1));
  prefix.push({ type: 'session/end-seed', seq: prefix.at(-1).seq + 1, time: prefix.at(-1).time, data: { inherited: true } });
  return prefix;
}
export function titleOf(events, header) {
  return line(events.findLast(e => e.type === 'session/title')?.data?.title, 120) || line(header?.title, 120) || '未命名会话';
}
export function modelOf(events) {
  return events.findLast(e => e.type === 'model/selection')?.data;
}
