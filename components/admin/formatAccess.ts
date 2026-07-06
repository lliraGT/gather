const MONTH_ABBR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function formatRelative(dateIso: string): string {
  const date = new Date(dateIso)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMin < 1) return 'Ahora'
  if (diffMin < 60) return `Hace ${diffMin} min`
  if (diffHours < 24) return `Hace ${diffHours} h`
  if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 5) return `Hace ${diffWeeks} sem`
  const diffMonths = Math.floor(diffDays / 30)
  return `Hace ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`
}

export function formatAbsolute(dateIso: string): string {
  const date = new Date(dateIso)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const time = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
  if (isToday) return `Hoy, ${time}`
  return `${date.getDate()} ${MONTH_ABBR[date.getMonth()]}, ${time}`
}
