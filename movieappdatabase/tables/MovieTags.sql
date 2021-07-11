-- Table: public.MovieTags

-- DROP TABLE public."MovieTags";

CREATE TABLE public."MovieTags"
(
    id integer NOT NULL DEFAULT nextval('"movieTags_id_seq"'::regclass),
    value character varying(20) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "movieTags_pkey" PRIMARY KEY (id),
    CONSTRAINT "movieTags_value_key" UNIQUE (value)
)

TABLESPACE pg_default;

ALTER TABLE public."MovieTags"
    OWNER to postgres;

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."MovieTags";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."MovieTags"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."MovieTags";

CREATE TRIGGER set_timestamp
    BEFORE INSERT OR UPDATE
    ON public."MovieTags"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
