-- Table: public.users

-- DROP TABLE public.users;

CREATE TABLE public.users
(
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    username character varying(20) COLLATE pg_catalog."default" NOT NULL,
    email character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password character varying(44) COLLATE pg_catalog."default" NOT NULL,
    salt character varying(44) COLLATE pg_catalog."default" NOT NULL,
    "firstName" character varying(30) COLLATE pg_catalog."default" NOT NULL,
    "lastName" character varying(30) COLLATE pg_catalog."default" NOT NULL,
    "profileDescription" character varying(500) COLLATE pg_catalog."default",
    picture character varying(50) COLLATE pg_catalog."default",
    "admin" boolean NOT NULL DEFAULT false,
    verified boolean NOT NULL DEFAULT false,
    "verificationLocked" timestamp with time zone,
    "verificationAttempts" integer NOT NULL DEFAULT 0,
    "passwordAttempts" integer NOT NULL DEFAULT 0,
    "lastLogin" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "passwordUpdatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_picture_key UNIQUE (picture),
    CONSTRAINT users_username_key UNIQUE (username),
    CONSTRAINT users_salt_key UNIQUE (salt)
)

TABLESPACE pg_default;

ALTER TABLE public.users
    OWNER to postgres;

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public.users;

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

CREATE TRIGGER set_timestamp
    BEFORE UPDATE
    ON public.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();


-- Trigger: validate_salt_not_found

-- DROP TRIGGER validate_salt_not_found ON public.users;

CREATE TRIGGER validate_salt_not_found
    BEFORE INSERT OR UPDATE OF salt
    ON public.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_validate_salt_not_found_temp_users();
