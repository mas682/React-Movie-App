-- Table: public.DefaultProfilePictures

-- DROP TABLE public."DefaultProfilePictures";

CREATE TABLE public."DefaultProfilePictures"
(
    id integer NOT NULL DEFAULT nextval('"DefaultProfilePictures_id_seq"'::regclass),
    filename character varying(255) COLLATE pg_catalog."default" NOT NULL,
    source character varying(255) COLLATE pg_catalog."default" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DefaultProfilePictures_pkey" PRIMARY KEY (id),
    CONSTRAINT "DefaultProfilePictures_filename_key" UNIQUE (filename)
)

TABLESPACE pg_default;

ALTER TABLE public."DefaultProfilePictures"
    OWNER to postgres;

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."DefaultProfilePictures";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."DefaultProfilePictures"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."DefaultProfilePictures";

CREATE TRIGGER set_timestamp
    BEFORE UPDATE
    ON public."DefaultProfilePictures"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
