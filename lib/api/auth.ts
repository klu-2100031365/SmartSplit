import { apiRequest } from './client';
import { AuthResponse } from './types';

export function register(name: string, email: string, password: string) {
    return apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
    });
}

export function login(email: string, password: string) {
    return apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}
