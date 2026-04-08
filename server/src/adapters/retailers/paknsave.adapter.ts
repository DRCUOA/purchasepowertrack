import type { BasketItem, PriceObservationInsert } from '@basket/shared';
import type { RetailerAdapter } from './base.adapter.js';

/**
 * PakNSave adapter — currently non-functional.
 *
 * PakNSave's product search API requires an authenticated JWT token
 * obtained through their session flow. Server-side access without
 * browser automation is not feasible at this time.
 *
 * This adapter is structured to be replaced once a reliable data
 * source is available (e.g., browser automation via Playwright,
 * an approved API key, or a third-party price aggregator).
 */
export class PaknsaveAdapter implements RetailerAdapter {
  readonly retailerKey = 'paknsave';
  readonly retailerName = 'PakNSave';

  private hasLoggedWarning = false;

  async fetchPrices(_items: BasketItem[]): Promise<PriceObservationInsert[]> {
    if (!this.hasLoggedWarning) {
      console.warn(
        '[PakNSave] Adapter is currently disabled — PakNSave requires authenticated API access. ' +
        'Returning zero observations. See server/src/adapters/retailers/paknsave.adapter.ts for details.',
      );
      this.hasLoggedWarning = true;
    }
    return [];
  }
}
