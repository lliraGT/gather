-- Fix: infinite recursion in RLS policies caused by missing SECURITY DEFINER + search_path

-- ─── 1. Update is_em() with SECURITY DEFINER + SET search_path + active check ───

CREATE OR REPLACE FUNCTION public.is_em()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'EM' AND active = true
  )
$function$;

-- ─── 2. New helper functions with the same standard ───────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'ADMIN' AND active = true
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_em_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('EM', 'ADMIN') AND active = true
  )
$function$;

-- ─── 3. Drop all INSERT/UPDATE/ALL policies on target tables ──────────────────
-- Dynamic drop avoids needing exact policy names

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN (
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'sunday_services'
      AND cmd IN ('INSERT', 'UPDATE', 'ALL')
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON sunday_services', pol.policyname);
  END LOOP;

  FOR pol IN (
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'attendance_records'
      AND cmd IN ('INSERT', 'UPDATE', 'ALL')
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON attendance_records', pol.policyname);
  END LOOP;
END;
$$;

-- ─── 4. Recreate policies using is_em_or_admin() ─────────────────────────────

CREATE POLICY "em_admin_insert_sunday_services"
  ON sunday_services FOR INSERT
  WITH CHECK (is_em_or_admin());

CREATE POLICY "em_admin_update_sunday_services"
  ON sunday_services FOR UPDATE
  USING (is_em_or_admin())
  WITH CHECK (is_em_or_admin());

CREATE POLICY "em_admin_insert_attendance_records"
  ON attendance_records FOR INSERT
  WITH CHECK (is_em_or_admin());

CREATE POLICY "em_admin_update_attendance_records"
  ON attendance_records FOR UPDATE
  USING (is_em_or_admin())
  WITH CHECK (is_em_or_admin());
