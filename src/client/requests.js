// Message action rows mount together. Share their pending session lookup,
// without caching results across turns or retaining failed requests.
export function coalesceReads(read) {
  const pending = new Map();
  return key => {
    if (!pending.has(key)) {
      const request = Promise.resolve().then(() => read(key)).finally(() => pending.delete(key));
      pending.set(key, request);
    }
    return pending.get(key);
  };
}
