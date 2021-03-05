-- Table: public.usersWhoWatcheds

-- DROP TABLE public."usersWhoWatcheds";

CREATE TABLE public."usersWhoWatcheds"
(
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer NOT NULL,
    "movieId" integer NOT NULL,
    CONSTRAINT "usersWhoWatcheds_pkey" PRIMARY KEY ("userId", "movieId"),
    CONSTRAINT "usersWhoWatcheds_movieId_fkey" FOREIGN KEY ("movieId")
        REFERENCES public.movies (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "usersWhoWatcheds_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."usersWhoWatcheds"
    OWNER to postgres;

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."usersWhoWatcheds";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."usersWhoWatcheds"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."usersWhoWatcheds";

CREATE TRIGGER set_timestamp
    BEFORE INSERT OR UPDATE 
    ON public."usersWhoWatcheds"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
