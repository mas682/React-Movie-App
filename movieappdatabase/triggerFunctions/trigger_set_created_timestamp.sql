-- FUNCTION: public.trigger_set_created_timestamp()

-- DROP FUNCTION public.trigger_set_created_timestamp();

CREATE FUNCTION public.trigger_set_created_timestamp()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
BEGIN
  NEW."createdAt" = NOW();
  RETURN NEW;
END
$BODY$;

ALTER FUNCTION public.trigger_set_created_timestamp()
    OWNER TO postgres;
