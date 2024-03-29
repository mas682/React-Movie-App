-- Table: public.Comments

-- DROP TABLE public."Comments";

CREATE TABLE IF NOT EXISTS public."Comments"
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( CYCLE INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    value character varying(1000) COLLATE pg_catalog."default",
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" bigint,
    "reviewId" bigint,
    CONSTRAINT comments_pkey PRIMARY KEY (id),
    CONSTRAINT "comments_reviewId_fkey" FOREIGN KEY ("reviewId")
        REFERENCES public."Reviews" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."Comments"
    OWNER to postgres;
-- Index: fki_comments_reviewId_fkey

-- DROP INDEX public."fki_comments_reviewId_fkey";

CREATE INDEX IF NOT EXISTS "fki_comments_reviewId_fkey"
    ON public."Comments" USING btree
    ("reviewId" ASC NULLS LAST)
    TABLESPACE pg_default;


DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'Comments'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."Comments"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;
