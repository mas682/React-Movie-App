-- Table: public.Users

-- DROP TABLE public."Users";

CREATE TABLE IF NOT EXISTS public."Users"
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    username character varying(20) COLLATE pg_catalog."default" NOT NULL,
    email character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password character varying(44) COLLATE pg_catalog."default" NOT NULL,
    salt character varying(44) COLLATE pg_catalog."default" NOT NULL,
    "firstName" character varying(30) COLLATE pg_catalog."default" NOT NULL,
    "lastName" character varying(30) COLLATE pg_catalog."default" NOT NULL,
    "profileDescription" character varying(500) COLLATE pg_catalog."default",
    picture integer NOT NULL DEFAULT 0,
    "admin" boolean NOT NULL DEFAULT false,
    verified boolean NOT NULL DEFAULT false,
    "verificationLocked" timestamp without time zone,
    "verificationAttempts" integer NOT NULL DEFAULT 0,
    "passwordAttempts" integer NOT NULL DEFAULT 0,
    "lastLogin" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "passwordUpdatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username),
    CONSTRAINT users_salt_key UNIQUE (salt),
    CONSTRAINT users_picture_fkey FOREIGN KEY (picture)
        REFERENCES public."DefaultProfilePictures" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET DEFAULT
)

TABLESPACE pg_default;

ALTER TABLE public."Users"
    OWNER to postgres;

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'Users'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."Users"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'Users'
        and trigger_schema = 'public'
        and trigger_name = 'validate_salt_not_found'
    )
    THEN
        CREATE TRIGGER validate_salt_not_found
            BEFORE INSERT OR UPDATE OF salt
            ON public."Users"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_validate_salt_not_found_temp_users();
    END IF;
END $$;
