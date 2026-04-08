import { describe, it, expect } from 'vitest';
import { getWeekStart } from '@basket/shared';

describe('getWeekStart', () => {
  it('returns Monday for a Wednesday', () => {
    expect(getWeekStart(new Date('2026-04-08'))).toBe('2026-04-06');
  });

  it('returns Monday for a Monday', () => {
    expect(getWeekStart(new Date('2026-04-06'))).toBe('2026-04-06');
  });

  it('returns Monday for a Sunday', () => {
    expect(getWeekStart(new Date('2026-04-12'))).toBe('2026-04-06');
  });

  it('returns Monday for a Saturday', () => {
    expect(getWeekStart(new Date('2026-04-11'))).toBe('2026-04-06');
  });
});
