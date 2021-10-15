-- Table: private.JobSteps

-- DROP TABLE private."JobSteps";

CREATE TABLE IF NOT EXISTS private."JobSteps"
(
    id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( CYCLE INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    type character varying(100) COLLATE pg_catalog."default",
    "jobId" integer NOT NULL,
    "ContainerControlId" integer NULL,
    "CronJobScheduleId" integer NULL,
    "scriptPath" character varying(200) COLLATE pg_catalog."default" NOT NULL,
    arguments character varying(100) COLLATE pg_catalog."default",
    -- this should be a dict in the form of {"key":"value"}
    "logArguments" character varying(100) COLLATE pg_catalog."default",
    "order" integer NOT NULL,
    timeout integer,
    enabled boolean NOT NULL,
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JobSteps_pkey" PRIMARY KEY (id),
    CONSTRAINT "JobSteps_ScheduledJobs_fkey" FOREIGN KEY ("jobId")
        REFERENCES private."ScheduledJobs" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT "JobSteps_JobContainerControl_fkey" FOREIGN KEY ("ContainerControlId")
        REFERENCES private."JobContainerControl" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL
    
)

TABLESPACE pg_default;

ALTER TABLE private."JobSteps"
    OWNER to postgres;

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'JobSteps'
        and trigger_schema = 'private'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON private."JobSteps"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;