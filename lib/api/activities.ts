import { apiRequest } from './client';
import { Trip } from './types';

export function getDiningEvents(_userId: string) {
    return apiRequest<Trip[]>('/activities/dining/events', { method: 'GET' });
}

export function getMovieEvents(_userId: string) {
    return apiRequest<Trip[]>('/activities/movies/events', { method: 'GET' });
}

export function getPlayEvents(_userId: string) {
    return apiRequest<Trip[]>('/activities/play/events', { method: 'GET' });
}
