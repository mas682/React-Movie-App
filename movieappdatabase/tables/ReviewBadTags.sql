-- Table: public.ReviewBadTags

-- DROP TABLE public."ReviewBadTags";

CREATE TABLE public."ReviewBadTags"
(
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer NOT NULL,
    "reviewId" integer NOT NULL,
    "movieTagId" integer NOT NULL,
    CONSTRAINT "ReviewBadTags_pkey" PRIMARY KEY ("reviewId", "movieTagId"),
    CONSTRAINT "ReviewBadTags_movieTagId_fkey" FOREIGN KEY ("movieTagId")
        REFERENCES public."MovieTags" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "ReviewBadTags_reviewId_fkey" FOREIGN KEY ("reviewId")
        REFERENCES public."Reviews" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "ReviewBadTags_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."ReviewBadTags"
    OWNER to postgres;

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."ReviewBadTags";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."ReviewBadTags"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."ReviewBadTags";

CREATE TRIGGER set_timestamp
    BEFORE INSERT OR UPDATE
    ON public."ReviewBadTags"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
