-- ─── equip_service_areas ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.equip_service_areas (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text UNIQUE NOT NULL,
  name              text NOT NULL,
  description       text,
  gift_profile      jsonb NOT NULL DEFAULT '{}',  -- {"ensenanza":1.0,"conocimiento":0.5,...} pesos 0-1
  skill_profile     jsonb NOT NULL DEFAULT '{}',  -- {"R":0.0,"I":0.8,...} pesos 0-1 sobre las 6
  disc_profile      jsonb NOT NULL DEFAULT '{}',  -- {"D":0.2,"I":0.8,"S":0.6,"C":0.1} pesos 0-1
  passion_groups    text[] NOT NULL DEFAULT '{}', -- strings EXACTOS de los 57 grupos
  passion_types     text[] NOT NULL DEFAULT '{}', -- strings EXACTOS de los 16 tipos
  experience_types  text[] NOT NULL DEFAULT '{}', -- ⊆ {spiritual,religious,painful,failure,victory}
  active            boolean NOT NULL DEFAULT true,
  sort_order        int,
  created_at        timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.equip_service_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_select_service_areas"
  ON public.equip_service_areas FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "admin_write_service_areas"
  ON public.equip_service_areas FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());
-- Guests: matching 100% server-side vía API route + admin client (patrón F3).

-- ─── extensión equip_ministries ──────────────────────────────────────
ALTER TABLE public.equip_ministries
  ADD COLUMN IF NOT EXISTS service_area_ids   uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS long_description   text,
  ADD COLUMN IF NOT EXISTS trait_overrides    jsonb;   -- refina el perfil del área (mismas llaves que service_areas); null = hereda
-- ELIMINADOS del diseño (decisión Luis 2026-07-07): hard_requirements,
-- seeking_volunteers, commitment_level. Requisitos, disponibilidad y proceso
-- de ingreso NO se muestran en la app: se hablan con el liderazgo.
-- NOTA: required_gifts/required_skills (columnas F1) quedan DEPRECADAS por
-- trait_overrides/service_areas. No borrar (aditivo); ignorar en código nuevo.

-- ─── equip_matching_config ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.equip_matching_config (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.equip_matching_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_select_matching_config"
  ON public.equip_matching_config FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "admin_write_matching_config"
  ON public.equip_matching_config FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.equip_matching_config (key, value) VALUES
  ('weights', '{"dones":0.30,"passion":0.30,"skills":0.20,"personality":0.10,"experience":0.10}'),
  ('thresholds', '{"excellent":0.75,"good":0.60,"moderate":0.45}'),
  ('passion_rank_weights', '{"groups":[5,4,3,2,1],"types":[3,2,1]}'),
  ('gift_family_blend', '{"gift_level":0.6,"family_level":0.4}')
ON CONFLICT (key) DO NOTHING;
