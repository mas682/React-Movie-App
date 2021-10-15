-- FUNCTION: public.trigger_validate_salt_not_found_temp_users()

-- DROP FUNCTION public.trigger_validate_salt_not_found_temp_users();


DO $$ BEGIN

    IF NOT EXISTS(
        SELECT routines.routine_name, parameters.data_type, parameters.ordinal_position, routines.specific_schema
        FROM information_schema.routines
        LEFT JOIN information_schema.parameters ON routines.specific_name=parameters.specific_name
        WHERE routines.specific_schema='public' and routine_name = 'trigger_validate_salt_not_found_temp_users'
    )
    THEN
        CREATE FUNCTION public.trigger_validate_salt_not_found_temp_users()
            RETURNS trigger
            LANGUAGE 'plpgsql'
            COST 100
            VOLATILE NOT LEAKPROOF
        AS $BODY$
        declare
        	uSalt varchar(44);
        begin
        	select
        		into uSalt
        		salt
          	FROM public."UserVerificationCodes"
          	WHERE salt = new.salt;
        	if (uSalt = new.salt) then
        		RAISE unique_violation
        	 		USING CONSTRAINT='users_salt_key'
        			,MESSAGE='salt must be unique'
        			,COLUMN='salt'
        			,detail='Key (salt)=(' || new.salt ||') already exists'
        			,TABLE='Users'
        			,SCHEMA='public';
          	else
        		return new;
          	end if;
        end
        $BODY$;

        ALTER FUNCTION public.trigger_validate_salt_not_found_temp_users()
            OWNER TO postgres;

    END IF;
END $$;