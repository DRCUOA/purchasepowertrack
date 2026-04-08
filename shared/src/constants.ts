export const STARTER_BASKET = [
  { item_key: 'milk-2l', name: 'Standard Milk 2L', unit_label: '2L', category: 'dairy' },
  { item_key: 'bread-white-700g', name: 'White Toast Bread 700g', unit_label: '700g', category: 'bakery' },
  { item_key: 'eggs-12pk', name: 'Eggs 12 Pack', unit_label: '12 pack', category: 'dairy' },
  { item_key: 'butter-500g', name: 'Butter 500g', unit_label: '500g', category: 'dairy' },
  { item_key: 'cheese-1kg', name: 'Cheese 1kg', unit_label: '1kg', category: 'dairy' },
  { item_key: 'rice-1kg', name: 'Rice 1kg', unit_label: '1kg', category: 'pantry' },
  { item_key: 'flour-plain-1.5kg', name: 'Plain Flour 1.5kg', unit_label: '1.5kg', category: 'pantry' },
  { item_key: 'sugar-white-1.5kg', name: 'White Sugar 1.5kg', unit_label: '1.5kg', category: 'pantry' },
  { item_key: 'bananas-kg', name: 'Bananas per kg', unit_label: 'per kg', category: 'produce' },
  { item_key: 'apples-kg', name: 'Apples per kg', unit_label: 'per kg', category: 'produce' },
  { item_key: 'onions-brown-kg', name: 'Brown Onions per kg', unit_label: 'per kg', category: 'produce' },
  { item_key: 'potatoes-kg', name: 'Potatoes per kg', unit_label: 'per kg', category: 'produce' },
] as const;

export const DEFAULT_MONTHLY_QUANTITIES: Record<string, number> = {
  'milk-2l': 16,
  'bread-white-700g': 4,
  'eggs-12pk': 4,
  'butter-500g': 2,
  'cheese-1kg': 2,
  'rice-1kg': 2,
  'flour-plain-1.5kg': 1,
  'sugar-white-1.5kg': 1,
  'bananas-kg': 4,
  'apples-kg': 3,
  'onions-brown-kg': 2,
  'potatoes-kg': 4,
};

export const RETAILERS = ['woolworths', 'paknsave'] as const;
export type RetailerKey = (typeof RETAILERS)[number];

export function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function computeMedian(values: number[]): number {
  if (values.length === 0) throw new Error('Cannot compute median of empty array');
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
}
