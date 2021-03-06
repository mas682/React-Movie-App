CREATE OR REPLACE FUNCTION public.trigger_set_verification_code_expiration()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    VOLATILE
    COST 100
AS $BODY$
BEGIN
  NEW."expiresAt" = NOW() + interval '10 minutes';
  RETURN NEW;
END;
$BODY$;
