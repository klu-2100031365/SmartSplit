import { apiRequest } from './client';
import { RecurringItem, RecurringOverview } from './types';

export function getRecurringItems(_userId: string) {
    return apiRequest<RecurringItem[]>('/bills/items', { method: 'GET' });
}

export function getRecurringOverview(_userId: string) {
    return apiRequest<RecurringOverview>('/bills/overview', { method: 'GET' });
}

export function addRecurringItem(_userId: string, data: Omit<RecurringItem, 'id' | 'userId'>) {
    return apiRequest<RecurringItem>('/bills/items', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export function updateRecurringItem(_userId: string, itemId: string, data: Partial<Omit<RecurringItem, 'id' | 'userId'>>) {
    return apiRequest<void>(`/bills/items/${encodeURIComponent(itemId)}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
}

export function deleteRecurringItem(_userId: string, itemId: string) {
    return apiRequest<void>(`/bills/items/${encodeURIComponent(itemId)}`, { method: 'DELETE' });
}
