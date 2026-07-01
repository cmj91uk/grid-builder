import type { OpenSymbol } from '../api/opensymbols'

export interface GridCell {
  symbol: OpenSymbol | null
  label: string
}

export interface BoardConfig {
  rows: number
  cols: number
}

export function createEmptyBoard({ rows, cols }: BoardConfig): GridCell[] {
  return Array.from({ length: rows * cols }, () => ({
    symbol: null,
    label: '',
  }))
}

export function parseGridDimension(value: string): number | null {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 12) {
    return null
  }
  return parsed
}
