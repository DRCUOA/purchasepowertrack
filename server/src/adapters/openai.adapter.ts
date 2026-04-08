import OpenAI from 'openai';
import { config } from '../config.js';
import type { LLMReviewRequest, LLMReviewResponse, LLMObservationReview } from '@basket/shared';

const client = new OpenAI({ apiKey: config.openaiApiKey });

const SYSTEM_PROMPT = `You are a price observation reviewer for a New Zealand grocery basket tracker.

Your task: Review price observations scraped from NZ supermarket websites and classify each as "accept" or "reject".

ACCEPT observations that:
- Match the basket item description (correct product, correct size/weight)
- Represent standard shelf pricing (regular everyday price)
- Are priced in NZD

REJECT observations that:
- Are specials, promotions, or temporary sale prices
- Are member-only or club-card pricing
- Are multi-buy deals (e.g. "2 for $5")
- Are premium or organic variants when the basket item is standard
- Are the wrong size or weight for the basket item
- Are clearly a different product from the basket item
- Have suspicious or implausible prices

For each observation, in the exact order given:
1. Set "decision" to "accept" or "reject"
2. Provide a brief "reason" explaining your decision
3. Set "normalized_unit_price" to the price normalized to the basket item's canonical unit (or null if you cannot normalize)
4. Set "confidence" from 0 to 1

CRITICAL: Return exactly one review per observation, in the same order the observations are listed. The reviews array must have the same length as the observations list.

Also provide:
- "recommended_canonical_price": the median of accepted normalized prices (or null if no accepts)
- "summary": a brief summary of the review batch

Rules:
- Never invent prices or data not present in the observations
- If uncertain, reject the observation
- Be conservative: it is better to reject a valid observation than accept a bad one`;

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

export async function reviewObservations(
  request: LLMReviewRequest,
): Promise<LLMReviewResponse> {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.1,
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

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI returned empty response');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(`OpenAI returned invalid JSON: ${content.slice(0, 200)}`);
  }

  return validateResponse(parsed, request);
}
