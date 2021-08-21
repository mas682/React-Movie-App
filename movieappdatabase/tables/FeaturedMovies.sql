-- Table: public.FeaturedMovies

-- DROP TABLE public."FeaturedMovies";

CREATE TABLE IF NOT EXISTS public."FeaturedMovies"
(
    id integer NOT NULL DEFAULT nextval('"FeaturedMovies_id_seq"'::regclass),
    "movieId" integer NOT NULL,
    "order" integer NOT NULL DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeaturedMovies_pkey" PRIMARY KEY (id),
    CONSTRAINT "FeaturedMovies_uniq_key" UNIQUE ("movieId"),
    CONSTRAINT "FeaturedMovies_movieId_fkey" FOREIGN KEY ("movieId")
        REFERENCES public."Movies" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."FeaturedMovies"
    OWNER to postgres;
