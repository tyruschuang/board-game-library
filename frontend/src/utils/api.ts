// Simple API client for browser-side calls
// Defaults to localhost:5328 unless NEXT_PUBLIC_API_URL is set

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5328';

type Options = RequestInit & { json?: unknown };

export async function apiFetch<T = unknown>(path: string, options: Options = {}): Promise<Response> {
    const url = API_BASE.replace(/\/$/, '') + path;
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> | undefined),
    };

    let body = options.body;
    if (options.json !== undefined) {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
        body = JSON.stringify(options.json);
    }

    return fetch(url, {
        ...options,
        credentials: 'include',
        headers,
        body,
    });
}

export function apiUrl(path: string) {
    return API_BASE.replace(/\/$/, '') + path;
}

