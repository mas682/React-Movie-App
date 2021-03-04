-- Table: public.UserVerificationCodes

-- DROP TABLE public."UserVerificationCodes";

CREATE TABLE public."UserVerificationCodes"
(
    id integer NOT NULL DEFAULT nextval('userverificationcodes_id_seq'::regclass),
    "userEmail" character varying(30) COLLATE pg_catalog."default" NOT NULL,
    username character varying(20) COLLATE pg_catalog."default" NOT NULL,
    code integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    CONSTRAINT "UserVerificationCodes_pkey" PRIMARY KEY (id),
    CONSTRAINT "UserVerificationCodes_userEmail_key" UNIQUE ("userEmail"),
    CONSTRAINT "UserVerificationCodes_username_key" UNIQUE (username)
)

TABLESPACE pg_default;

ALTER TABLE public."UserVerificationCodes"
    OWNER to postgres;

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."UserVerificationCodes";

CREATE TRIGGER set_timestamp
    BEFORE INSERT OR UPDATE
    ON public."UserVerificationCodes"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
