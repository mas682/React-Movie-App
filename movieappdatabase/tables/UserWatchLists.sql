-- Table: public.UserWatchLists

-- DROP TABLE public."UserWatchLists";

CREATE TABLE public."UserWatchLists"
(
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer NOT NULL,
    "movieId" integer NOT NULL,
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

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."UserWatchLists";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."UserWatchLists"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."UserWatchLists";

CREATE TRIGGER set_timestamp
    BEFORE INSERT OR UPDATE
    ON public."UserWatchLists"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
