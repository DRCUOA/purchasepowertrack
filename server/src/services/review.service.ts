import type {
  LLMReviewRequest,
  LLMObservationInput,
  ObservationStatus,
  BasketItem,
} from '@basket/shared';
import * as basketItemRepo from '../repositories/basket-item.repo.js';
import * as priceObservationRepo from '../repositories/price-observation.repo.js';
import * as openaiAdapter from '../adapters/openai.adapter.js';

const RETRY_DELAY_MS = 2_000;

interface ReviewResult {
  reviewed: number;
  accepted: number;
  rejected: number;
}

export async function reviewPendingObservations(
  basketItemId: number,
  preloadedItem?: BasketItem | null,
): Promise<ReviewResult> {
  const item =
    preloadedItem && preloadedItem.id === basketItemId
      ? preloadedItem
      : await basketItemRepo.findById(basketItemId);
  if (!item) {
    console.warn(`[Review] Basket item ${basketItemId} not found, skipping`);
    return { reviewed: 0, accepted: 0, rejected: 0 };
  }

  const pending = await priceObservationRepo.findPendingByItem(basketItemId);
  if (pending.length === 0) {
    return { reviewed: 0, accepted: 0, rejected: 0 };
  }

  const observations: LLMObservationInput[] = pending.map((obs) => ({
    observation_id: obs.id,
    shop_name: obs.shop_name,
    raw_title: obs.raw_title,
    raw_price: obs.raw_price,
    unit_text: obs.unit_text,
    source_url: obs.source_url,
    is_member_price: obs.is_member_price,
    is_special: obs.is_special,
  }));

  const request: LLMReviewRequest = {
    basket_item: {
      item_key: item.item_key,
      name: item.name,
      unit_label: item.unit_label,
      spec: item.spec,
    },
    observations,
  };

  let response;
  try {
    response = await openaiAdapter.reviewObservations(request);
  } catch (firstErr) {
    console.warn(
      `[Review] First LLM call failed for item "${item.name}", retrying in ${RETRY_DELAY_MS}ms:`,
      firstErr,
    );
    await sleep(RETRY_DELAY_MS);
    try {
      response = await openaiAdapter.reviewObservations(request);
    } catch (retryErr) {
      console.error(
        `[Review] Retry also failed for item "${item.name}", leaving observations pending:`,
        retryErr,
      );
      return { reviewed: 0, accepted: 0, rejected: 0 };
    }
  }

  const pendingById = new Map(pending.map((o) => [o.id, o]));
  let accepted = 0;
  let rejected = 0;

  const batch: Array<{
    id: number;
    status: ObservationStatus;
    reason: string;
    payload: Record<string, unknown>;
  }> = [];

  for (const review of response.reviews) {
    const obs = pendingById.get(review.observation_id);
    if (!obs) {
      console.warn(
        `[Review] LLM returned review for unknown observation ${review.observation_id}, skipping`,
      );
      continue;
    }

    const status: ObservationStatus = review.decision === 'accept' ? 'accepted' : 'rejected';

    batch.push({
      id: review.observation_id,
      status,
      reason: review.reason,
      payload: {
        decision: review.decision,
        confidence: review.confidence,
        normalized_unit_price: review.normalized_unit_price,
        recommended_canonical_price: response.recommended_canonical_price,
      },
    });

    if (status === 'accepted') accepted++;
    else rejected++;
  }

  if (batch.length > 0) {
    await priceObservationRepo.updateReviewsBatch(batch);
  }

  console.log(
    `[Review] Item "${item.name}": ${accepted} accepted, ${rejected} rejected out of ${pending.length} pending`,
  );

  return {
    reviewed: accepted + rejected,
    accepted,
    rejected,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
