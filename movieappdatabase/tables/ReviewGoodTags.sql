-- Table: public.ReviewGoodTags

-- DROP TABLE public."ReviewGoodTags";

CREATE TABLE public."ReviewGoodTags"
(
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer NOT NULL,
    "reviewId" integer NOT NULL,
    "movieTagId" integer NOT NULL,
    CONSTRAINT "ReviewGoodTags_pkey" PRIMARY KEY ("reviewId", "movieTagId"),
    CONSTRAINT "ReviewGoodTags_movieTagId_fkey" FOREIGN KEY ("movieTagId")
        REFERENCES public."movieTags" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "ReviewGoodTags_reviewId_fkey" FOREIGN KEY ("reviewId")
        REFERENCES public.reviews (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "ReviewGoodTags_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."ReviewGoodTags"
    OWNER to postgres;
