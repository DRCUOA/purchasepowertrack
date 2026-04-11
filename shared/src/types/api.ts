import type { BasketItem, BasketItemWithQuantity } from './basket.js';
import type { PriceObservation, NormalizedPrice } from './price.js';
import type { MonthlySnapshotDetail, MonthSummary } from './snapshot.js';
import type { RunHistoryEntry } from './history.js';

// --- Error ---

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// --- Dashboard ---

export interface FlaggedItem {
  basket_item_id: number;
  item_key: string;
  name: string;
  reason: string;
}

export interface DashboardResponse {
  current_basket_total: number | null;
  previous_month_total: number | null;
  change_vs_previous: number | null;
  change_vs_previous_pct: number | null;
  baseline_month: string | null;
  baseline_total: number | null;
  change_vs_baseline: number | null;
  change_vs_baseline_pct: number | null;
  latest_refresh_date: string | null;
  item_count: number;
  flagged_items: FlaggedItem[];
}

// --- Basket Items ---

export type BasketItemsResponse = BasketItemWithQuantity[];

export interface UpdateQuantityRequest {
  monthly_quantity: number;
  effective_month: string;
}

// --- Prices ---

export interface CurrentPricesResponse {
  week_start: string;
  prices: Array<{
    basket_item_id: number;
    item_key: string;
    name: string;
    unit_label: string;
    canonical_unit_price: number;
    observation_count: number;
    accepted_count: number;
  }>;
}

export interface PriceHistoryResponse {
  item_key: string;
  history: Array<{
    week_start: string;
    canonical_unit_price: number;
    observation_count: number;
  }>;
}

export interface PriceEvidenceResponse {
  item_key: string;
  week_start: string;
  observations: PriceObservation[];
  normalized_price: NormalizedPrice | null;
}

// --- Trends ---

export interface TrendsResponse {
  months: MonthSummary[];
  baseline_month: string | null;
  index_series: Array<{
    snapshot_month: string;
    index_value: number;
  }>;
  item_breakdown: Array<{
    snapshot_month: string;
    items: MonthlySnapshotDetail[];
  }>;
}

// --- Refresh ---

export interface RefreshRunResponse {
  status: 'completed' | 'partial' | 'failed';
  observations_collected: number;
  observations_reviewed: number;
  errors: string[];
  duration_ms: number;
}

export interface SnapshotRunResponse {
  status: 'completed' | 'failed';
  snapshot_month: string;
  items_snapshotted: number;
  basket_total: number;
}

// --- History ---

export interface RunHistoryResponse {
  runs: RunHistoryEntry[];
}

// --- Settings ---

export interface SettingsResponse {
  enabled_retailers: string[];
  baseline_month: string;
  refresh_schedule: string;
  observation_rules: {
    reject_specials: boolean;
    reject_member_pricing: boolean;
    reject_multi_buy: boolean;
    reject_wrong_size: boolean;
  };
}
