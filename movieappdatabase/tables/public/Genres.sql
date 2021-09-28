-- Table: public.Genres

-- DROP TABLE public."Genres";

CREATE TABLE IF NOT EXISTS public."Genres"
(
    id integer NOT NULL DEFAULT nextval('"Genres_id_seq"'::regclass),
    value character varying(100) COLLATE pg_catalog."default" NOT NULL,
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Genres_pkey" PRIMARY KEY (id),
    CONSTRAINT "Genres_value_key" UNIQUE (value)
)

TABLESPACE pg_default;

ALTER TABLE public."Genres"
    OWNER to postgres;

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'Genres'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."Genres"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;
