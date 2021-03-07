-- FUNCTION: public.trigger_set_verification_code_expiration()

-- DROP FUNCTION public.trigger_set_verification_code_expiration();

CREATE FUNCTION public.trigger_set_verification_code_expiration()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
BEGIN
  NEW."expiresAt" = NOW() + interval '10 minutes';
  RETURN NEW;
END;
$BODY$;

ALTER FUNCTION public.trigger_set_verification_code_expiration()
    OWNER TO postgres;
