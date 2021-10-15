-- Table: public.ReviewGoodTags

-- DROP TABLE public."ReviewGoodTags";

CREATE TABLE IF NOT EXISTS public."ReviewGoodTags"
(
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" bigint NOT NULL,
    "reviewId" bigint NOT NULL,
    "movieTagId" integer NOT NULL,
    CONSTRAINT "ReviewGoodTags_pkey" PRIMARY KEY ("reviewId", "movieTagId"),
    CONSTRAINT "ReviewGoodTags_movieTagId_fkey" FOREIGN KEY ("movieTagId")
        REFERENCES public."MovieTags" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT "ReviewGoodTags_reviewId_fkey" FOREIGN KEY ("reviewId")
        REFERENCES public."Reviews" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT "ReviewGoodTags_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."ReviewGoodTags"
    OWNER to postgres;

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'ReviewGoodTags'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."ReviewGoodTags"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;
