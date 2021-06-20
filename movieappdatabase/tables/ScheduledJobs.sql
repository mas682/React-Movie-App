-- Table: public.ScheduledJobs

-- DROP TABLE public."ScheduledJobs";

CREATE TABLE public."ScheduledJobs"
(
    "jobName" character varying(50) COLLATE pg_catalog."default" NOT NULL,
    "jobDescription" character varying(100) COLLATE pg_catalog."default",
    "lastRun" timestamp with time zone,
    "lastActive" timestamp with time zone,
    "lastFinished" timestamp with time zone,
    "nextRun" timestamp with time zone,
    "Enabled" boolean NOT NULL DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    id bigint NOT NULL DEFAULT nextval('"ScheduledJobs_id_seq"'::regclass),
    CONSTRAINT "ScheduledJobs_pkey" PRIMARY KEY (id),
    CONSTRAINT "ScheduledJobs_jobName_key" UNIQUE ("jobName")
)

TABLESPACE pg_default;

ALTER TABLE public."ScheduledJobs"
    OWNER to postgres;

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."ScheduledJobs";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."ScheduledJobs"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."ScheduledJobs";

CREATE TRIGGER set_timestamp
    BEFORE UPDATE
    ON public."ScheduledJobs"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
