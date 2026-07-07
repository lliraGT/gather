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
      WHEN NEW.raw_user_meta_data->>'role' IN ('ADMIN', 'EM', 'ANCIANO')
        THEN NEW.raw_user_meta_data->>'role'
      ELSE 'ANCIANO'
    END
  );
  RETURN NEW;
END;
$$;
