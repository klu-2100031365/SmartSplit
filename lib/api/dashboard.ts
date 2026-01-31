import { apiRequest } from './client';
import { UserStats } from './types';

export function getUserStats(_userId: string) {
    return apiRequest<UserStats>('/me/stats', { method: 'GET' });
}
