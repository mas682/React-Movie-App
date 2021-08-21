-- Table: public.Retailers

-- DROP TABLE public."Retailers";

CREATE TABLE IF NOT EXISTS public."Retailers"
(
    id integer NOT NULL DEFAULT nextval('"Retailers_id_seq"'::regclass),
    name character varying(255) COLLATE pg_catalog."default",
    externalid integer,
    "createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT retailers_pkey PRIMARY KEY (id),
    CONSTRAINT retailers_key UNIQUE (name)
)

TABLESPACE pg_default;

ALTER TABLE public."Retailers"
    OWNER to postgres;

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'Retailers'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."Retailers"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;
