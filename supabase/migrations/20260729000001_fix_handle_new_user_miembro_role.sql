-- Fix: handle_new_user() nunca reconoció el rol MIEMBRO (agregado en F1 de
-- Equip, ver 20260617000001_equip_foundation.sql) ni lo asignaba como
-- fallback — cualquier invitación con metadata role:'MIEMBRO' caía al ELSE y
-- el usuario quedaba con role='ANCIANO', con acceso de liderazgo real en
-- Gather. Auditoría de solo lectura (scripts/audit-miembro-role-bug.ts,
-- 2026-07-29) confirmó 0 usuarios afectados hasta ahora — el bug nunca se
-- disparó con una invitación real, pero el hueco seguía abierto en el código.
--
-- Fix: reconocer MIEMBRO en el CASE, y cambiar el fallback ELSE de 'ANCIANO'
-- a 'MIEMBRO' — el rol de menor privilegio, más seguro como default y
-- semánticamente correcto (coincide con el rol real que tenía la metadata en
-- el caso que expuso el bug). Ninguna otra parte del trigger cambia.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    CASE
      -- Solo honrar el rol del metadata si el usuario nace de una
      -- invitación admin (inviteUserByEmail puebla invited_at).
      -- Signups directos (invited_at null) siempre caen a MIEMBRO.
      WHEN NEW.invited_at IS NOT NULL
        AND NEW.raw_user_meta_data->>'role' IN ('ADMIN', 'EM', 'ANCIANO', 'MIEMBRO')
        THEN NEW.raw_user_meta_data->>'role'
      ELSE 'MIEMBRO'
    END
  );
  RETURN NEW;
END;
$$;
