/**
 * Canonical date utilities for PurchasePowerTrack.
 *
 * Storage format: ISO 8601 (TIMESTAMPTZ in Postgres, ISO strings in JSON).
 * Display format: DD-MM-YYYY / DD-MM-YYYY HH:mm (NZ day-first convention).
 *
 * Rules:
 *  - Conversion happens ONCE at the input boundary (CSV import, user input, API ingest).
 *  - Everything downstream works with the stored ISO string and only *formats* for display.
 */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

// ── Input conversion (call ONLY at ingest boundaries) ──────────────────────

const DD_MM_YYYY = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/;
const DD_MM_YYYY_TIME = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
const YYYY_MM_DD = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/;

/**
 * Parse an external date string into an ISO 8601 string for storage.
 * Accepts:
 *  - DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY (with optional HH:mm or HH:mm:ss)
 *  - YYYY-MM-DD (ISO date-only)
 *  - Full ISO 8601 strings (passed through)
 *
 * Throws on unparseable input so bad data is caught at the boundary.
 */
export function parseInputDate(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error('Empty date string');

  if (DD_MM_YYYY_TIME.test(trimmed)) {
    const [, dd, mm, yyyy, hh, mi, ss] = trimmed.match(DD_MM_YYYY_TIME)!;
    return new Date(
      Number(yyyy), Number(mm) - 1, Number(dd),
      Number(hh), Number(mi), Number(ss ?? 0),
    ).toISOString();
  }

  if (DD_MM_YYYY.test(trimmed)) {
    const [, dd, mm, yyyy] = trimmed.match(DD_MM_YYYY)!;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd)).toISOString();
  }

  if (YYYY_MM_DD.test(trimmed)) {
    const [, yyyy, mm, dd] = trimmed.match(YYYY_MM_DD)!;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd)).toISOString();
  }

  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Cannot parse date: "${trimmed}"`);
  }
  return parsed.toISOString();
}

// ── Display formatting (pure presentation, no conversion) ──────────────────

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** DD-MM-YYYY in local time. */
export function formatDate(storedDate: string): string {
  const d = new Date(storedDate);
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
}

/** DD-MM-YYYY HH:mm in local time. */
export function formatDateTime(storedDate: string): string {
  const d = new Date(storedDate);
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** "April 2026" from a stored YYYY-MM string. */
export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
}
