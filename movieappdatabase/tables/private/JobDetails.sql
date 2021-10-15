-- Table: private.JobDetails

-- DROP TABLE private."JobDetails";

CREATE TABLE IF NOT EXISTS private."JobDetails"
(
    "jobId" integer NULL,
    "stepId" integer NULL,
    "startTime" timestamp without time zone,
    "lastActive" timestamp without time zone,
    finished timestamp without time zone,
    state character varying(30) COLLATE pg_catalog."default" NOT NULL,
    engine integer,
    server character varying(100) COLLATE pg_catalog."default",
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( CYCLE INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    CONSTRAINT "JobDetails_pkey" PRIMARY KEY (id),
    CONSTRAINT "JobDetails_JobSteps_fkey" FOREIGN KEY ("stepId")
        REFERENCES private."JobSteps" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT "JobDetails_jobId_fkey" FOREIGN KEY ("jobId")
        REFERENCES private."ScheduledJobs" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL
)

TABLESPACE pg_default;

ALTER TABLE private."JobDetails"
    OWNER to postgres;


DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'JobDetails'
        and trigger_schema = 'private'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON private."JobDetails"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;
