-- FUNCTION: public.trigger_set_timestamp()

-- DROP FUNCTION public.trigger_set_timestamp();

CREATE FUNCTION public.trigger_set_timestamp()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
  END;
$BODY$;

ALTER FUNCTION public.trigger_set_timestamp()
    OWNER TO postgres;
