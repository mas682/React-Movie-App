-- Table: public.userWatchLists

-- DROP TABLE public."userWatchLists";

CREATE TABLE public."userWatchLists"
(
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer NOT NULL,
    "movieId" integer NOT NULL,
    CONSTRAINT "userWatchLists_pkey" PRIMARY KEY ("userId", "movieId"),
    CONSTRAINT "userWatchLists_movieId_fkey" FOREIGN KEY ("movieId")
        REFERENCES public.movies (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "userWatchLists_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."userWatchLists"
    OWNER to postgres;

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."userWatchLists";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."userWatchLists"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."userWatchLists";

CREATE TRIGGER set_timestamp
    BEFORE INSERT OR UPDATE 
    ON public."userWatchLists"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
