'use client'

export function GatherLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="14" r="9" fill="#2E78C8"/>
      <circle cx="8" cy="28" r="6" fill="#7BB3E8"/>
      <circle cx="32" cy="28" r="6" fill="#7BB3E8"/>
      <line x1="20" y1="14" x2="8" y2="28" stroke="#1E3A5F" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="20" y1="14" x2="32" y2="28" stroke="#1E3A5F" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}
