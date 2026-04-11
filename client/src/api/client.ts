import type {
  DashboardResponse,
  BasketItemsResponse,
  UpdateQuantityRequest,
  CurrentPricesResponse,
  PriceHistoryResponse,
  PriceEvidenceResponse,
  TrendsResponse,
  RefreshRunResponse,
  SnapshotRunResponse,
  SettingsResponse,
  RunHistoryResponse,
} from '@basket/shared';

const API_BASE = '/api';

export class ApiClientError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiClientError(
      res.status,
      body?.error?.message || 'Request failed',
      body?.error?.code,
    );
  }
  return res.json();
}

export function fetchDashboard(): Promise<DashboardResponse> {
  return request<DashboardResponse>('/dashboard');
}

export function fetchBasketItems(): Promise<BasketItemsResponse> {
  return request<BasketItemsResponse>('/basket-items');
}

export function updateQuantity(
  id: number,
  data: UpdateQuantityRequest,
): Promise<void> {
  return request('/basket-items/' + id + '/quantity', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function fetchCurrentPrices(): Promise<CurrentPricesResponse> {
  return request<CurrentPricesResponse>('/prices/current');
}

export function fetchPriceHistory(
  itemKey: string,
): Promise<PriceHistoryResponse> {
  return request<PriceHistoryResponse>(
    '/prices/history?item_key=' + encodeURIComponent(itemKey),
  );
}

export function fetchPriceEvidence(
  itemKey: string,
  weekStart?: string,
): Promise<PriceEvidenceResponse> {
  let path = '/prices/evidence/' + encodeURIComponent(itemKey);
  if (weekStart) {
    path += '?week_start=' + encodeURIComponent(weekStart);
  }
  return request<PriceEvidenceResponse>(path);
}

export function fetchTrends(): Promise<TrendsResponse> {
  return request<TrendsResponse>('/trends');
}

export function triggerRefresh(): Promise<RefreshRunResponse> {
  return request<RefreshRunResponse>('/refresh/run', { method: 'POST' });
}

export function triggerSnapshot(month?: string): Promise<SnapshotRunResponse> {
  return request<SnapshotRunResponse>('/refresh/monthly-snapshot/run', {
    method: 'POST',
    body: month ? JSON.stringify({ month }) : undefined,
  });
}

export function fetchRunHistory(limit?: number): Promise<RunHistoryResponse> {
  const params = limit ? `?limit=${limit}` : '';
  return request<RunHistoryResponse>('/history' + params);
}

export function deleteRunHistory(id: number): Promise<{ deleted: boolean }> {
  return request<{ deleted: boolean }>('/history/' + id, { method: 'DELETE' });
}

export function fetchSettings(): Promise<SettingsResponse> {
  return request<SettingsResponse>('/settings');
}
