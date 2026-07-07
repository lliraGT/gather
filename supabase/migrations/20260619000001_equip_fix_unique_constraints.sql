-- Reemplazar UNIQUE NULLS NOT DISTINCT por partial indexes.
-- NULLS NOT DISTINCT trata NULL como igual, lo que impide insertar múltiples
-- filas de guests (profile_id=NULL) con distinto invitation_id y mismo test_type.
-- Los partial indexes solo aplican la unicidad cuando la columna NO es NULL.
ALTER TABLE public.equip_assessment_results
  DROP CONSTRAINT IF EXISTS uq_profile_test,
  DROP CONSTRAINT IF EXISTS uq_invitation_test;

CREATE UNIQUE INDEX IF NOT EXISTS uq_profile_test
  ON public.equip_assessment_results (profile_id, test_type)
  WHERE profile_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_invitation_test
  ON public.equip_assessment_results (invitation_id, test_type)
  WHERE invitation_id IS NOT NULL;
