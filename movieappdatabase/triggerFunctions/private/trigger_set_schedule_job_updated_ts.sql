-- FUNCTION: private.trigger_set_schedule_job_updated_ts()

-- DROP FUNCTION private.trigger_set_schedule_job_updated_ts();

DO $$ BEGIN

    IF NOT EXISTS(
        SELECT routines.routine_name, parameters.data_type, parameters.ordinal_position, routines.specific_schema
        FROM information_schema.routines
        LEFT JOIN information_schema.parameters ON routines.specific_name=parameters.specific_name
        WHERE routines.specific_schema='private' and routine_name = 'trigger_set_schedule_job_updated_ts'
    )
    THEN
        CREATE FUNCTION private.trigger_set_schedule_job_updated_ts()
            RETURNS trigger
            LANGUAGE 'plpgsql'
            COST 100
            VOLATILE NOT LEAKPROOF
        AS $BODY$
        BEGIN
          NEW."jobUpdatedAt" = NOW();
          RETURN NEW;
          END;
        $BODY$;

        ALTER FUNCTION private.trigger_set_schedule_job_updated_ts()
            OWNER TO postgres;
    END IF;
END $$;