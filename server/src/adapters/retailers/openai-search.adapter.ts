import OpenAI from 'openai';
import type { BasketItem, PriceObservationInsert } from '@basket/shared';
import type { RetailerAdapter } from './base.adapter.js';
import { config } from '../../config.js';
import { runWithConcurrency } from '../../lib/run-with-concurrency.js';

const client = new OpenAI({ apiKey: config.openaiApiKey });
const MAX_CONCURRENT = 4;

interface PriceResult {
  shop_name: string;
  product_title: string;
  price: number;
  unit_text: string | null;
  source_url: string | null;
  is_member_price: boolean;
  is_special: boolean;
}

interface ExtractionResponse {
  prices: PriceResult[];
  summary: string;
}

const extractionSchema = {
  type: 'object' as const,
  properties: {
    prices: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          shop_name: { type: 'string' as const },
          product_title: { type: 'string' as const },
          price: { type: 'number' as const },
          unit_text: { type: ['string', 'null'] as const },
          source_url: { type: ['string', 'null'] as const },
          is_member_price: { type: 'boolean' as const },
          is_special: { type: 'boolean' as const },
        },
        required: [
          'shop_name',
          'product_title',
          'price',
          'unit_text',
          'source_url',
          'is_member_price',
          'is_special',
        ] as const,
        additionalProperties: false,
      },
    },
    summary: { type: 'string' as const },
  },
  required: ['prices', 'summary'] as const,
  additionalProperties: false,
};

function extractCitedUrls(output: unknown[]): string[] {
  const urls: string[] = [];
  for (const item of output) {
    const obj = item as Record<string, unknown>;
    if (obj.type !== 'message') continue;
    const content = obj.content as Array<Record<string, unknown>> | undefined;
    if (!content) continue;
    for (const c of content) {
      const annotations = c.annotations as Array<Record<string, unknown>> | undefined;
      if (!annotations) continue;
      for (const a of annotations) {
        if (a.type === 'url_citation' && typeof a.url === 'string') {
          urls.push(a.url);
        }
      }
    }
  }
  return urls;
}

export class OpenAISearchAdapter implements RetailerAdapter {
  readonly retailerKey = 'openai-search';
  readonly retailerName = 'OpenAI Web Search';

  async fetchPrices(items: BasketItem[]): Promise<PriceObservationInsert[]> {
    const results = await runWithConcurrency(
      items,
      (item) =>
        this.searchItem(item).catch((err) => {
          console.error(
            `[OpenAI Search] Failed for "${item.name}":`,
            err instanceof Error ? err.message : err,
          );
          return [] as PriceObservationInsert[];
        }),
      MAX_CONCURRENT,
    );

    return results.flat();
  }

  private async searchItem(item: BasketItem): Promise<PriceObservationInsert[]> {
    const specInfo =
      Object.keys(item.spec).length > 0 ? ` (${JSON.stringify(item.spec)})` : '';

    console.log(`[OpenAI Search] Searching for "${item.name}"...`);

    const searchResponse = await client.responses.create({
      model: 'gpt-4o-mini',
      tools: [
        {
          type: 'web_search_preview',
          user_location: {
            type: 'approximate',
            country: 'NZ',
            timezone: 'Pacific/Auckland',
          },
        },
      ],
      input:
        `What is the current retail price of "${item.name}"${specInfo} ` +
        `(unit: ${item.unit_label}) at New Zealand supermarkets? ` +
        `Include prices from PAK'nSAVE, Woolworths (Countdown), New World, ` +
        `and any other major NZ grocery retailers. Report everyday shelf prices in NZD. ` +
        `Include the specific product name, brand, size/weight, and price from each retailer.`,
    });

    const searchText = searchResponse.output_text;
    if (!searchText) {
      console.warn(`[OpenAI Search] Empty response for "${item.name}"`);
      return [];
    }

    const citedUrls = extractCitedUrls(searchResponse.output as unknown[]);

    const extraction = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content:
            'Extract structured price data from web search results about ' +
            'New Zealand grocery prices. Only include prices explicitly stated ' +
            'in the text. Never invent prices.',
        },
        {
          role: 'user',
          content:
            `Extract prices for "${item.name}" (unit: ${item.unit_label}) from ` +
            `these web search results:\n\n${searchText}\n\n` +
            `Cited sources:\n${citedUrls.map((u, i) => `[${i + 1}] ${u}`).join('\n') || '(none)'}\n\n` +
            `Rules:\n` +
            `- Only include prices clearly stated in the text\n` +
            `- Use exact prices in NZD\n` +
            `- Set is_member_price=true only for loyalty/club-card exclusive prices\n` +
            `- Set is_special=true only for sales, promotions, or multi-buy deals\n` +
            `- Use the most relevant cited URL as source_url for each price, or null\n` +
            `- Include all product variants found (different brands/sizes)`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'price_extraction',
          strict: true,
          schema: extractionSchema,
        },
      },
    });

    const content = extraction.choices[0]?.message?.content;
    if (!content) {
      console.warn(`[OpenAI Search] Extraction returned empty for "${item.name}"`);
      return [];
    }

    let results: ExtractionResponse;
    try {
      results = JSON.parse(content) as ExtractionResponse;
    } catch {
      console.warn(`[OpenAI Search] Invalid JSON from extraction for "${item.name}"`);
      return [];
    }

    const now = new Date().toISOString();
    const observations: PriceObservationInsert[] = results.prices
      .filter((p) => p.price > 0)
      .map((p) => ({
        basket_item_id: item.id,
        observed_at: now,
        shop_name: p.shop_name,
        source_url: p.source_url,
        raw_title: p.product_title,
        raw_price: p.price,
        unit_text: p.unit_text,
        is_member_price: p.is_member_price,
        is_special: p.is_special,
        extraction_method: 'openai-websearch',
        raw_payload: {
          search_text: searchText,
          summary: results.summary,
          cited_urls: citedUrls,
        },
      }));

    console.log(`[OpenAI Search] "${item.name}" → ${observations.length} observations`);
    return observations;
  }
}
