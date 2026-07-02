'use client'

interface ProgressRingProps {
  total: number
  goal: number
  size?: number
}

const CIRCUMFERENCE = 188

export function ProgressRing({ total, goal, size = 72 }: ProgressRingProps) {
  const pct = goal > 0 ? total / goal : 0
  const offset = CIRCUMFERENCE - Math.min(CIRCUMFERENCE, pct * CIRCUMFERENCE)
  const pctLabel = Math.round(pct * 100)

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 60 60" className="-rotate-90">
        <circle cx="30" cy="30" r="26" fill="none" stroke="#eef1f8" strokeWidth={6} />
        <circle
          cx="30"
          cy="30"
          r="26"
          fill="none"
          stroke="#0D518C"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset .5s ease' }}
        />
      </svg>
      <div
        className="absolute inset-0 grid place-items-center font-extrabold text-[#1E3A5F]"
        style={{ fontSize: size <= 44 ? 11 : 15 }}
      >
        {pctLabel}%
      </div>
    </div>
  )
}
