-- FUNCTION: public.trigger_set_account_locked_ts()

-- DROP FUNCTION public.trigger_set_account_locked_ts();

DO $$ BEGIN

    IF NOT EXISTS(
        SELECT routines.routine_name, parameters.data_type, parameters.ordinal_position, routines.specific_schema
        FROM information_schema.routines
        LEFT JOIN information_schema.parameters ON routines.specific_name=parameters.specific_name
        WHERE routines.specific_schema='public' and routine_name = 'trigger_set_account_locked_ts'
    )
    THEN

        CREATE FUNCTION public.trigger_set_account_locked_ts()
            RETURNS trigger
            LANGUAGE 'plpgsql'
            COST 100
            VOLATILE NOT LEAKPROOF
        AS $BODY$
        declare verified_user bool;

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
            
            -- if the account is a verified user and their password attempts are greater than 20
            -- and their account is not currently considered locked
            if(verified_user and new."passwordAttempts" >= 20 and new."passwordLocked" is null)
            then
                new."passwordLocked" = CURRENT_TIMESTAMP;
            elseif(verified_user and new."passwordAttempts" < 20 and new."passwordLocked" is not null)
            then
                new."passwordLocked" = null;
            END IF;
            
            return new;
        END;
        $BODY$;

        ALTER FUNCTION public.trigger_set_account_locked_ts()
            OWNER TO postgres;


    END IF;
END $$;