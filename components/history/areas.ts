export type AreaKey = 'sp' | 'ni' | 'to' | 'ma' | 'uj' | 'ot'

export interface AreaConfig {
  key: AreaKey
  label: string
  color: string
}

export const AREAS: AreaConfig[] = [
  { key: 'sp', label: 'S.Ppal', color: '#2563EB' },
  { key: 'ni', label: 'Niños', color: '#8B5CF6' },
  { key: 'to', label: 'Toldo', color: '#60A5FA' },
  { key: 'ma', label: 'Maestros', color: '#10B981' },
  { key: 'uj', label: 'Ujieres', color: '#F59E0B' },
  { key: 'ot', label: 'Otros', color: '#94A3B8' },
]
