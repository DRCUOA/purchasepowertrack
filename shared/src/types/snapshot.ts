export interface MonthlySnapshot {
  id: number;
  snapshot_month: string;
  basket_item_id: number;
  quantity: number;
  unit_price: number;
  line_total: number;
  normalized_price_id: number | null;
  created_at: string;
}

export interface MonthlySnapshotDetail extends MonthlySnapshot {
  item_key: string;
  item_name: string;
  unit_label: string;
}

export interface MonthSummary {
  snapshot_month: string;
  basket_total: number;
  item_count: number;
}
