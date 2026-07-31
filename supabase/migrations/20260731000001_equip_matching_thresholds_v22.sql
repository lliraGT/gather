-- Cierre de calibración F6 v2.2 (2026-07-31): ajusta los umbrales de banda
-- sobre percentiles reales del top-1 de la cohorte completa (n=20) —
-- excellent 0.75->0.66, good 0.60->0.58, moderate sin cambio. Ver
-- calibration-report.md y DEFAULT_MATCHING_CONFIG.thresholds en
-- lib/matching/match.ts (mismo valor, ya committeado en código).
-- Puramente un UPDATE de valor — no toca ninguna otra fila ni estructura.
UPDATE public.equip_matching_config
SET value = '{"excellent":0.66,"good":0.58,"moderate":0.45}', updated_at = now()
WHERE key = 'thresholds';
