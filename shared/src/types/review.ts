export interface LLMReviewRequest {
  basket_item: {
    item_key: string;
    name: string;
    unit_label: string;
    spec: Record<string, unknown>;
  };
  observations: LLMObservationInput[];
}

export interface LLMObservationInput {
  observation_id: number;
  shop_name: string;
  raw_title: string;
  raw_price: number;
  unit_text: string | null;
  source_url: string | null;
  is_member_price: boolean;
  is_special: boolean;
}

export type ReviewDecision = 'accept' | 'reject';

export interface LLMObservationReview {
  observation_id: number;
  decision: ReviewDecision;
  reason: string;
  normalized_unit_price: number | null;
  confidence: number;
}

export interface LLMReviewResponse {
  item_key: string;
  reviews: LLMObservationReview[];
  recommended_canonical_price: number | null;
  summary: string;
}
