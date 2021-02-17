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
