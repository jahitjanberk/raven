export const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export function getToken(): string | null {
  try { return localStorage.getItem('raven-token') } catch { return null }
}

export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const resp = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers as Record<string, string> | undefined),
    },
  })
  if (resp.status === 401) {
    localStorage.removeItem('raven-token')
    localStorage.removeItem('raven-auth')
    // Let the caller handle the redirect — don't hard-navigate here
  }
  return resp
}
