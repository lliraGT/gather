-- Nueva llave de configuración para F6 Fix C (calibración v2.2): blend entre
-- el score de ranking ya existente (topFiveGroups/topThreePassions, vía
-- rankScore) y un coeficiente de overlap simple contra
-- selectedGroups/selectedPassions (el usuario también reporta estos sin
-- rankear, y hoy se ignoran por completo en el motor de matching).
-- Puramente aditiva — no toca ninguna fila existente.
INSERT INTO public.equip_matching_config (key, value) VALUES
  ('passion_selected_blend', '{"top_ranked":0.75,"selected":0.25}')
ON CONFLICT (key) DO NOTHING;
