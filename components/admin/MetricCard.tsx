'use client'

interface MetricCardProps {
  value: number | string
  label: string
  delta?: number | null
}

export function MetricCard({ value, label, delta }: MetricCardProps) {
  return (
    <div className="bg-white border border-[#dfe3ea] rounded-xl px-[18px] py-3.5 flex flex-col gap-[3px]">
      <span className="text-[26px] font-extrabold tracking-[-0.04em] text-[#1E3A5F] leading-[1.1]">
        {value}
        {delta != null && delta > 0 && (
          <span className="text-[13px] font-bold text-[#16a34a] ml-1.5">&#9650; {delta}</span>
        )}
      </span>
      <span className="text-[11.5px] font-medium text-[#71798a]">{label}</span>
    </div>
  )
}
