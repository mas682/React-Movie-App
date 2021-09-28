-- Table: public.Reviews

-- DROP TABLE public."Reviews";

CREATE TABLE IF NOT EXISTS public."Reviews"
(
    id bigint NOT NULL DEFAULT nextval('reviews_id_seq'::regclass),
    rating numeric(10,2) NOT NULL,
    review text COLLATE pg_catalog."default",
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" bigint,
    "movieId" bigint,
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

DO $$ BEGIN

-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'Reviews'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."Reviews"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'Reviews'
        and trigger_schema = 'public'
        and trigger_name = 'remove_movie_rating'
    )
    THEN
        CREATE TRIGGER remove_movie_rating
            BEFORE DELETE
            ON public."Reviews"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_delete_movie_rating();
    END IF;

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'Reviews'
        and trigger_schema = 'public'
        and trigger_name = 'set_new_movie_rating'
    )
    THEN
        CREATE TRIGGER set_new_movie_rating
            AFTER INSERT
            ON public."Reviews"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_movie_rating();
    END IF;

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'Reviews'
        and trigger_schema = 'public'
        and trigger_name = 'update_movie_rating'
    )
    THEN
        CREATE TRIGGER update_movie_rating
            BEFORE UPDATE OF rating
            ON public."Reviews"
            FOR EACH ROW
            WHEN (new.rating <> old.rating)
            EXECUTE PROCEDURE public.trigger_update_movie_rating();
    END IF;
END $$;
