const API_BASE = '/api';
export class ApiClientError extends Error {
    status;
    code;
    constructor(status, message, code) {
        super(message);
        this.status = status;
        this.code = code;
        this.name = 'ApiClientError';
    }
}
async function request(path, options) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
    });
    if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new ApiClientError(res.status, body?.error?.message || 'Request failed', body?.error?.code);
    }
    return res.json();
}
export function fetchDashboard() {
    return request('/dashboard');
}
export function fetchBasketItems() {
    return request('/basket-items');
}
export function updateQuantity(id, data) {
    return request('/basket-items/' + id + '/quantity', {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}
export function fetchCurrentPrices() {
    return request('/prices/current');
}
export function fetchPriceHistory(itemKey) {
    return request('/prices/history?item_key=' + encodeURIComponent(itemKey));
}
export function fetchPriceEvidence(itemKey, weekStart) {
    let path = '/prices/evidence/' + encodeURIComponent(itemKey);
    if (weekStart) {
        path += '?week_start=' + encodeURIComponent(weekStart);
    }
    return request(path);
}
export function fetchTrends() {
    return request('/trends');
}
export function triggerRefresh() {
    return request('/refresh/run', { method: 'POST' });
}
export function triggerSnapshot(month) {
    return request('/refresh/monthly-snapshot/run', {
        method: 'POST',
        body: month ? JSON.stringify({ month }) : undefined,
    });
}
export function fetchRunHistory(limit) {
    const params = limit ? `?limit=${limit}` : '';
    return request('/history' + params);
}
export function deleteRunHistory(id) {
    return request('/history/' + id, { method: 'DELETE' });
}
export function fetchSettings() {
    return request('/settings');
}
//# sourceMappingURL=client.js.map