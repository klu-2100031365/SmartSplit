import { apiRequest } from './client';
import { ShareTripResponse } from './types';

export function getTripByShareToken(token: string) {
    return apiRequest<ShareTripResponse>(`/share/${encodeURIComponent(token)}`, { method: 'GET' });
}
