export interface ExportRow {
  date: string
  salon_principal: number
  toldo: number
  salon_l: number
  ujieres: number
  maestros: number
  ninos: number
  multimedia: number
  facebook: number
  zoom: number
  total_general: number
}

const COLUMNS: { key: keyof ExportRow; header: string }[] = [
  { key: 'date', header: 'Fecha' },
  { key: 'salon_principal', header: 'Salón Principal' },
  { key: 'toldo', header: 'Toldo' },
  { key: 'salon_l', header: 'Salón L' },
  { key: 'ujieres', header: 'Ujieres' },
  { key: 'maestros', header: 'Maestros' },
  { key: 'ninos', header: 'Niños' },
  { key: 'multimedia', header: 'Multimedia' },
  { key: 'facebook', header: 'Facebook' },
  { key: 'zoom', header: 'Zoom' },
  { key: 'total_general', header: 'Total' },
]

function escapeCsvValue(value: string | number): string {
  const str = String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function buildHistoryCsv(rows: ExportRow[]): string {
  const header = COLUMNS.map(c => escapeCsvValue(c.header)).join(',')
  const lines = rows.map(row => COLUMNS.map(c => escapeCsvValue(row[c.key])).join(','))
  return [header, ...lines].join('\r\n')
}

export function downloadHistoryCsv(rows: ExportRow[], filename: string): void {
  const csv = buildHistoryCsv(rows)
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
