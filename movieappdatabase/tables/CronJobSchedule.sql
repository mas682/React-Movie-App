-- Table: public.CronJobSchedule

-- DROP TABLE public."CronJobSchedule";

CREATE TABLE IF NOT EXISTS public."CronJobSchedule"
(
    id bigint NOT NULL DEFAULT nextval('"CronJobSchedule_id_seq"'::regclass),
    "jobId" bigint NOT NULL,
    "stepId" bigint NOT NULL,
    minute character varying(50) COLLATE pg_catalog."default",
    hour character varying(50) COLLATE pg_catalog."default",
    "Month" character varying(50) COLLATE pg_catalog."default",
    "DayOfMonth" character varying(50) COLLATE pg_catalog."default",
    "DayOfWeek" character varying(50) COLLATE pg_catalog."default",
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CronJobSchedule_pkey" PRIMARY KEY (id),
    CONSTRAINT "CronJobSchedule_JobSteps_fkey" FOREIGN KEY ("stepId")
        REFERENCES public."JobSteps" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT "CronJobSchedule_ScheduledJobs_fkey" FOREIGN KEY ("jobId")
        REFERENCES public."ScheduledJobs" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."CronJobSchedule"
    OWNER to postgres;

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."CronJobSchedule";

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'CronJobSchedule'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."CronJobSchedule"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;
