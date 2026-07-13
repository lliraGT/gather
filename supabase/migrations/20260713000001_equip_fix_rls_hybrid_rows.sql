-- Fix RLS MEDIUM: own_* insert/update permitían filas híbridas con
-- invitation_id ajeno (chk_owner es OR, no XOR). Pre-check 2026-07-13: 0 híbridas.
-- Puramente aditiva respecto a Gather — solo toca políticas equip_*.

DROP POLICY IF EXISTS "own_results_insert" ON public.equip_assessment_results;
CREATE POLICY "own_results_insert"
  ON public.equip_assessment_results FOR INSERT
  WITH CHECK (profile_id = auth.uid() AND invitation_id IS NULL);

DROP POLICY IF EXISTS "own_results_update" ON public.equip_assessment_results;
CREATE POLICY "own_results_update"
  ON public.equip_assessment_results FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid() AND invitation_id IS NULL);

DROP POLICY IF EXISTS "own_progress_insert" ON public.equip_assessment_progress;
CREATE POLICY "own_progress_insert"
  ON public.equip_assessment_progress FOR INSERT
  WITH CHECK (profile_id = auth.uid() AND invitation_id IS NULL);

DROP POLICY IF EXISTS "own_progress_update" ON public.equip_assessment_progress;
CREATE POLICY "own_progress_update"
  ON public.equip_assessment_progress FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid() AND invitation_id IS NULL);
