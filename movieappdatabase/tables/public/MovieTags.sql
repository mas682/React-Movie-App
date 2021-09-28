-- Table: public.MovieTags

-- DROP TABLE public."MovieTags";

CREATE TABLE IF NOT EXISTS public."MovieTags"
(
    id integer NOT NULL DEFAULT nextval('"movieTags_id_seq"'::regclass),
    value character varying(20) COLLATE pg_catalog."default",
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "movieTags_pkey" PRIMARY KEY (id),
    CONSTRAINT "movieTags_value_key" UNIQUE (value)
)

TABLESPACE pg_default;

ALTER TABLE public."MovieTags"
    OWNER to postgres;

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'MovieTags'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."MovieTags"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;
