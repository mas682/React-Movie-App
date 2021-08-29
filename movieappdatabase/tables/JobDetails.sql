-- Table: public.JobDetails

-- DROP TABLE public."JobDetails";

CREATE TABLE IF NOT EXISTS public."JobDetails"
(
    "jobId" bigint NOT NULL,
    "stepId" bigint NOT NULL,
    "startTime" timestamp with time zone,
    "lastActive" timestamp with time zone,
    finished timestamp with time zone,
    state character varying(30) COLLATE pg_catalog."default" NOT NULL,
    engine integer,
    server character varying(100) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id bigint NOT NULL DEFAULT nextval('"JobDetails_id_seq"'::regclass),
    CONSTRAINT "JobDetails_pkey" PRIMARY KEY (id),
    CONSTRAINT "JobDetails_JobSteps_fkey" FOREIGN KEY ("stepId")
        REFERENCES public."JobSteps" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT "JobDetails_jobId_fkey" FOREIGN KEY ("jobId")
        REFERENCES public."ScheduledJobs" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."JobDetails"
    OWNER to postgres;


DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'JobDetails'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."JobDetails"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;
