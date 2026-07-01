import { useState, type FormEvent } from 'react'
import { parseGridDimension } from '../types/board'

interface BoardSetupProps {
  isAuthenticated: boolean
  rowsInput: string
  colsInput: string
  error: string | null
  onRowsChange: (value: string) => void
  onColsChange: (value: string) => void
  onSubmit: (rows: number, cols: number, secretInput: string) => void
}

export function BoardSetup({
  isAuthenticated,
  rowsInput,
  colsInput,
  error,
  onRowsChange,
  onColsChange,
  onSubmit,
}: BoardSetupProps) {
  const [secretInput, setSecretInput] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const rows = parseGridDimension(rowsInput)
    const cols = parseGridDimension(colsInput)

    if (rows === null || cols === null) {
      return
    }

    onSubmit(rows, cols, secretInput)
  }

  const rows = parseGridDimension(rowsInput)
  const cols = parseGridDimension(colsInput)
  const isValid =
    (isAuthenticated || secretInput.trim().length > 0) &&
    rows !== null &&
    cols !== null

  const inputClassName =
    'h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 sm:h-14 sm:text-lg'

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {isAuthenticated ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-sm text-emerald-800">
          You’re already signed in. Choose your grid size and tap Create board.
        </p>
      ) : (
        <div className="space-y-2">
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-600">
            To find pictures for your board, you need a code from OpenSymbols.{' '}
            <a
              href="https://www.opensymbols.org/api"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-violet-700 underline underline-offset-2 hover:text-violet-900"
            >
              Open this page
            </a>
            , scroll to <strong>Generate an Access Token</strong>, type your code in the
            box there, then copy it and paste it below.
          </p>
          <label
            htmlFor="api-secret"
            className="block text-left text-sm font-medium text-slate-700"
          >
            Your OpenSymbols code
          </label>
          <input
            id="api-secret"
            type="password"
            value={secretInput}
            onChange={(event) => setSecretInput(event.target.value)}
            placeholder="Paste your code here"
            autoComplete="off"
            className={inputClassName}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="grid-cols"
            className="block text-left text-sm font-medium text-slate-700"
          >
            Columns
          </label>
          <input
            id="grid-cols"
            type="number"
            min={1}
            max={12}
            value={colsInput}
            onChange={(event) => onColsChange(event.target.value)}
            placeholder="e.g. 4"
            className={inputClassName}
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="grid-rows"
            className="block text-left text-sm font-medium text-slate-700"
          >
            Rows
          </label>
          <input
            id="grid-rows"
            type="number"
            min={1}
            max={12}
            value={rowsInput}
            onChange={(event) => onRowsChange(event.target.value)}
            placeholder="e.g. 3"
            className={inputClassName}
          />
        </div>
      </div>

      <p className="text-left text-sm text-slate-500">
        Grid size must be between 1 and 12 for each dimension.
      </p>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!isValid}
        className="h-12 w-full rounded-xl bg-violet-600 text-base font-medium text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 sm:h-14"
      >
        Create board
      </button>
    </form>
  )
}
