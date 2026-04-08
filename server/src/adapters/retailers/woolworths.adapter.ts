import type { BasketItem, PriceObservationInsert } from '@basket/shared';
import type { RetailerAdapter } from './base.adapter.js';

const SEARCH_URL = 'https://www.woolworths.co.nz/api/v1/products';
const FETCH_TIMEOUT_MS = 15_000;
const DELAY_BETWEEN_REQUESTS_MS = 500;

interface WoolworthsProduct {
  name: string;
  sku: string;
  slug?: string;
  brand?: string;
  unit?: string;
  price?: {
    salePrice?: number;
    originalPrice?: number;
    savePrice?: number;
    isClubPrice?: boolean;
    isSpecial?: boolean;
    isNew?: boolean;
    isTargetedOffer?: boolean;
    multiBuyBasePrice?: number;
    purchasingUnitPrice?: number;
  };
  size?: {
    volumeSize?: string;
    cupPrice?: number;
    cupMeasure?: string;
    packageType?: string;
  };
  productTag?: {
    tagType?: string;
    multiBuy?: { price?: number; quantity?: number } | null;
  };
}

interface WoolworthsSearchResponse {
  products?: {
    items?: WoolworthsProduct[];
    totalItems?: number;
  };
}

const SEARCH_TERMS: Record<string, string> = {
  'milk-2l': 'milk 2l standard',
  'bread-white-700g': 'white bread 700g toast',
  'eggs-12pk': 'eggs 12 pack',
  'butter-500g': 'butter 500g',
  'cheese-1kg': 'cheese 1kg block',
  'rice-1kg': 'rice 1kg white',
  'flour-plain-1.5kg': 'plain flour 1.5kg',
  'sugar-white-1.5kg': 'white sugar 1.5kg',
  'bananas-kg': 'bananas loose',
  'apples-kg': 'apples loose',
  'onions-brown-kg': 'brown onions loose',
  'potatoes-kg': 'potatoes loose',
};

export class WoolworthsAdapter implements RetailerAdapter {
  readonly retailerKey = 'woolworths';
  readonly retailerName = 'Woolworths';

  async fetchPrices(items: BasketItem[]): Promise<PriceObservationInsert[]> {
    const observations: PriceObservationInsert[] = [];

    for (const item of items) {
      try {
        const itemObs = await this.searchItem(item);
        observations.push(...itemObs);
      } catch (err) {
        console.error(`[Woolworths] Failed to fetch prices for "${item.name}":`, err);
      }
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }

    return observations;
  }

  private async searchItem(item: BasketItem): Promise<PriceObservationInsert[]> {
    const searchTerm = SEARCH_TERMS[item.item_key] ?? item.name;

    const url = new URL(SEARCH_URL);
    url.searchParams.set('target', 'search');
    url.searchParams.set('search', searchTerm);
    url.searchParams.set('page', '1');
    url.searchParams.set('size', '12');
    url.searchParams.set('inStockProductsOnly', 'true');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json, text/plain, */*',
          'x-requested-with': 'OnlineShopping.WebApp',
          'Referer': `https://www.woolworths.co.nz/shop/search?q=${encodeURIComponent(searchTerm)}`,
        },
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.warn(`[Woolworths] Timeout searching for "${item.name}"`);
      } else {
        console.warn(`[Woolworths] Network error searching for "${item.name}":`, err);
      }
      return [];
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      console.warn(
        `[Woolworths] API returned ${response.status} for "${item.name}" — adapter may need updating`,
      );
      return [];
    }

    let data: WoolworthsSearchResponse;
    try {
      data = (await response.json()) as WoolworthsSearchResponse;
    } catch {
      console.warn(`[Woolworths] Invalid JSON response for "${item.name}"`);
      return [];
    }

    const products = data.products?.items;
    if (!products || products.length === 0) {
      console.warn(`[Woolworths] No products found for "${item.name}"`);
      return [];
    }

    const now = new Date().toISOString();
    const observations: PriceObservationInsert[] = [];

    for (const product of products) {
      const price = product.price?.salePrice ?? product.price?.originalPrice;
      if (price == null || price <= 0) continue;

      const hasMultiBuy =
        product.productTag?.multiBuy?.price != null &&
        product.productTag?.multiBuy?.quantity != null;

      observations.push({
        basket_item_id: item.id,
        observed_at: now,
        shop_name: 'Woolworths',
        source_url: product.slug
          ? `https://www.woolworths.co.nz/shop/productdetails?slug=${product.slug}&sku=${product.sku}`
          : null,
        raw_title: product.name,
        raw_price: price,
        unit_text: product.size?.volumeSize ?? product.unit ?? null,
        is_member_price: product.price?.isClubPrice ?? false,
        is_special: (product.price?.isSpecial ?? false) || hasMultiBuy,
        extraction_method: 'woolworths-api',
        raw_payload: {
          sku: product.sku,
          brand: product.brand ?? null,
          original_price: product.price?.originalPrice ?? null,
          sale_price: product.price?.salePrice ?? null,
          save_price: product.price?.savePrice ?? null,
          is_club_price: product.price?.isClubPrice ?? false,
          is_special: product.price?.isSpecial ?? false,
          is_targeted_offer: product.price?.isTargetedOffer ?? false,
          multi_buy: product.productTag?.multiBuy ?? null,
          size: product.size?.volumeSize ?? null,
          cup_price: product.size?.cupPrice ?? null,
          cup_measure: product.size?.cupMeasure ?? null,
          package_type: product.size?.packageType ?? null,
        },
      });
    }

    console.log(`[Woolworths] "${item.name}" → ${observations.length} observations`);
    return observations;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
