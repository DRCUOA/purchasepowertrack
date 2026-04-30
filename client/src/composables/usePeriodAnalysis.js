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
// ----------------------------------------------------------------- date utils
function dayIndex(yyyyMmDd) {
    // Anchor on UTC midnight to avoid DST drift.
    const d = new Date(yyyyMmDd + 'T00:00:00Z');
    return Math.floor(d.getTime() / MS_PER_DAY);
}
function dayIndexToIso(idx) {
    return new Date(idx * MS_PER_DAY).toISOString().slice(0, 10);
}
function todayDayIndex() {
    return Math.floor(Date.now() / MS_PER_DAY);
}
function formatShort(yyyyMmDd) {
    const d = new Date(yyyyMmDd + 'T00:00:00Z');
    // e.g. "25 May" — keep year off when the period falls in the current year.
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return `${d.getUTCDate()} ${months[d.getUTCMonth()]}`;
}
// ----------------------------------------------------------------- core
export function computePeriods(items, histories) {
    // 1. Anchor: earliest week_start with a canonical (= accepted) price.
    let anchorDayIdx = null;
    for (const item of items) {
        const h = histories[item.item_key];
        if (!h)
            continue;
        for (const w of h.history) {
            if (w.canonical_unit_price > 0) {
                const di = dayIndex(w.week_start);
                if (anchorDayIdx === null || di < anchorDayIdx)
                    anchorDayIdx = di;
            }
        }
    }
    if (anchorDayIdx === null) {
        return {
            anchor_date: null,
            periods: [],
            has_in_progress_period: false,
            elapsed_days: 0,
        };
    }
    // 2. Pre-sort each item's history ascending for quick range scans.
    const sortedHistory = new Map();
    for (const item of items) {
        const h = histories[item.item_key];
        if (!h)
            continue;
        sortedHistory.set(item.item_key, h.history
            .filter((w) => w.canonical_unit_price > 0)
            .map((w) => ({
            dayIdx: dayIndex(w.week_start),
            price: w.canonical_unit_price,
        }))
            .sort((a, b) => a.dayIdx - b.dayIdx));
    }
    // 3. Determine number of completed periods.
    const today = todayDayIndex();
    const elapsed = today - anchorDayIdx + 1;
    const completed = Math.max(0, Math.floor(elapsed / PERIOD_DAYS));
    const periods = [];
    for (let k = 1; k <= completed; k++) {
        const startIdx = anchorDayIdx + (k - 1) * PERIOD_DAYS;
        const endIdxExclusive = anchorDayIdx + k * PERIOD_DAYS;
        let basketTotal = 0;
        const itemsData = [];
        for (const item of items) {
            const sorted = sortedHistory.get(item.item_key) ?? [];
            const inside = sorted.filter((s) => s.dayIdx >= startIdx && s.dayIdx < endIdxExclusive);
            let avg = 0;
            let hasObs = false;
            if (inside.length > 0) {
                avg = inside.reduce((s, e) => s + e.price, 0) / inside.length;
                hasObs = true;
            }
            else {
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
//# sourceMappingURL=usePeriodAnalysis.js.map