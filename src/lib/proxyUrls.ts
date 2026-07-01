export function getApiBase(): string {
  return import.meta.env.VITE_OPENSYMBOLS_API ?? '/api/v2'
}

export function getProxiedImageUrl(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin)
    if (parsed.origin === window.location.origin) {
      return parsed.toString()
    }

    return `/api/image-proxy?${new URLSearchParams({ url: parsed.toString() })}`
  } catch {
    return url
  }
}
