const MONTH_ABBR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MONTH_FULL = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

// All inputs are "yyyy-mm-dd" strings. Use string slicing, never `new Date(date)`
// directly — this codebase always appends 'T00:00:00' before constructing Date
// objects from these strings to avoid UTC-shift bugs; slicing sidesteps the issue
// entirely for these simple extractions.

export function monthKey(date: string): string {
  return date.slice(0, 7)
}

export function dayNumber(date: string): string {
  return String(parseInt(date.slice(8, 10), 10))
}

export function monthAbbr(date: string): string {
  const monthIndex = parseInt(date.slice(5, 7), 10) - 1
  return MONTH_ABBR[monthIndex]
}

export function monthAbbrCapitalized(date: string): string {
  const abbr = monthAbbr(date)
  return abbr[0].toUpperCase() + abbr.slice(1)
}

export function monthSectionLabel(key: string): string {
  const [year, month] = key.split('-')
  const monthIndex = parseInt(month, 10) - 1
  return `${MONTH_FULL[monthIndex].toUpperCase()} ${year}`
}

export function monthRangeLabel(oldestDate: string, newestDate: string): string {
  const oldest = `${monthAbbrCapitalized(oldestDate)} ${oldestDate.slice(0, 4)}`
  const newest = `${monthAbbrCapitalized(newestDate)} ${newestDate.slice(0, 4)}`
  return oldest === newest ? oldest : `${oldest} — ${newest}`
}
