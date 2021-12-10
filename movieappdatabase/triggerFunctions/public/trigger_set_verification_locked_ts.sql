-- FUNCTION: public.trigger_set_verification_locked_ts()

-- DROP FUNCTION public.trigger_set_verification_locked_ts();


DO $$ BEGIN

    IF NOT EXISTS(
        SELECT routines.routine_name, parameters.data_type, parameters.ordinal_position, routines.specific_schema
        FROM information_schema.routines
        LEFT JOIN information_schema.parameters ON routines.specific_name=parameters.specific_name
        WHERE routines.specific_schema='public' and routine_name = 'trigger_set_verification_locked_ts'
    )
    THEN
        -- FUNCTION: public.trigger_set_verification_locked_ts()

        -- DROP FUNCTION public.trigger_set_verification_locked_ts();

        CREATE FUNCTION public.trigger_set_verification_locked_ts()
            RETURNS trigger
            LANGUAGE 'plpgsql'
            COST 100
            VOLATILE NOT LEAKPROOF
        AS $BODY$

        BEGIN
            
            -- if not locked; if locked do nothing
            if(new."verificationLocked" is null or (new."verificationLocked" is not null and new."verificationLocked" <= CURRENT_TIMESTAMP))
            then
                if(new."verificationAttempts" > 0)
                then
                    new."verificationAttempts" = 1;
                    new."verificationLocked" = CURRENT_TIMESTAMP + interval '1 minutes';
                else
                    -- if attempts = 0, set locked to null
                    new."verificationLocked" = null;
                end if;
            end if;
            
            return new;
        END;
        $BODY$;

        ALTER FUNCTION public.trigger_set_verification_locked_ts()
            OWNER TO postgres;

    END IF;
END $$;
