-- FUNCTION: public.trigger_update_temp_user_expiration()

-- DROP FUNCTION public.trigger_update_temp_user_expiration();

DO $$ BEGIN

    IF NOT EXISTS(
        SELECT routines.routine_name, parameters.data_type, parameters.ordinal_position, routines.specific_schema
        FROM information_schema.routines
        LEFT JOIN information_schema.parameters ON routines.specific_name=parameters.specific_name
        WHERE routines.specific_schema='public' and routine_name = 'trigger_update_temp_user_expiration'
    )
    THEN
        CREATE FUNCTION public.trigger_update_temp_user_expiration()
            RETURNS trigger
            LANGUAGE 'plpgsql'
            COST 100
            VOLATILE NOT LEAKPROOF
        AS $BODY$
        BEGIN
        	UPDATE public."Users"
        		SET
        			"deleteAt" = new."expiresAt"
         	where "id" = new."userId" and not "verified" and new."type" = 1;
            RETURN new;
        END;
        $BODY$;

        ALTER FUNCTION public.trigger_update_temp_user_expiration()
            OWNER TO postgres;

    END IF;
END $$;
