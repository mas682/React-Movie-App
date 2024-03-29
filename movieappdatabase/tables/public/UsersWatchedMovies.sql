-- Table: public.UsersWatchedMovies

-- DROP TABLE public."UsersWatchedMovies";

CREATE TABLE IF NOT EXISTS public."UsersWatchedMovies"
(
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" bigint NOT NULL,
    "movieId" bigint NOT NULL,
    CONSTRAINT "UsersWatchedMovies_pkey" PRIMARY KEY ("userId", "movieId"),
    CONSTRAINT "UsersWatchedMovies_movieId_fkey" FOREIGN KEY ("movieId")
        REFERENCES public."Movies" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT "UsersWatchedMovies_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."UsersWatchedMovies"
    OWNER to postgres;
-- Index: usersWhoWatcheds_pkey

-- DROP INDEX public."usersWhoWatcheds_pkey";

CREATE UNIQUE INDEX IF NOT EXISTS "UsersWatchedMovies_pkey"
    ON public."UsersWatchedMovies" USING btree
    ("userId" ASC NULLS LAST, "movieId" ASC NULLS LAST)
    TABLESPACE pg_default;

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'UsersWatchedMovies'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."UsersWatchedMovies"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;
