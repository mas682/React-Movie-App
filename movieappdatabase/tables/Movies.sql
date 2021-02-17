-- Table: public.movies

-- DROP TABLE public.movies;

CREATE TABLE public.movies
(
    id integer NOT NULL,
    title character varying(255) COLLATE pg_catalog."default",
    revenue integer,
    director character varying(255) COLLATE pg_catalog."default",
    "runTime" integer,
    rating character varying(255) COLLATE pg_catalog."default",
    trailer character varying(255) COLLATE pg_catalog."default",
    "backgroundImage" character varying(255) COLLATE pg_catalog."default",
    "releaseDate" date,
    overview text COLLATE pg_catalog."default",
    poster character varying(255) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT movies_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.movies
    OWNER to postgres;

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public.movies;

CREATE TRIGGER set_timestamp
    BEFORE UPDATE
    ON public.movies
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
