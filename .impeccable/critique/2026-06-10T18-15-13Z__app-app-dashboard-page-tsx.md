---
timestamp: 2026-06-10T18-15-13Z
slug: app-app-dashboard-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | No visual transition when period filter changes |
| 2 | Match System / Real World | 3 | "Al alza +N/sem." slope terminology may be opaque for non-analysts |
| 3 | User Control and Freedom | 3 | Read-only surface; filters give sufficient exploration control |
| 4 | Consistency and Standards | 3 | border-t-2 on only one card breaks flat-by-default pattern |
| 5 | Error Prevention | 3 | Read-only; fetchError now correctly isolated from empty state |
| 6 | Recognition Rather Than Recall | 3 | All labeled; KPI date eliminates need to remember which Sunday |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcuts; table ignores active period filter |
| 8 | Aesthetic and Minimalist Design | 3 | Clean hierarchy; border-t-2 is only visual noise |
| 9 | Error Recovery | 3 | Clear messages, actionable retry, empty-state CTA |
| 10 | Help and Documentation | 1 | No tooltips, no context for trend math, no first-run guidance |
| **Total** | | **27/40** | **Acceptable — upper edge, 1 point below Good** |

## Anti-Patterns Verdict

**LLM assessment**: Passes AI slop test. No gradient text, no glassmorphism, no identical card grid, no eyebrow uppercase. The 2/3+1/3 KPI layout actively breaks the hero-metric template. Color vocabulary is disciplined: amber only for trend line, green/red only for deltas, navy for identity. The interface has visual personality that is earned, not decorative.

**Deterministic scan**: 3 findings. 1 real, 2 false positives.
- Real: `border-t-2` on `rounded-xl` card (line 241) — the top border accent starts inside the rounded corner radius, creating a floating-stripe effect rather than a clean top edge.
- False positives (x2): `text-gray-500 on bg-green-50` at lines 249 and 261 — detector cannot resolve ternary JSX; neutral gray text only appears on bg-gray-100, never on colored backgrounds.

## Overall Impression

The dashboard went from a SaaS template clone to a purposeful pastoral tool. Score jumped from 21 to 27. What remains: the border-t-2 is a minor visual bug, the table doesn't follow the period filter (confusing when set to "Año 2024" but table shows recent weeks globally), and the interface is silent when a first-time user needs orientation.

## What's Working

1. **KPI hierarchy**: 5xl primary number with "Último domingo · 8 jun." gives the answer to "¿cómo vamos?" in one glance. The 2/3+1/3 layout makes the primary card dominant.
2. **Semantic color system**: Green/red for deltas, amber for trend line, red for downtrend badge. Each color does exactly one job.
3. **Error resilience**: fetchError != empty state; retry button prominent; empty state has CTA. Three states clearly distinct.

## Priority Issues

**[P2] border-t-2 on rounded-xl primary KPI card**
- Why it matters: The border starts inside the rounded corner radius, creating a floating strip that looks like a misalignment bug rather than intentional hierarchy.
- Fix: Replace border-t-2 border-[#1E3A5F] with bg-[#E6F0FA] (blue-surface token from DESIGN.md) as a subtle background tint.
- Suggested command: /impeccable polish

**[P2] Table doesn't respect active period filter**
- Why it matters: User viewing "Año 2024" sees the chart scoped to 2024 but the table shows the 8 most recent weeks globally — mental model breaks.
- Fix: Change tableRows = servicesWithData.slice(0,8) to tableRows = filteredServices.slice(0,8).
- Suggested command: /impeccable harden

**[P2] Help entirely absent (H10: 1/4)**
- Why it matters: "Al alza +3/sem." requires knowing linear regression slope. Non-analytical leaders are the explicit audience.
- Fix: Add title attribute tooltips on trend badge and KPI sub-labels.
- Suggested command: /impeccable clarify

**[P3] Filter period transition has no visual feedback**
- Why it matters: Instant chart recompute on slow devices looks like a brief bug.
- Fix: Add transition-opacity duration-150 on chart container.
- Suggested command: /impeccable animate

## Persona Red Flags

**Sam (Accessibility)**: Recharts LineChart has no aria-label, no role="img". Period filter buttons have no aria-pressed. Trend badge has no aria-live region.

**Don Miguel (Pastoral Leader)**: "Al alza +3/sem." opaque without statistical context. "Prom. ant.: 142" has no time reference. Two charts may overwhelm when one KPI number suffices.

## Minor Observations

- h1 "Dashboard" is English in a Spanish interface — "Resumen" more consistent
- Breakdown chart uses color-only to distinguish lines — dashed stroke would help color-blind users
- text-5xl at 320px viewport: 48px numbers in "1234" should fit but worth checking
- availableYears filters past years only — current year via "Este año"; could confuse in January with 1-2 data points

## Questions to Consider

- What if the trend badge had a one-tap expand that explained the math in plain Spanish?
- Does the "Historial reciente" table need to exist, or does the chart already tell the same story for visual thinkers?
- What would "un vistazo antes de entrar al santuario" look like on mobile?
