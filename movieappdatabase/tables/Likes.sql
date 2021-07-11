-- Table: public.Likes

-- DROP TABLE public."Likes";

CREATE TABLE public."Likes"
(
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer NOT NULL,
    "reviewId" integer NOT NULL,
    CONSTRAINT likes_pkey PRIMARY KEY ("userId", "reviewId"),
    CONSTRAINT "likes_reviewId_fkey" FOREIGN KEY ("reviewId")
        REFERENCES public."Reviews" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."Likes"
    OWNER to postgres;

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."Likes";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."Likes"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."Likes";

CREATE TRIGGER set_timestamp
    BEFORE INSERT OR UPDATE
    ON public."Likes"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
