const STORAGE_KEY = 'grid-builder:auth'
const TOKEN_EXPIRY_BUFFER_MS = 60_000

export interface StoredAuth {
  secret: string
  accessToken?: string
  expiresAt?: number
}

export function isTokenValid(expiresAt?: number, now = Date.now()): boolean {
  if (!expiresAt) {
    return false
  }
  return now + TOKEN_EXPIRY_BUFFER_MS < expiresAt
}

export function loadStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as StoredAuth
    if (!parsed.secret?.trim()) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function saveStoredAuth(auth: StoredAuth): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
}

export function clearStoredAuth(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getValidAccessToken(auth: StoredAuth | null): string | null {
  if (!auth?.accessToken || !isTokenValid(auth.expiresAt)) {
    return null
  }
  return auth.accessToken
}
