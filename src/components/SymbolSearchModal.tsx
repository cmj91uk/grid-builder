import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { OpenSymbolsError, type OpenSymbol } from '../api/opensymbols'
import { useAuth } from '../context/AuthContext'
import { SearchResultsGrid } from './SearchResultsGrid'

interface SymbolSearchModalProps {
  cellIndex: number
  initialLabel: string
  hasExistingSymbol: boolean
  onClose: () => void
  onSelect: (cellIndex: number, symbol: OpenSymbol, label: string) => void
  onSaveLabel: (cellIndex: number, label: string) => void
  onRemoveSymbol: (cellIndex: number) => void
}

export function SymbolSearchModal({
  cellIndex,
  initialLabel,
  hasExistingSymbol,
  onClose,
  onSelect,
  onSaveLabel,
  onRemoveSymbol,
}: SymbolSearchModalProps) {
  const { search } = useAuth()
  const labelInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [label, setLabel] = useState(initialLabel)
  const [symbols, setSymbols] = useState<OpenSymbol[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    setLabel(initialLabel)
  }, [initialLabel, cellIndex])

  useEffect(() => {
    const focusTarget = hasExistingSymbol ? labelInputRef.current : searchInputRef.current
    focusTarget?.focus()
  }, [cellIndex, hasExistingSymbol])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const runSearch = useCallback(
    async (searchQuery: string) => {
      const trimmedQuery = searchQuery.trim()
      if (!trimmedQuery) {
        setSymbols([])
        setHasSearched(false)
        setError(null)
        return
      }

      setLoading(true)
      setError(null)
      setHasSearched(true)
      setPage(1)

      try {
        const results = await search(trimmedQuery)
        setSymbols(results)
      } catch (err) {
        setSymbols([])
        setError(
          err instanceof OpenSymbolsError
            ? err.message
            : 'Something went wrong while searching.',
        )
      } finally {
        setLoading(false)
      }
    },
    [search],
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void runSearch(query)
  }

  const handleSelect = (symbol: OpenSymbol) => {
    onSelect(cellIndex, symbol, label.trim())
    onClose()
  }

  const handleSaveLabel = () => {
    onSaveLabel(cellIndex, label.trim())
    onClose()
  }

  const handleRemoveSymbol = () => {
    onRemoveSymbol(cellIndex)
    setLabel('')
    setQuery('')
    setSymbols([])
    setPage(1)
    setHasSearched(false)
    setError(null)
    searchInputRef.current?.focus()
  }

  const inputClassName =
    'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="symbol-search-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2
              id="symbol-search-title"
              className="text-xl font-semibold text-slate-900"
            >
              {hasExistingSymbol ? 'Edit cell' : 'Choose a symbol'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {hasExistingSymbol
                ? 'Update the label, replace the symbol, or remove it to start fresh.'
                : 'Search OpenSymbols and click a result to place it in this cell.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="min-h-11 min-w-11 rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="modal-label"
              className="block text-sm font-medium text-slate-700"
            >
              Label (optional)
            </label>
            <input
              ref={labelInputRef}
              id="modal-label"
              type="text"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Text shown below the icon"
              className={inputClassName}
            />
          </div>

          {hasExistingSymbol && (
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={handleSaveLabel}
                className="min-h-11 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white transition hover:bg-violet-700"
              >
                Save label
              </button>
              <button
                type="button"
                onClick={handleRemoveSymbol}
                className="min-h-11 rounded-lg border border-red-200 px-4 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-50"
              >
                Remove symbol
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="modal-search"
              className="block text-sm font-medium text-slate-700"
            >
              Search symbols
            </label>
            <div className="flex gap-2">
              <input
                ref={searchInputRef}
                id="modal-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search symbols…"
                autoComplete="off"
                className={`${inputClassName} flex-1`}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="min-h-11 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? '…' : 'Search'}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {loading && (
          <p className="mt-4 text-center text-sm text-slate-500">Loading symbols…</p>
        )}

        {!loading && hasSearched && symbols.length === 0 && !error && (
          <p className="mt-4 text-center text-sm text-slate-500">
            No symbols found. Try a different search term.
          </p>
        )}

        {!loading && symbols.length > 0 && (
          <div className="mt-4">
            <SearchResultsGrid
              symbols={symbols}
              page={page}
              onPageChange={setPage}
              onSelect={handleSelect}
            />
          </div>
        )}
      </div>
    </div>
  )
}
