-- Table: public.reviews

-- DROP TABLE public.reviews;

CREATE TABLE public.reviews
(
    id integer NOT NULL DEFAULT nextval('reviews_id_seq'::regclass),
    rating numeric(10,2) NOT NULL,
    review text COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "userId" integer,
    "movieId" integer,
    CONSTRAINT reviews_pkey PRIMARY KEY (id),
    CONSTRAINT "reviews_movieId_fkey" FOREIGN KEY ("movieId")
        REFERENCES public.movies (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public.reviews
    OWNER to postgres;
