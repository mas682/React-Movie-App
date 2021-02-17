-- Table: public.MovieGenreTables

-- DROP TABLE public."MovieGenreTables";

CREATE TABLE public."MovieGenreTables"
(
    "GenreId" integer NOT NULL,
    "movieId" integer NOT NULL,
    CONSTRAINT "MovieGenreTables_pkey" PRIMARY KEY ("GenreId", "movieId"),
    CONSTRAINT "MovieGenreTables_GenreId_fkey" FOREIGN KEY ("GenreId")
        REFERENCES public."Genres" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "MovieGenreTables_movieId_fkey" FOREIGN KEY ("movieId")
        REFERENCES public.movies (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."MovieGenreTables"
    OWNER to postgres;
