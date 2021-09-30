-- Table: private.JobContainerControl

-- DROP TABLE private."JobContainerControl";

CREATE TABLE IF NOT EXISTS private."JobContainerControl"
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( CYCLE INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    engines integer,
    type character varying(100) COLLATE pg_catalog."default" NOT NULL,
    memory_limit character varying(50) COLLATE pg_catalog."default",
    cpus_to_run_on character varying(50) COLLATE pg_catalog."default",
    cpu_shares integer,
    cpu_period integer,
    cpu_quota integer,
    mem_reservation character varying(50) COLLATE pg_catalog."default",
    auto_remove boolean,
    pids_limit integer,
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JobContainerControl_pkey" PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE private."JobContainerControl"
    OWNER to postgres;

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON private."JobContainerControl";

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'JobContainerControl'
        and trigger_schema = 'private'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON private."JobContainerControl"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;