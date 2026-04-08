/**
 * Run async tasks over items with at most `limit` in flight at once.
 */
export async function runWithConcurrency<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  limit: number,
): Promise<R[]> {
  if (items.length === 0) return [];
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await fn(items[i]!);
    }
  }

  const workers = Math.min(Math.max(1, limit), items.length);
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return results;
}
