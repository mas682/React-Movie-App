-- Table: public.Reviews

-- DROP TABLE public."Reviews";

CREATE TABLE public."Reviews"
(
    id integer NOT NULL DEFAULT nextval('reviews_id_seq'::regclass),
    rating numeric(10,2) NOT NULL,
    review text COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "userId" integer,
    "movieId" integer,
    CONSTRAINT reviews_pkey PRIMARY KEY (id),
    CONSTRAINT "reviews_userId_movieId_key" UNIQUE ("userId", "movieId"),
    CONSTRAINT "reviews_movieId_fkey" FOREIGN KEY ("movieId")
        REFERENCES public."Movies" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."Reviews"
    OWNER to postgres;

-- Trigger: remove_movie_rating

-- DROP TRIGGER remove_movie_rating ON public."Reviews";

CREATE TRIGGER remove_movie_rating
    BEFORE DELETE
    ON public."Reviews"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_delete_movie_rating();

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."Reviews";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."Reviews"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_new_movie_rating

-- DROP TRIGGER set_new_movie_rating ON public."Reviews";

CREATE TRIGGER set_new_movie_rating
    AFTER INSERT
    ON public."Reviews"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_movie_rating();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."Reviews";

CREATE TRIGGER set_timestamp
    BEFORE UPDATE
    ON public."Reviews"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();

-- Trigger: update_movie_rating

-- DROP TRIGGER update_movie_rating ON public."Reviews";

CREATE TRIGGER update_movie_rating
    BEFORE UPDATE OF rating
    ON public."Reviews"
    FOR EACH ROW
    WHEN (new.rating <> old.rating)
    EXECUTE PROCEDURE public.trigger_update_movie_rating();
