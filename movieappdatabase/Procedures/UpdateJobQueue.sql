DO $$ BEGIN

    IF NOT EXISTS(
        SELECT *
        FROM pg_catalog.pg_proc
        JOIN pg_namespace ON pg_catalog.pg_proc.pronamespace = pg_namespace.oid
        WHERE proname = 'UpdateJobQueue'
        AND pg_namespace.nspname = 'public'
    )
    THEN
        CREATE PROCEDURE public."UpdateJobQueue"()
        LANGUAGE 'plpgsql'
        AS $BODY$
        DECLARE currentTime timestamp := CURRENT_TIMESTAMP;
        BEGIN
            -- set next run for all jobs that do not have a next run value
            UPDATE public."ScheduledJobs"
                SET "nextRun"="startDate"
            WHERE "Enabled" and "addToQueue" and frequency is not null and "nextRun" is null and "startDate" is not null;
            
            -- remove the next time from all jobs that are not enabled and that 
            UPDATE public."ScheduledJobs"
                SET "nextRun"=null
            WHERE not "Enabled" and "addToQueue" and "nextRun" is not null;

            INSERT INTO public."JobQueue"(
                "jobId",
                "stepId",
                "scheduledRunTime"
            )
            select 
                s."id" as "jobId",
                js."id" as "stepId",
                s."nextRun" as "scheduledRunTime"
            from public."ScheduledJobs" s
            join public."JobSteps" js on js."jobId" = s."id" and js."enabled"
            where s."Enabled" and "addToQueue" and "nextRun" is not null and "nextRun" <= currentTime;


            -- increment next run time to next value
            UPDATE public."ScheduledJobs"
                SET "nextRun"="nextRun" + (frequency * interval '1 second')
            WHERE "Enabled" and "addToQueue" and frequency is not null and "nextRun" is not null and "nextRun" <= currentTime;

        END;
        $BODY$;
    END IF;
END $$;