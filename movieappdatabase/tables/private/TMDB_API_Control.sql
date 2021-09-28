-- Table: private.TMDB_API_Control

-- DROP TABLE private."TMDB_API_Control";

CREATE TABLE IF NOT EXISTS private."TMDB_API_Control"
(
    "lastRun" timestamp without time zone NOT NULL,
    type character varying(50) COLLATE pg_catalog."default",
    enabled boolean NOT NULL,
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id integer NOT NULL DEFAULT nextval('"TMDB_API_Control_id_seq"'::regclass),
    CONSTRAINT "TMDB_API_Control_pkey" PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE private."TMDB_API_Control"
    OWNER to postgres;

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON private."TMDB_API_Control";

    DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'TMDB_API_Control'
        and trigger_schema = 'private'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON private."TMDB_API_Control"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;