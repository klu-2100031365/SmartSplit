export class ApiError extends Error {
    status: number;
    body: unknown;

    constructor(message: string, status: number, body: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
    }
}

function getBaseUrl() {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return '';
    return base.endsWith('/') ? base.slice(0, -1) : base;
}

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
}

function buildHeaders(extra?: HeadersInit): HeadersInit {
    const token = getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    if (!extra) return headers;

    if (Array.isArray(extra)) {
        extra.forEach(([k, v]) => {
            headers[k] = v;
        });
        return headers;
    }

    if (extra instanceof Headers) {
        extra.forEach((v, k) => {
            headers[k] = v;
        });
        return headers;
    }

    return { ...headers, ...(extra as Record<string, string>) };
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

    const res = await fetch(url, {
        ...init,
        headers: buildHeaders(init?.headers)
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

    if (!res.ok) {
        const msg = typeof body === 'object' && body && 'detail' in (body as any)
            ? String((body as any).detail)
            : `Request failed (${res.status})`;
        throw new ApiError(msg, res.status, body);
    }

    return body as T;
}
