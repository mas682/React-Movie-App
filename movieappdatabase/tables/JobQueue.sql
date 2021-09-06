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
    "startedAt" timestamp without time zone,
    server character varying(100) COLLATE pg_catalog."default",
    pending boolean,
    priority integer,
    CONSTRAINT "JobQueue_pkey" PRIMARY KEY (id),
    CONSTRAINT "JobQueue_JobSteps_fkey" FOREIGN KEY ("stepId")
        REFERENCES public."JobSteps" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT "JobQueue_ScheduledJobs_fkey" FOREIGN KEY ("jobId")
        REFERENCES public."ScheduledJobs" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE public."JobQueue"
    OWNER to postgres;