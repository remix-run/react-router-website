async function time<R>(fn: () => Promise<R>): Promise<[number, R]> {
  const start = Date.now();
  const ret = await fn();
  const diff = Date.now() - start;
  return [diff, ret];
}

export { time };
