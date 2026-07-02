export interface Fields {
  salon_principal: number
  toldo: number
  salon_l: number
  ujieres: number
  maestros: number
  ninos: number
  multimedia: number
  facebook: number
  zoom: number
}

export const FIELD_LABELS: Record<keyof Fields, string> = {
  salon_principal: 'Salón Principal',
  toldo: 'Toldo',
  salon_l: 'Salón L',
  ujieres: 'Ujieres',
  maestros: 'Maestros',
  ninos: 'Niños',
  multimedia: 'Multimedia',
  facebook: 'Facebook',
  zoom: 'Zoom',
}

export const PRESENCIAL_FIELDS: (keyof Fields)[] = [
  'salon_principal', 'toldo', 'salon_l', 'ujieres', 'maestros', 'ninos', 'multimedia'
]
export const VIRTUAL_FIELDS: (keyof Fields)[] = ['facebook', 'zoom']

export const DEFAULT_FIELDS: Fields = {
  salon_principal: 0, toldo: 0, salon_l: 0, ujieres: 0,
  maestros: 0, ninos: 0, multimedia: 0, facebook: 0, zoom: 0,
}

export const META = 300
