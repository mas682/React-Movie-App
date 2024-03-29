-- Table: public.DefaultProfilePictures

-- DROP TABLE public."DefaultProfilePictures";

CREATE TABLE IF NOT EXISTS public."DefaultProfilePictures"
(
    id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( CYCLE INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    filename character varying(255) COLLATE pg_catalog."default" NOT NULL,
    source character varying(255) COLLATE pg_catalog."default" NOT NULL,
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DefaultProfilePictures_pkey" PRIMARY KEY (id),
    CONSTRAINT "DefaultProfilePictures_filename_key" UNIQUE (filename)
)

TABLESPACE pg_default;

ALTER TABLE public."DefaultProfilePictures"
    OWNER to postgres;

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."DefaultProfilePictures";

DO $$ BEGIN
-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."DefaultProfilePictures";
    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'DefaultProfilePictures' -- Your table name comes here
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."DefaultProfilePictures"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;
