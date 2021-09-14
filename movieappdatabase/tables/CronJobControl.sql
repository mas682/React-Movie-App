-- Table: public.CronJobControl

-- DROP TABLE public."CronJobControl";

CREATE TABLE IF NOT EXISTS public."CronJobControl"
(
    "lastRun" timestamp without time zone NOT NULL,
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id integer NOT NULL DEFAULT nextval('"CronJobControl_id_seq"'::regclass),
    CONSTRAINT "CronJobControl_pkey" PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public."CronJobControl"
    OWNER to postgres;

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."CronJobControl";

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'CronJobControl'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."CronJobControl"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;
