'use client'

interface ViewToggleProps {
  value: 'cards' | 'list'
  onChange: (value: 'cards' | 'list') => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex border border-[#dfe3ea] rounded-[9px] overflow-hidden flex-shrink-0">
      <button
        type="button"
        onClick={() => onChange('list')}
        className={`flex items-center gap-1.5 px-3 py-[7px] text-[12.5px] font-semibold transition-colors ${
          value === 'list' ? 'bg-[#0D518C] text-white' : 'bg-white text-[#71798a] hover:bg-[#f0f4fa] hover:text-[#141c30]'
        }`}
      >
        <i className="ti ti-list text-[13px]" aria-hidden="true" />
        <span className="hidden sm:inline">Lista</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('cards')}
        className={`flex items-center gap-1.5 px-3 py-[7px] text-[12.5px] font-semibold transition-colors ${
          value === 'cards' ? 'bg-[#0D518C] text-white' : 'bg-white text-[#71798a] hover:bg-[#f0f4fa] hover:text-[#141c30]'
        }`}
      >
        <i className="ti ti-layout-grid text-[13px]" aria-hidden="true" />
        <span className="hidden sm:inline">Cards</span>
      </button>
    </div>
  )
}
