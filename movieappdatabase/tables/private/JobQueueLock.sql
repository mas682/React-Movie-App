-- Table: private.JobQueueLock

-- DROP TABLE private."JobQueueLock";

CREATE TABLE IF NOT EXISTS private."JobQueueLock"
(
    server character varying(100) COLLATE pg_catalog."default",
    "updatedAt" timestamp without time zone,
    id integer NOT NULL DEFAULT nextval('"JobQueueLock_id_seq"'::regclass),
    CONSTRAINT "JobQueueLocks_pkey" PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE private."JobQueueLock"
    OWNER to postgres;

-- Trigger: set_timestamp
DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'JobQueueLock'
        and trigger_schema = 'private'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON private."JobQueueLock"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;