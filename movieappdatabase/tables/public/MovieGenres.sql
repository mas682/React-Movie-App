-- Table: public.MovieGenres

-- DROP TABLE public."MovieGenres";

CREATE TABLE IF NOT EXISTS public."MovieGenres"
(
    "GenreId" integer NOT NULL,
    "movieId" bigint NOT NULL,
    CONSTRAINT "MovieGenres_pkey" PRIMARY KEY ("GenreId", "movieId"),
    CONSTRAINT "MovieGenres_GenreId_fkey" FOREIGN KEY ("GenreId")
        REFERENCES public."Genres" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT "MovieGenres_movieId_fkey" FOREIGN KEY ("movieId")
        REFERENCES public."Movies" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."MovieGenres"
    OWNER to postgres;
