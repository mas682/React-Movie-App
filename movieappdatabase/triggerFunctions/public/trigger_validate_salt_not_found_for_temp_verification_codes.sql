-- FUNCTION: public.trigger_validate_salt_not_found_for_temp_verification_codes()

-- DROP FUNCTION public.trigger_validate_salt_not_found_for_temp_verification_codes();

DO $$ BEGIN

    IF NOT EXISTS(
        SELECT routines.routine_name, parameters.data_type, parameters.ordinal_position, routines.specific_schema
        FROM information_schema.routines
        LEFT JOIN information_schema.parameters ON routines.specific_name=parameters.specific_name
        WHERE routines.specific_schema='public' and routine_name = 'trigger_validate_salt_not_found_for_temp_verification_codes'
    )
    THEN
        CREATE FUNCTION public.trigger_validate_salt_not_found_for_temp_verification_codes()
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
                    FROM public."UserCredentials"
                    WHERE salt = new.salt;
                    if (uSalt = new.salt) then
                        RAISE unique_violation
                            USING CONSTRAINT='TempVerificationCodes_salt_key'
                            ,MESSAGE='salt must be unique, exists in UserCredentials'
                            ,COLUMN='salt'
                            ,detail='Key (salt)=(' || new.salt ||') already exists'
                            ,TABLE='TempVerificationCodes'
                            ,SCHEMA='public';
                    else
                        return new;
                    end if;
                end;
        $BODY$;

        ALTER FUNCTION public.trigger_validate_salt_not_found_for_temp_verification_codes()
            OWNER TO postgres;

    END IF;
END $$;
