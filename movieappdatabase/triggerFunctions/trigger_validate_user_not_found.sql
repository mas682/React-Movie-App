-- FUNCTION: public.trigger_validate_user_not_found()

-- DROP FUNCTION public.trigger_validate_user_not_found();

DO $$ BEGIN

    IF NOT EXISTS(
        SELECT routines.routine_name, parameters.data_type, parameters.ordinal_position, routines.specific_schema
        FROM information_schema.routines
        LEFT JOIN information_schema.parameters ON routines.specific_name=parameters.specific_name
        WHERE routines.specific_schema='public' and routine_name = 'trigger_validate_user_not_found'
    )
    THEN
        CREATE FUNCTION public.trigger_validate_user_not_found()
            RETURNS trigger
            LANGUAGE 'plpgsql'
            COST 100
            VOLATILE NOT LEAKPROOF
        AS $BODY$
        declare
            uName varchar(20);
            uEmail varchar(30);
        begin
            select
                into uName, uEmail
                username, "userEmail"
            from public."UserVerificationCodes"
            where (username = new.username or "userEmail" = new."userEmail")
            and "expiresAt" > CURRENT_TIMESTAMP
            and (("verificationAttempts" < 3 and "codesResent" = 2) or ("codesResent" < 2));
            if (uName = new.username) then
                RAISE unique_violation
                    USING CONSTRAINT='UserVerificationCodes_username_key'
                    ,MESSAGE='username must be unique'
                    ,COLUMN='username'
                    ,detail='Key (username)=(' || new.username ||') already exists'
                    ,TABLE='UserVerificationCodes'
                    ,SCHEMA='public';
            elsif (uEmail = new."userEmail") then
                RAISE unique_violation
                    USING CONSTRAINT='UserVerificationCodes_userEmail_key'
                    ,MESSAGE='userEmail must be unique'
                    ,COLUMN='userEmail'
                    ,detail='Key (userEmail)=(' || new."userEmail" ||') already exists'
                    ,TABLE='UserVerificationCodes'
                    ,SCHEMA='public';
            end if;
            select
                into uName, uEmail
                username, email
            FROM public."Users"
            WHERE username = new.username or email = new."userEmail";
            if (uName = new.username) then
                RAISE unique_violation
                    USING CONSTRAINT='UserVerificationCodes_username_key'
                    ,MESSAGE='username must be unique'
                    ,COLUMN='username'
                    ,detail='Key (username)=(' || new.username ||') already exists'
                    ,TABLE='UserVerificationCodes'
                    ,SCHEMA='public';
            elsif (uEmail = new."userEmail") then
                RAISE unique_violation
                    USING CONSTRAINT='UserVerificationCodes_userEmail_key'
                    ,MESSAGE='userEmail must be unique'
                    ,COLUMN='userEmail'
                    ,detail='Key (userEmail)=(' || new."userEmail" ||') already exists'
                    ,TABLE='UserVerificationCodes'
                    ,SCHEMA='public';
            else
                return new;
            end if;
        end
        $BODY$;

        ALTER FUNCTION public.trigger_validate_user_not_found()
            OWNER TO postgres;

    END IF;
END $$;
