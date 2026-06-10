# Gather — Project Context

## Stack
- Next.js 14 App Router + TypeScript + Tailwind CSS
- Supabase (zvlrvnwcckxeqpyrxplw) — no migrar, datos ya cargados
- Vercel: gather-pink.vercel.app
- GitHub: lliraGT/gather
- Icons: Tabler Icons (webfont CDN)
- Charts: Recharts

## Roles
- `ADMIN` — acceso completo
- `EM` — registrar y editar asistencia
- `ANCIANO` — solo lectura

## Design Context

> Leer `PRODUCT.md` y `DESIGN.md` en la raíz del proyecto antes de tocar UI.

**Register:** product (app interna — el diseño sirve al producto)  
**North Star:** "El Libro de Asistencias" — herramienta ministerial precisa, discreta, con el peso de lo que registra  
**Personalidad:** Cálido, cercano, vivo — sin kitsch religioso, sin SaaS genérico, sin rigidez bancaria

**Colores clave:**
- `#1E3A5F` Azul Nocturno — identidad y peso (KPIs, panel de resumen, logo)
- `#2E78C8` Azul Fiel — acción y datos (botones, active states, focus rings, chart lines)
- `#F8F9FA` fondo de página · `#FFFFFF` tarjetas · `#1B1B1B` texto

**Reglas críticas:**
- Azul Nocturno ≠ Azul Fiel — no intercambiarlos (Nocturno = identidad; Fiel = acción)
- El ámbar (`#F59E0B`) solo para líneas de tendencia — nunca decorativo
- Verde/rojo solo para deltas de asistencia — no para estados de UI
- Sin gradientes de texto, sin `border-left` stripe, sin `shadow-md` en tarjetas en reposo
- Todo uppercase debe llevar `letter-spacing` mínimo 0.05em

**Componente firma:** panel de resumen navy (`bg-[#1E3A5F]`) — la inversión del sistema. Botones dentro: `bg-white text-[#1E3A5F]` (primary) y `border border-white/30 text-white/80` (ghost).

**Principios de diseño:**
1. Los números representan personas — la interfaz lo recuerda
2. Claridad sin esfuerzo para usuarios no técnicos
3. Calidez disciplinada — sin adornos religiosos
4. Responsive real: móvil y laptop como ciudadanos de primera clase
5. Herramienta invisible — facilita sin protagonizar
