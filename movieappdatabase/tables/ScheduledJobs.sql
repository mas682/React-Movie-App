-- Table: public.ScheduledJobs

-- DROP TABLE public."ScheduledJobs";

CREATE TABLE IF NOT EXISTS public."ScheduledJobs"
(
    "jobName" character varying(50) COLLATE pg_catalog."default" NOT NULL,
    "jobDescription" character varying(100) COLLATE pg_catalog."default",
    "lastRun" timestamp without time zone,
    "nextRun" timestamp without time zone,
    frequency integer,
    "Enabled" boolean NOT NULL DEFAULT false,
    "addToQueue" boolean NOT NULL DEFAULT true,
    "startDate" timestamp without time zone,
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobUpdatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id bigint NOT NULL DEFAULT nextval('"ScheduledJobs_id_seq"'::regclass),
    CONSTRAINT "ScheduledJobs_pkey" PRIMARY KEY (id),
    CONSTRAINT "ScheduledJobs_jobName_key" UNIQUE ("jobName")
)

TABLESPACE pg_default;

ALTER TABLE public."ScheduledJobs"
    OWNER to postgres;

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'ScheduledJobs'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."ScheduledJobs"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'ScheduledJobs'
        and trigger_schema = 'public'
        and trigger_name = 'set_job_updated_ts'
    )
    THEN
        CREATE TRIGGER set_job_updated_ts
            BEFORE UPDATE OF "Enabled"
            ON public."ScheduledJobs"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_schedule_job_updated_ts();
    END IF;


END $$;
