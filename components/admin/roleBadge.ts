export const ROLE_BADGE: Record<'ADMIN' | 'EM' | 'ANCIANO', { label: string; bg: string; text: string }> = {
  ADMIN: { label: 'Admin', bg: '#e8f0fb', text: '#0D518C' },
  EM: { label: 'EM', bg: '#d3e2f3', text: '#1E3A5F' },
  ANCIANO: { label: 'Anciano', bg: '#eef1f6', text: '#45506a' },
}

// Proyecto Supabase compartido con Equip: profiles.role puede traer roles
// que Gather no define (ej. 'MIEMBRO'). Fallback neutro para no romper la UI.
export function getRoleBadge(role: string | null | undefined): { label: string; bg: string; text: string } {
  const known = ROLE_BADGE[role as keyof typeof ROLE_BADGE]
  if (known) return known
  const raw = role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : 'Sin rol'
  return { label: raw, bg: '#f3f4f6', text: '#6b7280' }
}
