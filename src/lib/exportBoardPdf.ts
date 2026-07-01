import { jsPDF } from 'jspdf'
import type { BoardConfig, GridCell } from '../types/board'

const PAGE_MARGIN_MM = 12
const CELL_PADDING_MM = 2
const LABEL_HEIGHT_RATIO = 0.22
const BORDER_LINE_WIDTH = 0.6
const FALLBACK_IMAGE_SIZE_PX = 256

export class PdfExportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PdfExportError'
  }
}

interface RasterizedImage {
  dataUrl: string
  width: number
  height: number
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read image data'))
    reader.readAsDataURL(blob)
  })
}

function rasterizeImageSource(source: string): Promise<RasterizedImage | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'

    image.onload = () => {
      try {
        const width = image.naturalWidth || FALLBACK_IMAGE_SIZE_PX
        const height = image.naturalHeight || FALLBACK_IMAGE_SIZE_PX
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        if (!context) {
          resolve(null)
          return
        }

        context.drawImage(image, 0, 0, width, height)
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          width,
          height,
        })
      } catch {
        resolve(null)
      }
    }

    image.onerror = () => resolve(null)
    image.src = source
  })
}

async function loadImageForPdf(url: string): Promise<RasterizedImage | null> {
  try {
    const response = await fetch(url)
    if (response.ok) {
      const blob = await response.blob()
      const dataUrl = await blobToDataUrl(blob)
      const rasterized = await rasterizeImageSource(dataUrl)
      if (rasterized) {
        return rasterized
      }
    }
  } catch {
    // Fall through to direct URL rasterization.
  }

  return rasterizeImageSource(url)
}

function drawGridLines(
  doc: jsPDF,
  gridX: number,
  gridY: number,
  gridWidth: number,
  gridHeight: number,
  cols: number,
  rows: number,
): void {
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(BORDER_LINE_WIDTH)
  doc.rect(gridX, gridY, gridWidth, gridHeight)

  const cellWidth = gridWidth / cols
  const cellHeight = gridHeight / rows

  for (let col = 1; col < cols; col += 1) {
    const x = gridX + col * cellWidth
    doc.line(x, gridY, x, gridY + gridHeight)
  }

  for (let row = 1; row < rows; row += 1) {
    const y = gridY + row * cellHeight
    doc.line(gridX, y, gridX + gridWidth, y)
  }
}

async function drawCellContent(
  doc: jsPDF,
  cell: GridCell,
  cellX: number,
  cellY: number,
  cellWidth: number,
  cellHeight: number,
): Promise<void> {
  const labelHeight = cell.label ? cellHeight * LABEL_HEIGHT_RATIO : 0
  const imageAreaHeight = Math.max(cellHeight - labelHeight - CELL_PADDING_MM * 2, 1)
  const imageAreaWidth = Math.max(cellWidth - CELL_PADDING_MM * 2, 1)

  if (cell.symbol) {
    try {
      const image = await loadImageForPdf(cell.symbol.image_url)
      if (image && image.width > 0 && image.height > 0) {
        const scale = Math.min(
          imageAreaWidth / image.width,
          imageAreaHeight / image.height,
        )
        const width = image.width * scale
        const height = image.height * scale
        const imageX = cellX + (cellWidth - width) / 2
        const imageY = cellY + CELL_PADDING_MM + (imageAreaHeight - height) / 2

        doc.addImage(image.dataUrl, 'PNG', imageX, imageY, width, height)
      }
    } catch (error) {
      console.warn('Failed to embed symbol in PDF cell:', cell.symbol.name, error)
    }
  }

  if (cell.label) {
    const fontSize = Math.max(8, Math.min(14, cellWidth * 0.9))
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(fontSize)
    doc.setTextColor(0, 0, 0)

    const maxTextWidth = cellWidth - CELL_PADDING_MM * 2
    const lines = doc.splitTextToSize(cell.label, maxTextWidth)
    const lineHeight = fontSize * 0.4
    const textBlockHeight = lines.length * lineHeight
    const labelTop = cellY + cellHeight - CELL_PADDING_MM - labelHeight
    const textY = labelTop + (labelHeight - textBlockHeight) / 2 + lineHeight

    doc.text(lines, cellX + cellWidth / 2, textY, {
      align: 'center',
      maxWidth: maxTextWidth,
    })
  }
}

export async function exportBoardToPdf(
  config: BoardConfig,
  cells: GridCell[],
  filename = 'grid-board.pdf',
): Promise<void> {
  const { rows, cols } = config

  if (cells.length !== rows * cols) {
    throw new PdfExportError('Board cell count does not match grid dimensions.')
  }

  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const gridWidth = pageWidth - PAGE_MARGIN_MM * 2
    const gridHeight = pageHeight - PAGE_MARGIN_MM * 2
    const cellWidth = gridWidth / cols
    const cellHeight = gridHeight / rows

    drawGridLines(
      doc,
      PAGE_MARGIN_MM,
      PAGE_MARGIN_MM,
      gridWidth,
      gridHeight,
      cols,
      rows,
    )

    for (let index = 0; index < cells.length; index += 1) {
      const row = Math.floor(index / cols)
      const col = index % cols
      const cellX = PAGE_MARGIN_MM + col * cellWidth
      const cellY = PAGE_MARGIN_MM + row * cellHeight

      await drawCellContent(doc, cells[index], cellX, cellY, cellWidth, cellHeight)
    }

    doc.save(filename)
  } catch (error) {
    if (error instanceof PdfExportError) {
      throw error
    }

    const message =
      error instanceof Error ? error.message : 'Unknown PDF export error'
    throw new PdfExportError(message)
  }
}
