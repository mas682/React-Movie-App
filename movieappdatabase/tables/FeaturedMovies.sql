-- Table: public.FeaturedMovies

-- DROP TABLE public."FeaturedMovies";

CREATE TABLE public."FeaturedMovies"
(
    id integer NOT NULL DEFAULT nextval('"FeaturedMovies_id_seq"'::regclass),
    "movieId" integer NOT NULL,
    "order" integer NOT NULL DEFAULT 0,
    "createdAt" timestamp with time zone,
    CONSTRAINT "FeaturedMovies_pkey" PRIMARY KEY (id),
    CONSTRAINT "FeaturedMovies_uniq_key" UNIQUE ("movieId"),
    CONSTRAINT "FeaturedMovies_movieId_fkey" FOREIGN KEY ("movieId")
        REFERENCES public.movies (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."FeaturedMovies"
    OWNER to postgres;

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."FeaturedMovies";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."FeaturedMovies"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();
