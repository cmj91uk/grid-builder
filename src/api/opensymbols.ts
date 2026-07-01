export interface OpenSymbol {
  id: number
  symbol_key: string
  name: string
  locale: string
  license: string
  license_url: string
  author: string
  author_url: string
  source_url: string | null
  skins: boolean
  repo_key: string
  hc: boolean
  extension: string
  image_url: string
  search_string: string | null
  unsafe_result: boolean
  _href: string
  details_url: string
}

interface TokenResponse {
  access_token: string
  expires?: string
  expires_at?: number | string
  expires_in?: number
  expiry?: number | string
}

export interface AccessTokenResult {
  accessToken: string
  expiresAt: number
}

function parseExpiryTimestamp(value: number | string): number {
  if (typeof value === 'number') {
    return value < 1_000_000_000_000 ? value * 1000 : value
  }

  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) {
    throw new OpenSymbolsError('Token response included an invalid expiry time')
  }
  return parsed
}

function parseTokenExpiry(data: TokenResponse): number {
  if (data.expires !== undefined) {
    return parseExpiryTimestamp(data.expires)
  }

  if (data.expires_at !== undefined) {
    return parseExpiryTimestamp(data.expires_at)
  }

  if (data.expires_in !== undefined) {
    return Date.now() + data.expires_in * 1000
  }

  if (data.expiry !== undefined) {
    return parseExpiryTimestamp(data.expiry)
  }

  throw new OpenSymbolsError('Token response did not include an expiry time')
}

interface TokenExpiredResponse {
  token_expired: true
}

interface ThrottledResponse {
  throttled: true
}

import { getApiBase } from '../lib/proxyUrls'

const API_BASE = getApiBase()

export class OpenSymbolsError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'OpenSymbolsError'
    this.status = status
  }
}

export async function fetchAccessToken(secret: string): Promise<AccessTokenResult> {
  const params = new URLSearchParams({ secret })
  const response = await fetch(`${API_BASE}/token?${params}`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new OpenSymbolsError(
      `Failed to generate access token (${response.status})`,
      response.status,
    )
  }

  const data = (await response.json()) as TokenResponse
  if (!data.access_token) {
    throw new OpenSymbolsError('Token response did not include access_token')
  }

  return {
    accessToken: data.access_token,
    expiresAt: parseTokenExpiry(data),
  }
}

export async function searchSymbols(
  accessToken: string,
  query: string,
  locale = 'en',
): Promise<OpenSymbol[]> {
  const params = new URLSearchParams({
    q: query,
    locale,
    safe: '1',
    access_token: accessToken,
  })

  const response = await fetch(`${API_BASE}/symbols?${params}`)

  if (response.status === 401) {
    const body = (await response.json()) as TokenExpiredResponse
    if (body.token_expired) {
      throw new OpenSymbolsError('Access token expired', 401)
    }
  }

  if (response.status === 429) {
    const body = (await response.json()) as ThrottledResponse
    if (body.throttled) {
      throw new OpenSymbolsError('Too many requests. Please wait and try again.', 429)
    }
  }

  if (!response.ok) {
    throw new OpenSymbolsError(
      `Symbol search failed (${response.status})`,
      response.status,
    )
  }

  const results = (await response.json()) as OpenSymbol[]
  return results.slice(0, 50)
}
