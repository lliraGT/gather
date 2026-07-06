'use client'

export type FilterKey = 'all' | 'ADMIN' | 'EM' | 'ANCIANO' | 'inactive' | 'pending'

interface FilterChipsProps {
  value: FilterKey
  onChange: (value: FilterKey) => void
}

const CHIPS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'ADMIN', label: 'Admins' },
  { key: 'EM', label: 'EM' },
  { key: 'ANCIANO', label: 'Ancianos' },
  { key: 'inactive', label: 'Inactivos' },
  { key: 'pending', label: 'Pendientes' },
]

export function FilterChips({ value, onChange }: FilterChipsProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {CHIPS.map(chip => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onChange(chip.key)}
          className={`px-[13px] py-[5.5px] rounded-full border text-[12px] font-semibold transition-all duration-150 ${
            value === chip.key
              ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white'
              : 'bg-white border-[#dfe3ea] text-[#71798a] hover:text-[#0D518C] hover:border-[#c8d8ec]'
          }`}
        >
          {chip.label}
        </button>
      ))}
    </div>
  )
}
