-- Table: public.Genres

-- DROP TABLE public."Genres";

CREATE TABLE public."Genres"
(
    id integer NOT NULL DEFAULT nextval('"Genres_id_seq"'::regclass),
    value character varying(255) COLLATE pg_catalog."default" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Genres_pkey" PRIMARY KEY (id),
    CONSTRAINT "Genres_value_key" UNIQUE (value)
)

TABLESPACE pg_default;

ALTER TABLE public."Genres"
    OWNER to postgres;

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."Genres";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."Genres"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."Genres";

CREATE TRIGGER set_timestamp
    BEFORE UPDATE
    ON public."Genres"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
