import OpenAI from 'openai';
import { config } from '../config.js';
import type { LLMReviewRequest, LLMReviewResponse, LLMObservationReview } from '@basket/shared';

const client = new OpenAI({ apiKey: config.openaiApiKey });

const SYSTEM_PROMPT = `You review price observations for a New Zealand grocery basket tracker.

Classify each observation as "accept" or "reject".

ACCEPT when: correct product, correct size/weight, standard shelf price in NZD.

REJECT when: special/sale price, member/club-card price, multi-buy deal, wrong variant (premium/organic when standard is wanted), wrong size/weight, different product, implausible price.

You MUST return exactly one review per observation, in the same order, with no omissions.
Never skip an observation. If you cannot evaluate an observation (malformed data,
missing fields, ambiguous product), reject it and explain the problem in "reason".
The number of reviews in your response MUST equal the number of observations provided.

For every observation (in order):
- "decision": "accept" or "reject"
- "reason": brief explanation (one sentence)
- "normalized_unit_price": price in the basket item's canonical unit, or null
- "confidence": 0–1

Also return:
- "recommended_canonical_price": median of accepted normalized prices (or null)
- "summary": one-sentence batch summary

Rules: never invent data; if uncertain, reject.`;

const reviewResponseSchema = {
  type: 'object' as const,
  properties: {
    item_key: { type: 'string' as const },
    reviews: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          decision: { type: 'string' as const, enum: ['accept', 'reject'] },
          reason: { type: 'string' as const },
          normalized_unit_price: {
            type: ['number', 'null'] as const,
          },
          confidence: { type: 'number' as const },
        },
        required: [
          'decision',
          'reason',
          'normalized_unit_price',
          'confidence',
        ] as const,
        additionalProperties: false,
      },
    },
    recommended_canonical_price: {
      type: ['number', 'null'] as const,
    },
    summary: { type: 'string' as const },
  },
  required: ['item_key', 'reviews', 'recommended_canonical_price', 'summary'] as const,
  additionalProperties: false,
};

function buildUserPrompt(request: LLMReviewRequest): string {
  const item = request.basket_item;
  let prompt = `Basket Item: "${item.name}" (key: ${item.item_key}, unit: ${item.unit_label})\n`;

  if (Object.keys(item.spec).length > 0) {
    prompt += `Spec: ${JSON.stringify(item.spec)}\n`;
  }

  prompt += `\n${request.observations.length} observations to review (return exactly ${request.observations.length} reviews in this order):\n`;

  for (let i = 0; i < request.observations.length; i++) {
    const obs = request.observations[i];
    prompt += `\n${i + 1}. Shop: ${obs.shop_name}`;
    prompt += `\n   Title: "${obs.raw_title}"`;
    prompt += `\n   Price: $${obs.raw_price.toFixed(2)}`;
    if (obs.unit_text) prompt += `\n   Unit: ${obs.unit_text}`;
    if (obs.is_member_price) prompt += `\n   ⚠️ MEMBER PRICE`;
    if (obs.is_special) prompt += `\n   ⚠️ SPECIAL/SALE`;
    if (obs.source_url) prompt += `\n   URL: ${obs.source_url}`;
  }

  return prompt;
}

function validateResponse(
  response: unknown,
  request: LLMReviewRequest,
): LLMReviewResponse {
  const res = response as Record<string, unknown>;

  if (typeof res.item_key !== 'string') {
    throw new Error('LLM response missing item_key');
  }
  if (!Array.isArray(res.reviews)) {
    throw new Error('LLM response missing reviews array');
  }
  if (typeof res.summary !== 'string') {
    throw new Error('LLM response missing summary');
  }

  const expected = request.observations.length;
  if (res.reviews.length !== expected) {
    throw new Error(
      `LLM returned ${res.reviews.length} reviews but expected ${expected} (one per observation)`,
    );
  }

  const reviews: LLMObservationReview[] = res.reviews.map(
    (r: Record<string, unknown>, idx: number) => {
      if (r.decision !== 'accept' && r.decision !== 'reject') {
        throw new Error(`Review ${idx + 1}: invalid decision "${r.decision}"`);
      }
      if (typeof r.reason !== 'string' || r.reason.length === 0) {
        throw new Error(`Review ${idx + 1}: missing reason`);
      }
      if (typeof r.confidence !== 'number' || r.confidence < 0 || r.confidence > 1) {
        throw new Error(`Review ${idx + 1}: confidence must be 0-1, got ${r.confidence}`);
      }

      return {
        observation_id: request.observations[idx].observation_id,
        decision: r.decision as 'accept' | 'reject',
        reason: r.reason,
        normalized_unit_price:
          typeof r.normalized_unit_price === 'number' ? r.normalized_unit_price : null,
        confidence: r.confidence,
      };
    },
  );

  return {
    item_key: res.item_key as string,
    reviews,
    recommended_canonical_price:
      typeof res.recommended_canonical_price === 'number'
        ? res.recommended_canonical_price
        : null,
    summary: res.summary as string,
  };
}

/**
 * ~100 tokens per review object; keep batches small enough that the response
 * never hits the output-token ceiling even with verbose reasons.
 */
const MAX_OBSERVATIONS_PER_CALL = 15;

/** Generous ceiling so the model never truncates mid-JSON. */
const REVIEW_MAX_TOKENS = 4096;

export async function reviewObservations(
  request: LLMReviewRequest,
): Promise<LLMReviewResponse> {
  if (request.observations.length <= MAX_OBSERVATIONS_PER_CALL) {
    return reviewObservationsBatch(request);
  }

  const allReviews: LLMObservationReview[] = [];
  let lastCanonicalPrice: number | null = null;
  const summaries: string[] = [];

  for (let i = 0; i < request.observations.length; i += MAX_OBSERVATIONS_PER_CALL) {
    const chunk = request.observations.slice(i, i + MAX_OBSERVATIONS_PER_CALL);
    const chunkRequest: LLMReviewRequest = {
      basket_item: request.basket_item,
      observations: chunk,
    };
    const chunkResponse = await reviewObservationsBatch(chunkRequest);
    allReviews.push(...chunkResponse.reviews);
    if (chunkResponse.recommended_canonical_price !== null) {
      lastCanonicalPrice = chunkResponse.recommended_canonical_price;
    }
    summaries.push(chunkResponse.summary);
  }

  return {
    item_key: request.basket_item.item_key,
    reviews: allReviews,
    recommended_canonical_price: lastCanonicalPrice,
    summary: summaries.join(' | '),
  };
}

async function reviewObservationsBatch(
  request: LLMReviewRequest,
): Promise<LLMReviewResponse> {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.1,
    max_tokens: REVIEW_MAX_TOKENS,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(request) },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'price_review',
        strict: true,
        schema: reviewResponseSchema,
      },
    },
  });

  const choice = completion.choices[0];
  if (!choice?.message?.content) {
    throw new Error('OpenAI returned empty response');
  }

  if (choice.finish_reason === 'length') {
    throw new Error(
      `OpenAI response truncated (finish_reason=length) for ${request.observations.length} observations — batch is too large for the token limit`,
    );
  }

  const content = choice.message.content;
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(
      `OpenAI returned invalid JSON (finish_reason=${choice.finish_reason}): ${content.slice(0, 200)}`,
    );
  }

  return validateResponse(parsed, request);
}
