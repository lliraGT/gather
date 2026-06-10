---
target: dashboard
total_score: 21
p0_count: 2
p1_count: 2
timestamp: 2026-06-10T17-23-15Z
slug: app-app-dashboard-page-tsx
---
# Critique: Gather Dashboard

## Design Health Score

| # | Heurística | Score | Problema clave |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Loading skeleton ok; fetch fallido muestra dashboard vacío sin mensaje |
| 2 | Match System / Real World | 4 | Español GT nativo, vocabulario natural, fechas localizadas |
| 3 | User Control and Freedom | 2 | Filtros OK; sin exportar, sin drill-down, sin undo |
| 4 | Consistency and Standards | 2 | Badge de tendencia amber para ↑ Y ↓ — mismo color, distinto significado |
| 5 | Error Prevention | 2 | Fetch falla silenciosamente y muestra dashboard vacío sin explicación |
| 6 | Recognition Rather Than Recall | 3 | Mayormente visible; "Var." ambiguo; "12w"/"ytd" no obvio |
| 7 | Flexibility and Efficiency | 1 | Sin atajos, sin exportar, sin drill-down |
| 8 | Aesthetic and Minimalist Design | 2 | Grid 3 tarjetas idénticas (SaaS template); dos gráficas compitiendo |
| 9 | Error Recovery | 1 | Fallos silenciosos; empty state sin CTA ni guía |
| 10 | Help and Documentation | 1 | Sin tooltips, sin explicación de métricas, "+2/sem" es jerga |
| **Total** | | **21/40** | **Acceptable** |

## Anti-Patterns Verdict

Dashboard tiene color correcto pero arquitectura SaaS genérica. Tres tarjetas idénticas = hero-metric template prohibido. Assessment B: 2 findings (ambos falsos positivos — ternario estático en className badges).

## Priority Issues

- [P0] Grid de 3 tarjetas KPI idénticas — SaaS template explícitamente prohibido en DESIGN.md
- [P0] Badge de tendencia: amber para ↑ Y ↓ — fallo semántico, daltónico-unsafe
- [P1] Fetch silencioso — empty state ≠ error, usuario no sabe diferencia
- [P1] Filtro de período mezcla fijos + dinámicos, labels abreviados para usuarios no-técnicos
- [P2] "Var." columna ambigua — variación ¿de qué?

## Persona Red Flags

- Padre Miguel: título "Dashboard" corporativo; "+2/sem" jerga matemática; sin contexto de salud de la congregación
- Casey: filtro ocupa 40% viewport en mobile sobre el fold; gráficas ilegibles en salón
- Sam: ↑/↓ sin aria-label; tooltips no accesibles por teclado; text-gray-400 falla WCAG AA

## Minor Observations

- text-gray-400 (#9CA3AF) en sublabels KPI falla contraste WCAG AA (~2.5:1 en fondo blanco)
- Tabla siempre "Últimas 8 semanas" aunque filtro sea "Histórico" — desincronizado
- "↓ -5" en Var. tiene signo redundante
- Recharts tooltip border casi invisible en blanco
