export type ObservationStatus = 'pending' | 'accepted' | 'rejected';

export interface PriceObservation {
  id: number;
  basket_item_id: number;
  observed_at: string;
  shop_name: string;
  region: string | null;
  source_url: string | null;
  raw_title: string;
  raw_price: number;
  unit_text: string | null;
  is_member_price: boolean;
  is_special: boolean;
  extraction_method: string;
  raw_payload: Record<string, unknown>;
  review_status: ObservationStatus;
  review_reason: string | null;
  review_payload: Record<string, unknown> | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface NormalizedPrice {
  id: number;
  basket_item_id: number;
  week_start: string;
  canonical_unit_price: number;
  observation_count: number;
  accepted_count: number;
  rejected_count: number;
  method: string;
  source_detail: Record<string, unknown>;
  llm_review_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface PriceObservationInsert {
  basket_item_id: number;
  observed_at: string;
  shop_name: string;
  region?: string | null;
  source_url?: string | null;
  raw_title: string;
  raw_price: number;
  unit_text?: string | null;
  is_member_price: boolean;
  is_special: boolean;
  extraction_method: string;
  raw_payload: Record<string, unknown>;
}
