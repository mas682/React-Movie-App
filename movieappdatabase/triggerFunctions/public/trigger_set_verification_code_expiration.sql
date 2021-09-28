-- FUNCTION: public.trigger_set_verification_code_expiration()

-- DROP FUNCTION public.trigger_set_verification_code_expiration();

DO $$ BEGIN

    IF NOT EXISTS(
        SELECT routines.routine_name, parameters.data_type, parameters.ordinal_position, routines.specific_schema
        FROM information_schema.routines
        LEFT JOIN information_schema.parameters ON routines.specific_name=parameters.specific_name
        WHERE routines.specific_schema='public' and routine_name = 'trigger_set_verification_code_expiration'
    )
    THEN
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

    END IF;
END $$;
