-- Table: public.UsersWatchedMovies

-- DROP TABLE public."UsersWatchedMovies";

CREATE TABLE public."UsersWatchedMovies"
(
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer NOT NULL,
    "movieId" integer NOT NULL,
    CONSTRAINT "UsersWatchedMovies_pkey" PRIMARY KEY ("userId", "movieId"),
    CONSTRAINT "UsersWatchedMovies_movieId_fkey" FOREIGN KEY ("movieId")
        REFERENCES public."Movies" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "UsersWatchedMovies_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."UsersWatchedMovies"
    OWNER to postgres;
-- Index: usersWhoWatcheds_pkey

-- DROP INDEX public."usersWhoWatcheds_pkey";

CREATE UNIQUE INDEX "UsersWatchedMovies_pkey"
    ON public."UsersWatchedMovies" USING btree
    ("userId" ASC NULLS LAST, "movieId" ASC NULLS LAST)
    TABLESPACE pg_default;

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."UsersWatchedMovies";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."UsersWatchedMovies"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."UsersWatchedMovies";

CREATE TRIGGER set_timestamp
    BEFORE INSERT OR UPDATE
    ON public."UsersWatchedMovies"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
