import { apiRequest } from './client';
import { DailyCategory, DailyExpense, DailyStats } from './types';

export function getDailyExpenses(_userId: string) {
    return apiRequest<DailyExpense[]>('/daily-expenses', { method: 'GET' });
}

export function getDailyCategories(_userId: string) {
    return apiRequest<DailyCategory[]>('/daily-expenses/categories', { method: 'GET' });
}

export function getDailyStats(_userId: string) {
    return apiRequest<DailyStats>('/daily-expenses/stats', { method: 'GET' });
}

export function addDailyExpense(_userId: string, expense: Omit<DailyExpense, 'id' | 'userId'>) {
    return apiRequest<DailyExpense>('/daily-expenses', {
        method: 'POST',
        body: JSON.stringify(expense)
    });
}

export function updateDailyExpense(_userId: string, expenseId: string, data: Partial<DailyExpense>) {
    return apiRequest<void>(`/daily-expenses/${encodeURIComponent(expenseId)}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
}

export function deleteDailyExpense(_userId: string, expenseId: string) {
    return apiRequest<void>(`/daily-expenses/${encodeURIComponent(expenseId)}`, {
        method: 'DELETE'
    });
}

export function getMonthlySalary(_userId: string) {
    return apiRequest<{ monthlySalary?: number }>('/me/salary', { method: 'GET' }).then(r => r.monthlySalary);
}

export function updateMonthlySalary(_userId: string, salary: number) {
    return apiRequest<void>('/me/salary', { method: 'PUT', body: JSON.stringify({ monthlySalary: salary }) });
}

export function syncTripExpenses(_userId: string, sources: string[]) {
    return apiRequest<{ count: number }>('/daily-expenses/sync', {
        method: 'POST',
        body: JSON.stringify({ sources })
    }).then(r => r.count);
}

export function unsyncTripExpenses(_userId: string, sources: string[]) {
    return apiRequest<{ count: number }>('/daily-expenses/unsync', {
        method: 'POST',
        body: JSON.stringify({ sources })
    }).then(r => r.count);
}
