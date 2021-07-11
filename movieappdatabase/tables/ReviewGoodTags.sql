-- Table: public.ReviewGoodTags

-- DROP TABLE public."ReviewGoodTags";

CREATE TABLE public."ReviewGoodTags"
(
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer NOT NULL,
    "reviewId" integer NOT NULL,
    "movieTagId" integer NOT NULL,
    CONSTRAINT "ReviewGoodTags_pkey" PRIMARY KEY ("reviewId", "movieTagId"),
    CONSTRAINT "ReviewGoodTags_movieTagId_fkey" FOREIGN KEY ("movieTagId")
        REFERENCES public."MovieTags" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "ReviewGoodTags_reviewId_fkey" FOREIGN KEY ("reviewId")
        REFERENCES public."Reviews" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "ReviewGoodTags_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."ReviewGoodTags"
    OWNER to postgres;

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."ReviewGoodTags";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."ReviewGoodTags"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."ReviewGoodTags";

CREATE TRIGGER set_timestamp
    BEFORE INSERT OR UPDATE
    ON public."ReviewGoodTags"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
