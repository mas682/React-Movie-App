-- Table: public.ScheduledJobs

-- DROP TABLE public."ScheduledJobs";

CREATE TABLE IF NOT EXISTS public."ScheduledJobs"
(
    "jobName" character varying(50) COLLATE pg_catalog."default" NOT NULL,
    "jobDescription" character varying(100) COLLATE pg_catalog."default",
    "lastRun" timestamp with time zone,
    "nextRun" timestamp with time zone,
    "Enabled" boolean NOT NULL DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
END $$;
