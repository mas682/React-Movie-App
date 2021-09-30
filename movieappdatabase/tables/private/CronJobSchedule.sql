-- Table: private.CronJobSchedule

-- DROP TABLE private."CronJobSchedule";

CREATE TABLE IF NOT EXISTS private."CronJobSchedule"
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( CYCLE INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
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
        REFERENCES private."JobSteps" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT "CronJobSchedule_ScheduledJobs_fkey" FOREIGN KEY ("jobId")
        REFERENCES private."ScheduledJobs" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE private."CronJobSchedule"
    OWNER to postgres;

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON private."CronJobSchedule";

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'CronJobSchedule'
        and trigger_schema = 'private'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON private."CronJobSchedule"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;
