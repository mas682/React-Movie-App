-- Table: public.movies

-- DROP TABLE public.movies;

CREATE TABLE public.movies
(
	id integer NOT NULL DEFAULT nextval('movies_id_seq'::regclass),
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
    "premiereReleaseDate" date,
    "theaterLimitedReleaseDate" date,
    "theaterReleaseDate" date,
    "digitalReleaseDate" date,
    "physicalReleaseDate" date,
    "tvReleaseDate" date,
    status character varying(255) COLLATE pg_catalog."default",
    homepage character varying(255) COLLATE pg_catalog."default",
    imdb_id character varying(100) COLLATE pg_catalog."default",
	tmdb_id integer NOT NULL,
    "originalLanguage" character varying(20) COLLATE pg_catalog."default",
	"userRating" numeric(10, 2) NOT NULL DEFAULT 0,
	"totalUserRatings"  bigint NOT NULL DEFAULT 0,
	"createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT movies_pkey PRIMARY KEY (id),
	CONSTRAINT movies_imdb_id_key UNIQUE (imdb_id),
	CONSTRAINT movies_tmdb_id_key UNIQUE (tmdb_id)
)

TABLESPACE pg_default;

ALTER TABLE public.movies
    OWNER to postgres;

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public.movies;

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public.movies
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public.movies;

CREATE TRIGGER set_timestamp
    BEFORE UPDATE
    ON public.movies
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
