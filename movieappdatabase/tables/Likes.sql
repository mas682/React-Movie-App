-- Table: public.likes

-- DROP TABLE public.likes;

CREATE TABLE public.likes
(
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer NOT NULL,
    "reviewId" integer NOT NULL,
    CONSTRAINT likes_pkey PRIMARY KEY ("userId", "reviewId"),
    CONSTRAINT "likes_reviewId_fkey" FOREIGN KEY ("reviewId")
        REFERENCES public.reviews (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public.likes
    OWNER to postgres;
