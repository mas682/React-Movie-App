-- Table: public.Comments

-- DROP TABLE public."Comments";

CREATE TABLE public."Comments"
(
    id integer NOT NULL DEFAULT nextval('comments_id_seq'::regclass),
    value character varying(1000) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer,
    "reviewId" integer,
    CONSTRAINT comments_pkey PRIMARY KEY (id),
    CONSTRAINT "comments_reviewId_fkey" FOREIGN KEY ("reviewId")
        REFERENCES public."Reviews" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."Comments"
    OWNER to postgres;
-- Index: fki_comments_reviewId_fkey

-- DROP INDEX public."fki_comments_reviewId_fkey";

CREATE INDEX "fki_comments_reviewId_fkey"
    ON public."Comments" USING btree
    ("reviewId" ASC NULLS LAST)
    TABLESPACE pg_default;

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."Comments";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."Comments"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."Comments";

CREATE TRIGGER set_timestamp
    BEFORE INSERT OR UPDATE
    ON public."Comments"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
