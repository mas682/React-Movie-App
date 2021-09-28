-- PROCEDURE: private.GetJobQueueLock(character varying, boolean)

-- DROP PROCEDURE private."GetJobQueueLock"(character varying, boolean);

DO $$ BEGIN

    IF NOT EXISTS(
        SELECT *
        FROM pg_catalog.pg_proc
        JOIN pg_namespace ON pg_catalog.pg_proc.pronamespace = pg_namespace.oid
        WHERE proname = 'GetJobQueueLock'
        AND pg_namespace.nspname = 'private'
    )
    THEN
        CREATE PROCEDURE private."GetJobQueueLock"(
            "ServerName" character varying,
            "EngineNumber" integer)
        LANGUAGE 'plpgsql'
        AS $BODY$
        DECLARE counter int := 0;
        DECLARE LockObtained boolean := False;
        DECLARE "JobQueueId" int := null;
        BEGIN
            "JobQueueId" := null;
            while counter < 10 and not LockObtained
            loop
                update private."JobQueueLock"
                    SET
                        "server"="ServerName"
                where "server" is null;
                COMMIT;

                select into LockObtained
                    case 
                        when count(*) >= 1
                    then True
                    else False
                    end
                from private."JobQueueLock"
                where "server" = "ServerName";
                counter := counter + 1;
            end loop;
            if(LockObtained)
            then
                -- assign a job to this server/engine
                update private."JobQueue"
                    set 
                        engine = "EngineNumber",
                        "assignedAt" = CURRENT_TIMESTAMP,
                        pending = True,
                        "server" = "ServerName"
                where
                    "id" in 
                    (
                        select j."id" from private."JobQueue" j
                        where (j."engine" is null and j."startedAt" is null) or (
                            -- get a job that was marked to be started but that never actually started
                            j."engine" is not null and j.pending and j."server" is not null and j."startedAt" is null and
                            ((EXTRACT(EPOCH FROM(CURRENT_TIMESTAMP - j."assignedAt"))::integer/60) > 2)
                        )
                        order by j.priority asc, j."scheduledRunTime", j."createdAt" asc
                        limit 1
                    )
                RETURNING "id" into "JobQueueId";
                Raise notice 'JobQueueId: %', "JobQueueId";
                
                -- release the lock
                update private."JobQueueLock"
                    SET
                        "server"= null
                where "server" = "ServerName";
            end if;
        END;
        $BODY$;
    END IF;
END $$;
