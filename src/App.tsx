import { useState } from 'react'
import type { OpenSymbol } from './api/opensymbols'
import { BoardGrid } from './components/BoardGrid'
import { BoardSetup } from './components/BoardSetup'
import { ThemeToggle } from './components/ThemeToggle'
import { SymbolSearchModal } from './components/SymbolSearchModal'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { outlineButtonClassName } from './lib/uiClasses'
import {
  createEmptyBoard,
  parseGridDimension,
  type BoardConfig,
  type GridCell,
} from './types/board'

function AppContent() {
  const { isAuthenticated, setSecret, logout } = useAuth()
  const [rowsInput, setRowsInput] = useState('3')
  const [colsInput, setColsInput] = useState('4')
  const [setupError, setSetupError] = useState<string | null>(null)
  const [boardConfig, setBoardConfig] = useState<BoardConfig | null>(null)
  const [cells, setCells] = useState<GridCell[]>([])
  const [activeCellIndex, setActiveCellIndex] = useState<number | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const handleCreateBoard = (rows: number, cols: number) => {
    setSetupError(null)
    setBoardConfig({ rows, cols })
    setCells(createEmptyBoard({ rows, cols }))
    setActiveCellIndex(null)
  }

  const handleCellClick = (index: number) => {
    setActiveCellIndex(index)
  }

  const handleSaveLabel = (cellIndex: number, label: string) => {
    setCells((prev) =>
      prev.map((cell, index) =>
        index === cellIndex ? { ...cell, label } : cell,
      ),
    )
  }

  const handleRemoveSymbol = (cellIndex: number) => {
    setCells((prev) =>
      prev.map((cell, index) =>
        index === cellIndex ? { symbol: null, label: '' } : cell,
      ),
    )
  }

  const handleSymbolSelect = (
    cellIndex: number,
    symbol: OpenSymbol,
    label: string,
  ) => {
    setCells((prev) =>
      prev.map((cell, index) =>
        index === cellIndex ? { symbol, label } : cell,
      ),
    )
  }

  const resetBoard = () => {
    setBoardConfig(null)
    setCells([])
    setActiveCellIndex(null)
  }

  const handleNewBoard = () => {
    resetBoard()
    setExportError(null)
  }

  const handleExportPdf = async () => {
    if (!boardConfig) {
      return
    }

    setExportingPdf(true)
    setExportError(null)

    const pdf = await import('./lib/exportBoardPdf')

    try {
      await pdf.exportBoardToPdf(boardConfig, cells)
    } catch (err) {
      console.error('PDF export failed:', err)
      setExportError(
        err instanceof Error
          ? err.message
          : 'Failed to export PDF. Please try again.',
      )
    } finally {
      setExportingPdf(false)
    }
  }

  const handleLogout = () => {
    logout()
    resetBoard()
    setSetupError(null)
  }

  const validateSetupInputs = (secretInput: string): string | null => {
    if (!isAuthenticated && !secretInput.trim()) {
      return 'Please paste your OpenSymbols code.'
    }
    if (parseGridDimension(rowsInput) === null) {
      return 'Rows must be a number between 1 and 12.'
    }
    if (parseGridDimension(colsInput) === null) {
      return 'Columns must be a number between 1 and 12.'
    }
    return null
  }

  const handleSetupAttempt = (rows: number, cols: number, secretInput: string) => {
    const validationError = validateSetupInputs(secretInput)
    if (validationError) {
      setSetupError(validationError)
      return
    }

    if (!isAuthenticated) {
      setSecret(secretInput.trim())
    }

    handleCreateBoard(rows, cols)
  }

  return (
    <main className="flex min-h-svh flex-col items-center px-4 py-10">
      <div className="relative w-full max-w-5xl space-y-8">
        <div className="absolute right-0 top-0 flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className={`${outlineButtonClassName} hover:border-red-300 hover:text-red-700 dark:hover:border-red-500 dark:hover:text-red-400`}
            >
              Logout
            </button>
          )}
        </div>

        <header className="space-y-2 pt-12 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
            Grid Builder
          </h1>
          <p className="text-base text-slate-600 sm:text-lg dark:text-slate-400">
            {boardConfig
              ? 'Click a cell to search and add a symbol'
              : 'Set up your board to get started'}
          </p>
        </header>

        {!boardConfig ? (
          <BoardSetup
            isAuthenticated={isAuthenticated}
            rowsInput={rowsInput}
            colsInput={colsInput}
            error={setupError}
            onRowsChange={setRowsInput}
            onColsChange={setColsInput}
            onSubmit={handleSetupAttempt}
          />
        ) : (
          <>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={exportingPdf}
                className="min-h-11 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exportingPdf ? 'Exporting…' : 'Export PDF'}
              </button>
              <button
                type="button"
                onClick={handleNewBoard}
                className={outlineButtonClassName}
              >
                New board
              </button>
            </div>
            {exportError && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
              >
                {exportError}
              </p>
            )}
            <BoardGrid
              rows={boardConfig.rows}
              cols={boardConfig.cols}
              cells={cells}
              onCellClick={handleCellClick}
            />
          </>
        )}

        {activeCellIndex !== null && boardConfig && (
          <SymbolSearchModal
            cellIndex={activeCellIndex}
            initialLabel={cells[activeCellIndex]?.label ?? ''}
            hasExistingSymbol={cells[activeCellIndex]?.symbol !== null}
            onClose={() => setActiveCellIndex(null)}
            onSelect={handleSymbolSelect}
            onSaveLabel={handleSaveLabel}
            onRemoveSymbol={handleRemoveSymbol}
          />
        )}
      </div>
    </main>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
