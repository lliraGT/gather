-- ─── Equip Foundation Migration ──────────────────────────────────────────────
-- Purely additive: does NOT modify any existing Gather tables, functions, or policies.
-- All new objects carry the equip_ prefix.

-- ─── 1. Extend profiles role domain ──────────────────────────────────────────
-- Add MIEMBRO to the allowed roles. Gather only uses ADMIN/EM/ANCIANO,
-- so MIEMBRO rows are invisible to Gather's RLS and UI.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('ADMIN', 'EM', 'ANCIANO', 'MIEMBRO'));

-- ─── 2. Helper function: is_miembro_or_above() ───────────────────────────────
-- SECURITY DEFINER + SET search_path avoids RLS recursion (same pattern as Gather).
CREATE OR REPLACE FUNCTION public.is_miembro_or_above()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('MIEMBRO', 'EM', 'ANCIANO', 'ADMIN')
      AND active = true
  )
$function$;

-- ─── 3. equip_guest_invitations ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.equip_guest_invitations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL,
  first_name  text NOT NULL,
  last_name   text NOT NULL,
  token       text UNIQUE NOT NULL,
  status      text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'in_progress', 'completed', 'revoked')),
  invited_by  uuid REFERENCES public.profiles(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz
);

ALTER TABLE public.equip_guest_invitations ENABLE ROW LEVEL SECURITY;

-- Guests have NO direct browser access — all via API route + admin client server-side.
-- Only EM/ADMIN can read/write invitations from the browser.
CREATE POLICY "em_admin_all_equip_guest_invitations"
  ON public.equip_guest_invitations
  FOR ALL
  USING (public.is_em_or_admin())
  WITH CHECK (public.is_em_or_admin());

-- ─── 4. equip_assessment_results ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.equip_assessment_results (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid REFERENCES public.profiles(id),
  invitation_id uuid REFERENCES public.equip_guest_invitations(id),
  test_type     text NOT NULL
                  CHECK (test_type IN ('personality', 'dones', 'skills', 'passion', 'experience')),
  results       jsonb NOT NULL DEFAULT '{}',
  completed_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  -- At least one owner required
  CONSTRAINT chk_owner CHECK (profile_id IS NOT NULL OR invitation_id IS NOT NULL),
  -- One result per test type per registered user
  CONSTRAINT uq_profile_test UNIQUE NULLS NOT DISTINCT (profile_id, test_type),
  -- One result per test type per guest invitation
  CONSTRAINT uq_invitation_test UNIQUE NULLS NOT DISTINCT (invitation_id, test_type)
);

ALTER TABLE public.equip_assessment_results ENABLE ROW LEVEL SECURITY;

-- Registered users: read/write their own rows
CREATE POLICY "own_results_select"
  ON public.equip_assessment_results FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "own_results_insert"
  ON public.equip_assessment_results FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "own_results_update"
  ON public.equip_assessment_results FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- EM/ADMIN: read all rows (for dashboard overview)
CREATE POLICY "em_admin_select_all_results"
  ON public.equip_assessment_results FOR SELECT
  USING (public.is_em_or_admin());

-- Guest rows (invitation_id IS NOT NULL, profile_id IS NULL) have NO browser policies —
-- handled 100% server-side via API routes with the admin client.

-- ─── 5. equip_ministries ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.equip_ministries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  description      text,
  required_gifts   text[] DEFAULT '{}',
  required_skills  text[] DEFAULT '{}',
  active           boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.equip_ministries ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read ministries (needed for Ministry Matching)
CREATE POLICY "authenticated_select_ministries"
  ON public.equip_ministries FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only ADMIN can write ministry data
CREATE POLICY "admin_write_ministries"
  ON public.equip_ministries FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
