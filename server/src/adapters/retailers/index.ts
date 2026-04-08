import type { RetailerAdapter } from './base.adapter.js';
import { WoolworthsAdapter } from './woolworths.adapter.js';
import { PaknsaveAdapter } from './paknsave.adapter.js';
import { OpenAISearchAdapter } from './openai-search.adapter.js';

const registry: Record<string, () => RetailerAdapter> = {
  woolworths: () => new WoolworthsAdapter(),
  paknsave: () => new PaknsaveAdapter(),
  'openai-search': () => new OpenAISearchAdapter(),
};

export function getEnabledAdapters(enabledKeys: string[]): RetailerAdapter[] {
  return enabledKeys
    .filter((key) => registry[key])
    .map((key) => registry[key]());
}
