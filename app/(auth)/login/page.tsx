// app/(auth)/login/page.tsx
// Login renovado — split editorial CLARO (versión aprobada).
// Mantiene intacta tu lógica Supabase, redirección con ?next, error/loading
// y el enlace a /auth/forgot-password.
//
// NOTA sobre el design system: este diseño se aparta de DESIGN.md en 3 puntos
// (decisión explícita del usuario sobre el look aprobado):
//   1. Acento de acción #0D518C  (DESIGN.md usa Azul Fiel #2E78C8)
//   2. Panel decorativo con degradado celeste (DESIGN.md prefiere el panel
//      firma navy #1E3A5F, plano)
//   3. Tipografía Plus Jakarta Sans (DESIGN.md usa system-ui)
// Para volver al sistema puro: cambia ACCENT a '#2E78C8' y el degradado del
// panel a un fondo sólido '#1E3A5F' con texto blanco.
//
// FUENTE: para el look exacto, añade Plus Jakarta Sans con next/font en
// app/layout.tsx:
//   import { Plus_Jakarta_Sans } from 'next/font/google'
//   const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })
//   ...<body className={jakarta.variable}>  + en tailwind.config: fontFamily.sans

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GatherLogo } from '@/components/ui/GatherLogo'

const ACCENT = '#0D518C'

const VERSES = [
  { text: 'Y considerémonos unos a otros para estimularnos al amor y a las buenas obras.', ref: 'Hebreos 10:24' },
  { text: 'Donde están dos o tres congregados en mi nombre, allí estoy yo en medio de ellos.', ref: 'Mateo 18:20' },
  { text: 'No dejando de congregarnos, sino exhortándonos.', ref: 'Hebreos 10:25' },
  { text: 'Cada día acudían unánimes al templo y partían el pan con alegría.', ref: 'Hechos 2:46' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx((p) => (p + 1) % VERSES.length)
        setVisible(true)
      }, 450)
    }, 6500)
    return () => clearInterval(id)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
    } else {
      const params = new URLSearchParams(window.location.search)
      const next = params.get('next') ?? '/dashboard'
      router.refresh() // CRÍTICO: invalida cache antes de navegar
      router.push(next)
    }
  }

  const verse = VERSES[idx]

  return (
    <div className="flex min-h-screen bg-white">
      {/* ---------- Formulario ---------- */}
      <section className="flex w-full flex-col justify-between px-6 py-11 md:w-[46%] md:px-[6vw]">
        <div className="flex items-center gap-2.5">
          <GatherLogo size={30} />
          <span className="text-base font-extrabold tracking-[-0.01em] text-[#1E3A5F]">GATHER</span>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[368px] self-center">
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em] text-[#141c30]">
            Bienvenido de nuevo
          </h1>
          <p className="mb-7 mt-2.5 text-sm text-[#71798a]">
            Inicia sesión para gestionar la asistencia dominical.
          </p>

          <div className="space-y-[17px]">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-[#475063]">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="nombre@iglesia.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="h-12 w-full rounded-xl border border-[#dfe3ea] px-3.5 text-base text-[#141c30] outline-none transition focus:border-[#0D518C] focus:ring-[3.5px] focus:ring-[#0D518C]/15 md:text-sm"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label htmlFor="password" className="block text-xs font-semibold text-[#475063]">
                  Contraseña
                </label>
                <a href="/auth/forgot-password" className="text-xs font-semibold text-[#0D518C] hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="h-12 w-full rounded-xl border border-[#dfe3ea] pl-3.5 pr-11 text-base text-[#141c30] outline-none transition focus:border-[#0D518C] focus:ring-[3.5px] focus:ring-[#0D518C]/15 md:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  tabIndex={-1}
                  aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:text-gray-600"
                >
                  {showPw ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2l20 20M6.7 6.7C4.4 8.1 2.7 10.3 2 12c1.7 4 6 7 10 7 1.8 0 3.5-.5 5-1.3M9.9 5.2A9.7 9.7 0 0112 5c4 0 8.3 3 10 7-.6 1.5-1.7 3-3.1 4.2" /><path d="M9.9 9.9a3 3 0 004.2 4.2" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
              {error && <p className="mt-2 text-xs text-[#DC2626]">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: ACCENT, boxShadow: '0 1px 2px rgba(13,81,140,.34), 0 8px 22px rgba(13,81,140,.22)' }}
              className="mt-1.5 h-12 w-full rounded-xl text-sm font-semibold text-white transition hover:brightness-90 disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>
        </form>

        <p className="text-xs text-[#9aa2b2]">Centro Bíblico El Camino · Control de asistencia</p>
      </section>

      {/* ---------- Panel decorativo claro ---------- */}
      <aside
        className="relative hidden flex-1 flex-col justify-between overflow-hidden border-l border-[#e6ebf5] px-[4vw] py-[7vh] md:flex"
        style={{ background: 'linear-gradient(160deg,#eef3fd 0%,#e2ebfb 55%,#dbe6fa 100%)' }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage: 'radial-gradient(#c3d4f5 1.1px, transparent 1.1px)',
            backgroundSize: '22px 22px',
            WebkitMaskImage: 'radial-gradient(120% 100% at 80% 0%, #000, transparent 75%)',
            maskImage: 'radial-gradient(120% 100% at 80% 0%, #000, transparent 75%)',
          }}
        />
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(120,160,240,.30), transparent 65%)' }}
        />
        <div className="relative">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#0D518C]">
            Centro Bíblico El Camino
          </span>
          <h2 className="mt-5 max-w-[400px] text-[33px] font-bold leading-[1.18] tracking-[-0.02em] text-[#1a2950]">
            Cada domingo cuenta. Reúne a tu comunidad.
          </h2>
          <p className="mt-4 max-w-[380px] text-sm leading-relaxed text-[#516189]">
            Registra la asistencia, da seguimiento a los miembros y haz crecer la familia de la iglesia, domingo a domingo.
          </p>
        </div>

        <div
          className="relative border-l-[3px] border-[#0D518C] pl-5 transition-all duration-500"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(6px)' }}
        >
          <p className="m-0 max-w-[420px] text-[17px] font-medium italic leading-snug text-[#2a3760]">
            &ldquo;{verse.text}&rdquo;
          </p>
          <p className="mt-2.5 text-[13px] font-bold text-[#0D518C]">{verse.ref}</p>
        </div>
      </aside>
    </div>
  )
}
