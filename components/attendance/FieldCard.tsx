'use client'

interface FieldCardProps {
  label: string
  value: number
  onChange: (value: string) => void
}

const BTN_CLASS = 'w-11 h-11 md:w-[34px] md:h-[34px]'

export function FieldCard({ label, value, onChange }: FieldCardProps) {
  function dec() {
    onChange(String(Math.max(0, value - 1)))
  }

  function inc() {
    onChange(String(value + 1))
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value.replace(/\D/g, ''))
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    if (e.target.value === '') onChange('0')
  }

  return (
    <div className="bg-white border border-[#dfe3ea] rounded-xl px-4 py-3.5 flex items-center justify-between gap-3 transition-colors focus-within:border-[#0D518C]">
      <span className="text-sm font-semibold text-[#141c30]">{label}</span>
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <button
          type="button"
          onClick={dec}
          aria-label={`Restar a ${label}`}
          className={`${BTN_CLASS} flex-shrink-0 rounded-lg border border-[#dfe3ea] bg-[#f4f6fb] text-lg font-bold text-[#71798a] grid place-items-center transition-colors hover:bg-[#e8f0fb] hover:text-[#0D518C] hover:border-[#bdd4f0]`}
        >
          &minus;
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={handleInput}
          onFocus={e => e.target.select()}
          onBlur={handleBlur}
          aria-label={label}
          className="w-[52px] text-center text-[26px] font-extrabold tracking-[-0.05em] text-[#1E3A5F] bg-transparent border-none outline-none"
        />
        <button
          type="button"
          onClick={inc}
          aria-label={`Sumar a ${label}`}
          className={`${BTN_CLASS} flex-shrink-0 rounded-lg border border-[#dfe3ea] bg-[#f4f6fb] text-lg font-bold text-[#71798a] grid place-items-center transition-colors hover:bg-[#0D518C] hover:text-white hover:border-[#0D518C]`}
        >
          +
        </button>
      </div>
    </div>
  )
}
