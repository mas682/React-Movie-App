-- Table: public.comments

-- DROP TABLE public.comments;

CREATE TABLE public.comments
(
    id integer NOT NULL DEFAULT nextval('comments_id_seq'::regclass),
    value text COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL DEFAULT '2021-02-08 19:23:44.433-05'::timestamp with time zone,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer,
    "reviewId" integer,
    CONSTRAINT comments_pkey PRIMARY KEY (id),
    CONSTRAINT "comments_reviewId_fkey" FOREIGN KEY ("reviewId")
        REFERENCES public.reviews (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public.comments
    OWNER to postgres;


-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public.comments;

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public.comments
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public.comments;

CREATE TRIGGER set_timestamp
    BEFORE INSERT OR UPDATE 
    ON public.comments
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
