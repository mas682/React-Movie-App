-- Table: public.users

-- DROP TABLE public.users;

CREATE TABLE public.users
(
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    username character varying(20) COLLATE pg_catalog."default" NOT NULL,
    email character varying(30) COLLATE pg_catalog."default" NOT NULL,
    password character varying(20) COLLATE pg_catalog."default" NOT NULL,
    "firstName" character varying(30) COLLATE pg_catalog."default" NOT NULL,
    "lastName" character varying(30) COLLATE pg_catalog."default" NOT NULL,
    "profileDescription" character varying(500) COLLATE pg_catalog."default",
    "admin" boolean NOT NULL DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username)
)

TABLESPACE pg_default;

ALTER TABLE public.users
    OWNER to postgres;


CREATE TRIGGER set_timestamp
    BEFORE UPDATE
    ON public.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
