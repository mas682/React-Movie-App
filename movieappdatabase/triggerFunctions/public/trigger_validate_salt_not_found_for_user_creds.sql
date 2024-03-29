-- FUNCTION: public.trigger_validate_salt_not_found_for_user_creds()

-- DROP FUNCTION public.trigger_validate_salt_not_found_for_user_creds();

DO $$ BEGIN

    IF NOT EXISTS(
        SELECT routines.routine_name, parameters.data_type, parameters.ordinal_position, routines.specific_schema
        FROM information_schema.routines
        LEFT JOIN information_schema.parameters ON routines.specific_name=parameters.specific_name
        WHERE routines.specific_schema='public' and routine_name = 'trigger_validate_salt_not_found_for_user_creds'
    )
    THEN
        CREATE FUNCTION public.trigger_validate_salt_not_found_for_user_creds()
            RETURNS trigger
            LANGUAGE 'plpgsql'
            COST 100
            VOLATILE NOT LEAKPROOF
        AS $BODY$
        declare uSalt varchar(44);
                begin
                    select
                        salt
                        into uSalt
                    FROM public."TempVerificationCodes" t
                    WHERE t.salt = new.salt;
                    if (uSalt = new.salt) then
                        RAISE unique_violation
                            USING CONSTRAINT='UserCredentials_salt_key'
                            ,MESSAGE='salt must be unique, exists in TempVerificationCodes'
                            ,COLUMN='salt'
                            ,detail='Key (salt)=(' || new.salt ||') already exists'
                            ,TABLE='UserCredentials'
                            ,SCHEMA='public';
                    else
                        return new;
                    end if;
                end
        $BODY$;

        ALTER FUNCTION public.trigger_validate_salt_not_found_for_user_creds()
            OWNER TO postgres;


    END IF;
END $$;
