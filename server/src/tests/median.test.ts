import { describe, it, expect } from 'vitest';
import { computeMedian } from '@basket/shared';

describe('computeMedian', () => {
  it('returns the middle value for odd-length arrays', () => {
    expect(computeMedian([3, 1, 2])).toBe(2);
    expect(computeMedian([5, 3, 8, 1, 4])).toBe(4);
  });

  it('returns the average of two middle values for even-length arrays', () => {
    expect(computeMedian([1, 2, 3, 4])).toBe(2.5);
    expect(computeMedian([10, 20])).toBe(15);
  });

  it('handles single value', () => {
    expect(computeMedian([42])).toBe(42);
  });

  it('throws on empty array', () => {
    expect(() => computeMedian([])).toThrow();
  });

  it('handles decimal values', () => {
    expect(computeMedian([3.5, 4.2, 3.8])).toBe(3.8);
  });
});
