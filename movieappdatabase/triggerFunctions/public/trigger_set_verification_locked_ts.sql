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
        declare expires_time timestamp without time zone;
        declare verification_attempts integer;
        declare verified_user integer;

        BEGIN
            
            select
                case when "verified"
                    then 1
                else
                    0
                end
                into verified_user
            from public."Users"
            where "id" = new."userId";
            
            if(verified_user)
            then
                select 
                    into verification_attempts
                    case
                        -- currently locked, but shouldn't be anymore
                        when new."verificationAttempts" >= 4 and new."verificationLocked" is not null and new."verificationLocked" <= CURRENT_TIMESTAMP
                            then 1
                        else
                            new."verificationAttempts"
                    end;
                new."verificationAttempts" = verification_attempts;

                select 
                    into expires_time
                    case
                        -- not locked yet but should be on
                        when new."verificationLocked" is null and new."verificationAttempts" >= 3
                            then CURRENT_TIMESTAMP + interval '24 hours'
                        -- when attempts less than 3
                        when new."verificationAttempts" < 3
                            then null
                        -- already locked
                        when new."verificationLocked" is not null and new."verificationAttempts" >= 3 and new."verificationLocked" > CURRENT_TIMESTAMP
                            then new."verificationLocked"
                        -- already marked as locked but in past
                        else
                            CURRENT_TIMESTAMP + interval '24 hours'
                end;
                new."verificationLocked" = expires_time;
            END IF;
            
            return new;
        END;
        $BODY$;

        ALTER FUNCTION public.trigger_set_verification_locked_ts()
            OWNER TO postgres;

    END IF;
END $$;
