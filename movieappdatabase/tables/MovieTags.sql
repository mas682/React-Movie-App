-- Table: public.movieTags

-- DROP TABLE public."movieTags";

CREATE TABLE public."movieTags"
(
    id integer NOT NULL DEFAULT nextval('"movieTags_id_seq"'::regclass),
    value character varying(20) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "movieTags_pkey" PRIMARY KEY (id),
    CONSTRAINT "movieTags_value_key" UNIQUE (value)
)

TABLESPACE pg_default;

ALTER TABLE public."movieTags"
    OWNER to postgres;


-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."movieTags";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."movieTags"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."movieTags";

CREATE TRIGGER set_timestamp
    BEFORE INSERT OR UPDATE 
    ON public."movieTags"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
