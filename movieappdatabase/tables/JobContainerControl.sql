-- Table: public.JobContainerControl

-- DROP TABLE public."JobContainerControl";

CREATE TABLE IF NOT EXISTS public."JobContainerControl"
(
    id bigint NOT NULL DEFAULT nextval('"JobContainerControl_id_seq"'::regclass),
    engines integer,
    type character varying(100) COLLATE pg_catalog."default" NOT NULL,
    memory_limit character varying(50) COLLATE pg_catalog."default",
    cpus_to_run_on character varying(100) COLLATE pg_catalog."default",
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

ALTER TABLE public."JobContainerControl"
    OWNER to postgres;

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."JobContainerControl";

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'JobContainerControl'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."JobContainerControl"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;