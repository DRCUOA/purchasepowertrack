import { describe, it, expect } from 'vitest';

function calculateLineTotal(quantity: number, unitPrice: number): number {
  return Number((quantity * unitPrice).toFixed(2));
}

function calculateBasketTotal(items: Array<{ quantity: number; unit_price: number }>): number {
  return Number(
    items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0).toFixed(2)
  );
}

describe('snapshot calculations', () => {
  it('calculates line total correctly', () => {
    expect(calculateLineTotal(16, 3.49)).toBe(55.84);
    expect(calculateLineTotal(4, 2.99)).toBe(11.96);
  });

  it('calculates basket total correctly', () => {
    const items = [
      { quantity: 16, unit_price: 3.49 },
      { quantity: 4, unit_price: 2.99 },
      { quantity: 4, unit_price: 8.99 },
    ];
    expect(calculateBasketTotal(items)).toBe(103.76);
  });

  it('handles zero quantity', () => {
    expect(calculateLineTotal(0, 3.49)).toBe(0);
  });

  it('handles decimal quantities', () => {
    expect(calculateLineTotal(2.5, 4.0)).toBe(10.0);
  });
});
