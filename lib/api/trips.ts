import { apiRequest } from './client';
import { ChangeLog, Expense, Participant, SharePermission, Trip, TripDetailsView } from './types';

export function getTrips(_userId: string) {
    return apiRequest<Trip[]>('/trips', { method: 'GET' });
}

export function createTrip(
    _userId: string,
    name: string,
    icon: string = 'plane',
    customImage?: string,
    type: 'trip' | 'dining' | 'movies' | 'play' = 'trip'
) {
    return apiRequest<Trip>('/trips', {
        method: 'POST',
        body: JSON.stringify({ name, icon, customImage, type })
    });
}

export function updateTrip(_userId: string, tripId: string, name: string, icon: string, customImage?: string) {
    return apiRequest<void>(`/trips/${encodeURIComponent(tripId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ name, icon, customImage })
    });
}

export function deleteTrip(_userId: string, tripId: string) {
    return apiRequest<void>(`/trips/${encodeURIComponent(tripId)}`, { method: 'DELETE' });
}

export function getTripDetails(tripId: string) {
    return apiRequest<TripDetailsView>(`/trips/${encodeURIComponent(tripId)}/view`, { method: 'GET' });
}

export function getUserTripExpenses(_userId: string) {
    return apiRequest<Record<string, number>>('/me/trip-shares', { method: 'GET' });
}

export function addParticipant(tripId: string, name: string) {
    return apiRequest<Participant>(`/trips/${encodeURIComponent(tripId)}/participants`, {
        method: 'POST',
        body: JSON.stringify({ name })
    });
}

export function updateParticipant(participantId: string, name: string) {
    return apiRequest<void>(`/participants/${encodeURIComponent(participantId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ name })
    });
}

export function removeParticipant(participantId: string, tripId: string) {
    return apiRequest<void>(`/trips/${encodeURIComponent(tripId)}/participants/${encodeURIComponent(participantId)}`, {
        method: 'DELETE'
    });
}

export function addExpense(tripId: string, expense: Omit<Expense, 'id' | 'tripId'>, actor?: { id: string; name: string }) {
    return apiRequest<Expense>(`/trips/${encodeURIComponent(tripId)}/expenses`, {
        method: 'POST',
        body: JSON.stringify({ expense, actor })
    });
}

export function updateExpense(tripId: string, expenseId: string, data: Partial<Expense>, actor?: { id: string; name: string }) {
    return apiRequest<void>(`/trips/${encodeURIComponent(tripId)}/expenses/${encodeURIComponent(expenseId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ data, actor })
    });
}

export function deleteExpense(tripId: string, expenseId: string, actor?: { id: string; name: string }) {
    return apiRequest<void>(`/trips/${encodeURIComponent(tripId)}/expenses/${encodeURIComponent(expenseId)}`, {
        method: 'DELETE',
        body: JSON.stringify({ actor })
    });
}

export function generateShareLink(tripId: string, permission: SharePermission) {
    return apiRequest<{ token: string }>(`/trips/${encodeURIComponent(tripId)}/share`, {
        method: 'POST',
        body: JSON.stringify({ permission })
    });
}

export function revertChange(logId: string) {
    return apiRequest<void>(`/trips/logs/${encodeURIComponent(logId)}/revert`, { method: 'POST' });
}

export function revertAllChanges(tripId: string) {
    return apiRequest<void>(`/trips/${encodeURIComponent(tripId)}/revert-all`, { method: 'POST' });
}

export type { Trip, Participant, Expense, ChangeLog };
