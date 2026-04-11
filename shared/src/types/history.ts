export interface RunHistoryItemSnapshot {
  item_key: string;
  name: string;
  unit_price: number;
  quantity?: number;
  line_total?: number;
  observation_count?: number;
  accepted_count?: number;
}

export interface RunHistoryEntry {
  id: number;
  run_type: 'refresh' | 'snapshot';
  started_at: string;
  completed_at: string;
  status: string;
  basket_total: number | null;
  item_count: number;
  summary: Record<string, unknown>;
  items: RunHistoryItemSnapshot[];
  created_at: string;
}
