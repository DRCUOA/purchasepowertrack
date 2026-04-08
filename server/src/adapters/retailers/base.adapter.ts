import type { BasketItem, PriceObservationInsert } from '@basket/shared';

export interface RetailerAdapter {
  readonly retailerKey: string;
  readonly retailerName: string;
  fetchPrices(items: BasketItem[]): Promise<PriceObservationInsert[]>;
}
