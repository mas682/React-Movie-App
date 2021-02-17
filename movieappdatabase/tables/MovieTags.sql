-- Table: public.movieTags

-- DROP TABLE public."movieTags";

CREATE TABLE public."movieTags"
(
    id integer NOT NULL DEFAULT nextval('"movieTags_id_seq"'::regclass),
    value character varying(255) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "movieTags_pkey" PRIMARY KEY (id),
    CONSTRAINT "movieTags_value_key" UNIQUE (value)
)

TABLESPACE pg_default;

ALTER TABLE public."movieTags"
    OWNER to postgres;
