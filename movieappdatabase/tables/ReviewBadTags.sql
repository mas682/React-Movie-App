-- Table: public.ReviewBadTags

-- DROP TABLE public."ReviewBadTags";

CREATE TABLE public."ReviewBadTags"
(
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer NOT NULL,
    "reviewId" integer NOT NULL,
    "movieTagId" integer NOT NULL,
    CONSTRAINT "ReviewBadTags_pkey" PRIMARY KEY ("reviewId", "movieTagId"),
    CONSTRAINT "ReviewBadTags_movieTagId_fkey" FOREIGN KEY ("movieTagId")
        REFERENCES public."movieTags" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "ReviewBadTags_reviewId_fkey" FOREIGN KEY ("reviewId")
        REFERENCES public.reviews (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "ReviewBadTags_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."ReviewBadTags"
    OWNER to postgres;
