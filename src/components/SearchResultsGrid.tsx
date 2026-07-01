import type { OpenSymbol } from '../api/opensymbols'

const COLS = 5
const ROWS = 2
const ITEMS_PER_PAGE = COLS * ROWS

interface SearchResultsGridProps {
  symbols: OpenSymbol[]
  page: number
  onPageChange: (page: number) => void
  onSelect: (symbol: OpenSymbol) => void
}

export function SearchResultsGrid({
  symbols,
  page,
  onPageChange,
  onSelect,
}: SearchResultsGridProps) {
  const totalPages = Math.max(1, Math.ceil(symbols.length / ITEMS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * ITEMS_PER_PAGE
  const pageItems = symbols.slice(start, start + ITEMS_PER_PAGE)

  return (
    <section className="w-full space-y-4" aria-label="Symbol search results">
      <div
        className="grid grid-cols-5 gap-2"
        style={{ gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))` }}
      >
        {pageItems.map((symbol) => (
          <button
            key={`${symbol.repo_key}-${symbol.symbol_key}-${symbol.id}`}
            type="button"
            onClick={() => onSelect(symbol)}
            title={symbol.name}
            className="flex aspect-square items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 transition hover:border-violet-400 hover:bg-violet-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
          >
            <img
              src={symbol.image_url}
              alt={symbol.name}
              loading="lazy"
              className="h-full w-full object-contain object-center"
            />
          </button>
        ))}
      </div>

      {symbols.length > ITEMS_PER_PAGE && (
        <nav
          className="flex items-center justify-center gap-3"
          aria-label="Results pagination"
        >
          <button
            type="button"
            onClick={() => onPageChange(safePage - 1)}
            disabled={safePage <= 1}
            className="min-h-11 min-w-11 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition enabled:hover:border-violet-300 enabled:hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {safePage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(safePage + 1)}
            disabled={safePage >= totalPages}
            className="min-h-11 min-w-11 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition enabled:hover:border-violet-300 enabled:hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      )}
    </section>
  )
}
