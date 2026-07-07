-- ─── Equip: indexes on FK columns + updated_at trigger ───────────────────────
-- Purely additive. Fixes from post-migration code review.

-- FK indexes (PostgreSQL does not auto-create these)
CREATE INDEX IF NOT EXISTS idx_equip_guest_invitations_invited_by
  ON public.equip_guest_invitations(invited_by);

CREATE INDEX IF NOT EXISTS idx_equip_assessment_results_invitation_id
  ON public.equip_assessment_results(invitation_id);

-- updated_at automation
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_equip_assessment_results_updated_at
  BEFORE UPDATE ON public.equip_assessment_results
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
