import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { fetchAccessToken, OpenSymbolsError, searchSymbols } from '../api/opensymbols'
import {
  clearStoredAuth,
  getValidAccessToken,
  isTokenValid,
  loadStoredAuth,
  saveStoredAuth,
} from '../lib/authStorage'

interface AuthContextValue {
  secret: string
  isAuthenticated: boolean
  hasValidToken: boolean
  setSecret: (secret: string) => void
  ensureAccessToken: () => Promise<string>
  invalidateAccessToken: () => void
  search: (query: string) => Promise<Awaited<ReturnType<typeof searchSymbols>>>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [secret, setSecretState] = useState('')
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const accessTokenRef = useRef<string | null>(null)

  useEffect(() => {
    const stored = loadStoredAuth()
    if (!stored) {
      return
    }

    setSecretState(stored.secret)
    setIsAuthenticated(true)

    const validToken = getValidAccessToken(stored)
    if (validToken && stored.expiresAt) {
      setAccessToken(validToken)
      setExpiresAt(stored.expiresAt)
      accessTokenRef.current = validToken
    }
  }, [])

  const setSecret = useCallback(
    (value: string) => {
      const trimmed = value.trim()
      setSecretState(trimmed)
      if (!trimmed) {
        setIsAuthenticated(false)
        clearStoredAuth()
        return
      }

      setIsAuthenticated(true)
      saveStoredAuth({
        secret: trimmed,
        accessToken: accessToken ?? undefined,
        expiresAt: expiresAt ?? undefined,
      })
    },
    [accessToken, expiresAt],
  )

  const saveAccessToken = useCallback(
    (token: string, tokenExpiresAt: number) => {
      setAccessToken(token)
      setExpiresAt(tokenExpiresAt)
      accessTokenRef.current = token

      const trimmedSecret = secret.trim()
      if (trimmedSecret) {
        saveStoredAuth({
          secret: trimmedSecret,
          accessToken: token,
          expiresAt: tokenExpiresAt,
        })
      }
    },
    [secret],
  )

  const invalidateAccessToken = useCallback(() => {
    setAccessToken(null)
    setExpiresAt(null)
    accessTokenRef.current = null

    const trimmedSecret = secret.trim()
    if (trimmedSecret) {
      saveStoredAuth({ secret: trimmedSecret })
    }
  }, [secret])

  const ensureAccessToken = useCallback(async (): Promise<string> => {
    if (accessTokenRef.current && expiresAt && isTokenValid(expiresAt)) {
      return accessTokenRef.current
    }

    const trimmedSecret = secret.trim()
    if (!trimmedSecret) {
      throw new OpenSymbolsError('Enter your API secret before searching.')
    }

    const result = await fetchAccessToken(trimmedSecret)
    saveAccessToken(result.accessToken, result.expiresAt)
    return result.accessToken
  }, [expiresAt, saveAccessToken, secret])

  const search = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim()
      if (!trimmedQuery) {
        return []
      }

      let token = await ensureAccessToken()
      try {
        return await searchSymbols(token, trimmedQuery)
      } catch (err) {
        if (err instanceof OpenSymbolsError && err.status === 401) {
          invalidateAccessToken()
          token = await ensureAccessToken()
          return await searchSymbols(token, trimmedQuery)
        }
        throw err
      }
    },
    [ensureAccessToken, invalidateAccessToken],
  )

  const logout = useCallback(() => {
    clearStoredAuth()
    setSecretState('')
    setAccessToken(null)
    setExpiresAt(null)
    accessTokenRef.current = null
    setIsAuthenticated(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      secret,
      isAuthenticated,
      hasValidToken: Boolean(accessToken && expiresAt && isTokenValid(expiresAt)),
      setSecret,
      ensureAccessToken,
      invalidateAccessToken,
      search,
      logout,
    }),
    [
      accessToken,
      ensureAccessToken,
      expiresAt,
      invalidateAccessToken,
      isAuthenticated,
      logout,
      search,
      secret,
      setSecret,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
