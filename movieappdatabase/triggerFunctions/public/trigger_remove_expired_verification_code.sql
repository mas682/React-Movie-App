-- FUNCTION: public.trigger_remove_expired_verification_code()

-- DROP FUNCTION public.trigger_remove_expired_verification_code();


DO $$ BEGIN

    IF NOT EXISTS(
        SELECT routines.routine_name, parameters.data_type, parameters.ordinal_position, routines.specific_schema
        FROM information_schema.routines
        LEFT JOIN information_schema.parameters ON routines.specific_name=parameters.specific_name
        WHERE routines.specific_schema='public' and routine_name = 'trigger_remove_expired_verification_code'
    )
    THEN
        CREATE FUNCTION public.trigger_remove_expired_verification_code()
            RETURNS trigger
            LANGUAGE 'plpgsql'
            COST 100
            VOLATILE NOT LEAKPROOF
        AS $BODY$
        BEGIN
            if new."verificationAttempts" >= 3 then
                delete from public."TempVerificationCodes"
                where id = new."id";
            end if;
            return new;
        END;
        $BODY$;

        ALTER FUNCTION public.trigger_remove_expired_verification_code()
            OWNER TO postgres;

    END IF;
END $$;
