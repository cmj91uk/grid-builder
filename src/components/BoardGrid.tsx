import type { GridCell } from '../types/board'

interface BoardGridProps {
  rows: number
  cols: number
  cells: GridCell[]
  onCellClick: (index: number) => void
}

export function BoardGrid({ rows, cols, cells, onCellClick }: BoardGridProps) {
  return (
    <section
      aria-label="Communication board"
      className="w-full"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        gap: '0.75rem',
      }}
    >
      {cells.map((cell, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onCellClick(index)}
          aria-label={
            cell.symbol
              ? `Edit cell ${index + 1}: ${cell.label || cell.symbol.name}`
              : `Add symbol to cell ${index + 1}`
          }
          className="flex min-h-28 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-3 text-center transition hover:border-violet-400 hover:bg-violet-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-violet-500 dark:hover:bg-violet-950 sm:min-h-36"
        >
          {cell.symbol ? (
            <>
              <img
                src={cell.symbol.image_url}
                alt={cell.symbol.name}
                className="mb-2 max-h-20 w-full flex-1 object-contain object-center sm:max-h-24"
              />
              {cell.label && (
                <span className="w-full truncate text-center text-sm font-medium text-slate-800 sm:text-base dark:text-slate-100">
                  {cell.label}
                </span>
              )}
            </>
          ) : (
            <span className="text-3xl text-slate-400 dark:text-slate-500">+</span>
          )}
        </button>
      ))}
    </section>
  )
}
