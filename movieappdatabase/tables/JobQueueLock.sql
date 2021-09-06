-- Table: public.JobQueueLock

-- DROP TABLE public."JobQueueLock";

CREATE TABLE IF NOT EXISTS public."JobQueueLock"
(
    server character varying(50) COLLATE pg_catalog."default",
    "updatedAt" timestamp with time zone,
    id bigint NOT NULL DEFAULT nextval('"JobQueueLock_id_seq"'::regclass),
    CONSTRAINT "JobQueueLocks_pkey" PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public."JobQueueLock"
    OWNER to postgres;

-- Trigger: set_timestamp
DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'JobLockQueue'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."JobLockQueue"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;