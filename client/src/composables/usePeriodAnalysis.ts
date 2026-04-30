import type {
  BasketItemWithQuantity,
  PriceHistoryResponse,
} from '@basket/shared';

/**
 * Analyse view reporting unit: 20 elapsed days from the first date for which
 * accepted price data is reported. This module reaggregates the existing weekly
 * canonical_unit_price + monthly_quantity data on the client into 20-day
 * "periods" (P1, P2, ...). The database/server are unchanged.
 */

export const PERIOD_DAYS = 20;
const DAYS_PER_MONTH = 365.25 / 12; // 30.4375
/** Conversion factor: monthly_quantity → quantity per 20-day period. */
export const QTY_FACTOR = PERIOD_DAYS / DAYS_PER_MONTH;
const MS_PER_DAY = 86_400_000;

export interface PeriodItem {
  item_key: string;
  name: string;
  unit_label: string;
  /** Mean canonical unit price observed inside the period. 0 = no data. */
  avg_unit_price: number;
  /** Dollar contribution to the basket for this period. */
  period_total: number;
  /** True when at least one weekly observation fell inside the period.
   *  False means the value was carried forward from an earlier period. */
  has_observations: boolean;
}

export interface PeriodPoint {
  /** 1-based period number. */
  index: number;
  /** Short axis label, e.g. "P1". */
  label: string;
  /** Verbose label for tooltips, e.g. "Period 3 · 25 May – 13 Jun". */
  tooltipTitle: string;
  start_date: string; // YYYY-MM-DD inclusive
  end_date: string; // YYYY-MM-DD inclusive (last day of period)
  basket_total: number;
  /** Index relative to P1 = 100. */
  index_value: number;
  items: PeriodItem[];
}

export interface PeriodAnalysis {
  anchor_date: string | null;
  periods: PeriodPoint[];
  /** True when there is partial data accumulating beyond the last completed period. */
  has_in_progress_period: boolean;
  /** Total elapsed days since anchor (inclusive of today). */
  elapsed_days: number;
}

// ----------------------------------------------------------------- date utils

const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Convert a date-ish string to a UTC day index (days since Unix epoch).
 *
 * Robust to the formats the API actually emits: bare "YYYY-MM-DD",
 * "YYYY-MM-DDTHH:MM:SS.sssZ" (Postgres DATE → JSON), and "YYYY-MM-DD HH:MM:SS".
 * Returns NaN for anything we can't parse so callers can skip it.
 */
function dayIndex(s: string | null | undefined): number {
  if (!s) return NaN;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return NaN;
  const ms = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(ms)) return NaN;
  return Math.floor(ms / MS_PER_DAY);
}

function dayIndexToIso(idx: number): string {
  if (!Number.isFinite(idx)) return '';
  const d = new Date(idx * MS_PER_DAY);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function todayDayIndex(): number {
  return Math.floor(Date.now() / MS_PER_DAY);
}

function formatShort(yyyyMmDd: string): string {
  if (!yyyyMmDd) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(yyyyMmDd);
  if (!m) return '—';
  const day = Number(m[3]);
  const monthIdx = Number(m[2]) - 1;
  if (!Number.isFinite(day) || monthIdx < 0 || monthIdx > 11) return '—';
  return `${day} ${MONTH_ABBR[monthIdx]}`;
}

// ----------------------------------------------------------------- core

const EMPTY_ANALYSIS: PeriodAnalysis = {
  anchor_date: null,
  periods: [],
  has_in_progress_period: false,
  elapsed_days: 0,
};

export function computePeriods(
  items: BasketItemWithQuantity[],
  histories: Record<string, PriceHistoryResponse | undefined>,
): PeriodAnalysis {
  // Top-level safety net: this function feeds a Vue render path, so it must
  // never throw. Any unexpected input shape just yields the empty analysis
  // and the UI shows the empty state.
  try {
    return computePeriodsInner(items, histories);
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.error('[usePeriodAnalysis] computePeriods failed:', err);
    }
    return EMPTY_ANALYSIS;
  }
}

function computePeriodsInner(
  items: BasketItemWithQuantity[],
  histories: Record<string, PriceHistoryResponse | undefined>,
): PeriodAnalysis {
  // 1. Anchor: earliest week_start with a canonical (= accepted) price.
  //    Skip rows whose date string we can't parse so a single bad row can't
  //    poison the comparison (NaN < anything === false, which would freeze
  //    the anchor at NaN forever).
  let anchorDayIdx: number | null = null;
  for (const item of items) {
    const h = histories[item.item_key];
    if (!h) continue;
    for (const w of h.history) {
      if (!(w.canonical_unit_price > 0)) continue;
      const di = dayIndex(w.week_start);
      if (!Number.isFinite(di)) continue;
      if (anchorDayIdx === null || di < anchorDayIdx) anchorDayIdx = di;
    }
  }
  if (anchorDayIdx === null || !Number.isFinite(anchorDayIdx)) {
    return {
      anchor_date: null,
      periods: [],
      has_in_progress_period: false,
      elapsed_days: 0,
    };
  }

  // 2. Pre-sort each item's history ascending for quick range scans.
  const sortedHistory = new Map<
    string,
    Array<{ dayIdx: number; price: number }>
  >();
  for (const item of items) {
    const h = histories[item.item_key];
    if (!h) continue;
    sortedHistory.set(
      item.item_key,
      h.history
        .filter((w) => w.canonical_unit_price > 0)
        .map((w) => ({
          dayIdx: dayIndex(w.week_start),
          price: w.canonical_unit_price,
        }))
        .filter((e) => Number.isFinite(e.dayIdx))
        .sort((a, b) => a.dayIdx - b.dayIdx),
    );
  }

  // 3. Determine number of completed periods.
  const today = todayDayIndex();
  const elapsed = today - anchorDayIdx + 1;
  const completed = Math.max(0, Math.floor(elapsed / PERIOD_DAYS));

  const periods: PeriodPoint[] = [];

  for (let k = 1; k <= completed; k++) {
    const startIdx = anchorDayIdx + (k - 1) * PERIOD_DAYS;
    const endIdxExclusive = anchorDayIdx + k * PERIOD_DAYS;

    let basketTotal = 0;
    const itemsData: PeriodItem[] = [];

    for (const item of items) {
      const sorted = sortedHistory.get(item.item_key) ?? [];
      const inside = sorted.filter(
        (s) => s.dayIdx >= startIdx && s.dayIdx < endIdxExclusive,
      );
      let avg = 0;
      let hasObs = false;
      if (inside.length > 0) {
        avg = inside.reduce((s, e) => s + e.price, 0) / inside.length;
        hasObs = true;
      } else {
        // Carry forward the most recent observation from before the period
        // so the period is comparable even when one item missed a week.
        for (let i = sorted.length - 1; i >= 0; i--) {
          if (sorted[i].dayIdx < startIdx) {
            avg = sorted[i].price;
            break;
          }
        }
      }
      const qty = (item.monthly_quantity ?? 0) * QTY_FACTOR;
      const contribution = avg * qty;
      basketTotal += contribution;
      itemsData.push({
        item_key: item.item_key,
        name: item.name,
        unit_label: item.unit_label,
        avg_unit_price: avg,
        period_total: contribution,
        has_observations: hasObs,
      });
    }

    const startIso = dayIndexToIso(startIdx);
    const endIso = dayIndexToIso(endIdxExclusive - 1);

    periods.push({
      index: k,
      label: `P${k}`,
      tooltipTitle: `Period ${k} · ${formatShort(startIso)} – ${formatShort(endIso)}`,
      start_date: startIso,
      end_date: endIso,
      basket_total: basketTotal,
      index_value: 0, // filled below
      items: itemsData,
    });
  }

  // 4. Index values relative to P1.
  if (periods.length > 0) {
    const base = periods[0].basket_total;
    for (const p of periods) {
      p.index_value = base > 0 ? (p.basket_total / base) * 100 : 100;
    }
    periods[0].index_value = 100;
  }

  return {
    anchor_date: dayIndexToIso(anchorDayIdx),
    periods,
    has_in_progress_period: elapsed > completed * PERIOD_DAYS,
    elapsed_days: elapsed,
  };
}
