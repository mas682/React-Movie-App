CREATE OR REPLACE FUNCTION public.trigger_set_created_timestamp()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    VOLATILE
    COST 100
AS $BODY$
BEGIN
  NEW."createdAt" = NOW();
  RETURN NEW;
END
$BODY$;
