-- supabase/migrations/20260623000001_equip_assessment_progress.sql
-- Purely additive — stores raw in-progress answers before final scoring.

CREATE TABLE IF NOT EXISTS public.equip_assessment_progress (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid REFERENCES public.profiles(id),
  invitation_id uuid REFERENCES public.equip_guest_invitations(id),
  test_type     text NOT NULL
                  CHECK (test_type IN ('personality', 'dones', 'skills', 'passion', 'experience')),
  raw_answers   jsonb NOT NULL DEFAULT '{}',
  current_step  int  NOT NULL DEFAULT 1,
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_progress_owner
    CHECK (profile_id IS NOT NULL OR invitation_id IS NOT NULL)
);

-- Partial unique indexes (same pattern as equip_assessment_results)
CREATE UNIQUE INDEX IF NOT EXISTS uq_progress_profile_test
  ON public.equip_assessment_progress (profile_id, test_type)
  WHERE profile_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_progress_invitation_test
  ON public.equip_assessment_progress (invitation_id, test_type)
  WHERE invitation_id IS NOT NULL;

ALTER TABLE public.equip_assessment_progress ENABLE ROW LEVEL SECURITY;

-- Authenticated users: own rows only
CREATE POLICY "own_progress_select"
  ON public.equip_assessment_progress FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "own_progress_insert"
  ON public.equip_assessment_progress FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "own_progress_update"
  ON public.equip_assessment_progress FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "own_progress_delete"
  ON public.equip_assessment_progress FOR DELETE
  USING (profile_id = auth.uid());

-- EM/ADMIN can read all (for support)
CREATE POLICY "em_admin_progress_select"
  ON public.equip_assessment_progress FOR SELECT
  USING (public.is_em_or_admin());

-- Guest rows: NO browser RLS — all access via admin client server-side
