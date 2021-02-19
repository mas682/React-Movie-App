-- Table: public.Retailers

-- DROP TABLE public."Retailers";

CREATE TABLE public."Retailers"
(
    id integer NOT NULL DEFAULT nextval('"Retailers_id_seq"'::regclass),
    name character varying(255) COLLATE pg_catalog."default",
    externalid integer,
    "createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT Retailers_pkey PRIMARY KEY (id),
    CONSTRAINT Retailers_key UNIQUE (name)
)

TABLESPACE pg_default;

ALTER TABLE public."Retailers"
    OWNER to postgres;

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."Retailers";

CREATE TRIGGER set_timestamp
    BEFORE UPDATE
    ON public."Retailers"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
