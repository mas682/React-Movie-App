-- Table: public.Movies

-- DROP TABLE public."Movies";

CREATE TABLE IF NOT EXISTS public."Movies"
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    title character varying(255) COLLATE pg_catalog."default",
    director character varying(100) COLLATE pg_catalog."default",
    "runTime" integer,
    rating character varying(100) COLLATE pg_catalog."default",
    trailer character varying(100) COLLATE pg_catalog."default",
    "backgroundImage" character varying(100) COLLATE pg_catalog."default",
    "releaseDate" date,
    overview text COLLATE pg_catalog."default",
    poster character varying(100) COLLATE pg_catalog."default",
    "premiereReleaseDate" date,
    "theaterLimitedReleaseDate" date,
    "theaterReleaseDate" date,
    "digitalReleaseDate" date,
    "physicalReleaseDate" date,
    "tvReleaseDate" date,
    status character varying(100) COLLATE pg_catalog."default",
    homepage character varying(100) COLLATE pg_catalog."default",
    imdb_id character varying(50) COLLATE pg_catalog."default",
    tmdb_id integer NOT NULL,
    "originalLanguage" character varying(20) COLLATE pg_catalog."default",
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT movies_pkey PRIMARY KEY (id),
    CONSTRAINT movies_imdb_id_key UNIQUE (imdb_id),
    CONSTRAINT movies_tmdb_id_key UNIQUE (tmdb_id)
)

TABLESPACE pg_default;

ALTER TABLE public."Movies"
    OWNER to postgres;


DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'Movies'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."Movies"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;
