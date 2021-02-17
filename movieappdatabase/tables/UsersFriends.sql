-- Table: public.UsersFriends

-- DROP TABLE public."UsersFriends";

CREATE TABLE public."UsersFriends"
(
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "followedId" integer NOT NULL,
    "followerId" integer NOT NULL,
    CONSTRAINT "UsersFriends_pkey" PRIMARY KEY ("followedId", "followerId"),
    CONSTRAINT "UsersFriends_followedId_fkey" FOREIGN KEY ("followedId")
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "UsersFriends_followerId_fkey" FOREIGN KEY ("followerId")
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."UsersFriends"
    OWNER to postgres;
