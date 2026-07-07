-- Permite first_name y last_name nulos en equip_guest_invitations.
-- Las testInvitation del legacy no tienen nombre — solo los testResults los tienen.
-- En el flujo nuevo, el nombre se conoce al completar el test (o se rellena desde ahí).
ALTER TABLE public.equip_guest_invitations
  ALTER COLUMN first_name DROP NOT NULL,
  ALTER COLUMN last_name  DROP NOT NULL;
