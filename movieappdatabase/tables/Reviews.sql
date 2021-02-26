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

-- Trigger: remove_movie_rating

-- DROP TRIGGER remove_movie_rating ON public.reviews;

CREATE TRIGGER remove_movie_rating
    BEFORE DELETE
    ON public.reviews
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_delete_movie_rating();

-- Trigger: set_new_movie_rating

-- DROP TRIGGER set_new_movie_rating ON public.reviews;

CREATE TRIGGER set_new_movie_rating
    AFTER INSERT
    ON public.reviews
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_movie_rating();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public.reviews;

CREATE TRIGGER set_timestamp
    BEFORE UPDATE
    ON public.reviews
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();

-- Trigger: update_movie_rating

-- DROP TRIGGER update_movie_rating ON public.reviews;

CREATE TRIGGER update_movie_rating
    BEFORE UPDATE OF rating
    ON public.reviews
    FOR EACH ROW
    WHEN (new.rating <> old.rating)
    EXECUTE PROCEDURE public.trigger_update_movie_rating();
