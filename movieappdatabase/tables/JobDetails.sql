-- Table: public.JobDetails

-- DROP TABLE public."JobDetails";

CREATE TABLE public."JobDetails"
(
    "jobId" bigint NOT NULL,
    "startTime" timestamp with time zone,
    "lastActive" timestamp with time zone,
    finished timestamp with time zone,
    state character varying(30) COLLATE pg_catalog."default" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    id bigint NOT NULL DEFAULT nextval('"JobDetails_id_seq"'::regclass),
    CONSTRAINT "JobDetails_pkey" PRIMARY KEY (id),
    CONSTRAINT "JobDetails_jobId_fkey" FOREIGN KEY ("jobId")
        REFERENCES public."ScheduledJobs" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."JobDetails"
    OWNER to postgres;

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."JobDetails";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."JobDetails"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."JobDetails";

CREATE TRIGGER set_timestamp
    BEFORE UPDATE
    ON public."JobDetails"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
