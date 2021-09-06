-- Table: public.JobSteps

-- DROP TABLE public."JobSteps";

CREATE TABLE IF NOT EXISTS public."JobSteps"
(
    id bigint NOT NULL DEFAULT nextval('"JobSteps_id_seq"'::regclass),
    type character varying(100) COLLATE pg_catalog."default",
    "jobId" bigint NOT NULL,
    "ContainerControlId" bigint NOT NULL,
    "scriptPath" character varying(200) COLLATE pg_catalog."default" NOT NULL,
    arguments character varying(100) COLLATE pg_catalog."default",
    "order" integer NOT NULL,
    timeout bigint,
    enabled boolean NOT NULL,
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JobSteps_pkey" PRIMARY KEY (id),
    CONSTRAINT "JobSteps_ScheduledJobs_fkey" FOREIGN KEY ("jobId")
        REFERENCES public."ScheduledJobs" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT "JobSteps_JobContainerControl_fkey" FOREIGN KEY ("ContainerControlId")
        REFERENCES public."JobContainerControl" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
    
)

TABLESPACE pg_default;

ALTER TABLE public."JobSteps"
    OWNER to postgres;

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'JobSteps'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."JobSteps"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;