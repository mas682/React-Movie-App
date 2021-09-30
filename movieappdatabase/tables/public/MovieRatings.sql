-- Table: public.MovieRatings

-- DROP TABLE public."MovieRatings";

CREATE TABLE IF NOT EXISTS public."MovieRatings"
(
	"movieId" bigint,
	"userRating" numeric(10,2) NOT NULL DEFAULT 0.0,
    "totalUserRatings" bigint NOT NULL DEFAULT 0,
	"createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "MovieRatings_movieId_fkey" FOREIGN KEY ("movieId")
        REFERENCES public."Movies" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."MovieRatings"
    OWNER to postgres;
-- Index: fki_MovieRatings_reviewId_fkey

-- DROP INDEX public."fki_MovieRatings_movieId_fkey";

CREATE INDEX IF NOT EXISTS "fki_MovieRatings_movieId_fkey"
    ON public."MovieRatings" USING btree
    ("movieId" ASC NULLS LAST)
    TABLESPACE pg_default;


DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'MovieRatings'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."MovieRatings"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;