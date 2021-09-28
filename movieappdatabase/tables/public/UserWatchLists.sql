-- Table: public.UserWatchLists

-- DROP TABLE public."UserWatchLists";

CREATE TABLE IF NOT EXISTS public."UserWatchLists"
(
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" bigint NOT NULL,
    "movieId" bigint NOT NULL,
    CONSTRAINT "userWatchLists_pkey" PRIMARY KEY ("userId", "movieId"),
    CONSTRAINT "userWatchLists_movieId_fkey" FOREIGN KEY ("movieId")
        REFERENCES public."Movies" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "userWatchLists_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."UserWatchLists"
    OWNER to postgres;

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'UserWatchLists'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."UserWatchLists"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;
