-- Table: public.JobQueue

-- DROP TABLE public."JobQueue";

CREATE TABLE IF NOT EXISTS public."JobQueue"
(
    id bigint NOT NULL DEFAULT nextval('"JobQueue_id_seq"'::regclass),
    "jobId" bigint NOT NULL,
    "stepId" bigint NOT NULL,
    engine integer,
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedAt" timestamp without time zone,
    "finishedAt" timestamp without time zone,
    server character varying(100)[] COLLATE pg_catalog."default",
    CONSTRAINT "JobQueue_pkey" PRIMARY KEY (id),
    CONSTRAINT "JobQueue_JobSteps_fkey" FOREIGN KEY (id)
        REFERENCES public."JobSteps" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT "JobQueue_ScheduledJobs_fkey" FOREIGN KEY (id)
        REFERENCES public."ScheduledJobs" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE public."JobQueue"
    OWNER to postgres;