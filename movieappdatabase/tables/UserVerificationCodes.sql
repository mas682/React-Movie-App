-- Table: public.UserVerificationCodes

-- DROP TABLE public."UserVerificationCodes";

CREATE TABLE public."UserVerificationCodes"
(
    id integer NOT NULL DEFAULT nextval('userverificationcodes_id_seq'::regclass),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "userEmail" character varying(30) COLLATE pg_catalog."default" NOT NULL,
    username character varying(20) COLLATE pg_catalog."default" NOT NULL,
    code integer NOT NULL,
    CONSTRAINT "UserVerificationCodes_pkey" PRIMARY KEY (id),
    CONSTRAINT "UserVerificationCodes_userEmail_key" UNIQUE ("userEmail"),
    CONSTRAINT "UserVerificationCodes_username_key" UNIQUE (username)
)

TABLESPACE pg_default;

ALTER TABLE public."UserVerificationCodes"
    OWNER to postgres;

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."UserVerificationCodes";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."UserVerificationCodes"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_expiration_timestamp

-- DROP TRIGGER set_expiration_timestamp ON public."UserVerificationCodes";

CREATE TRIGGER set_expiration_timestamp
    BEFORE INSERT OR UPDATE
    ON public."UserVerificationCodes"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_verification_code_expiration();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."UserVerificationCodes";

CREATE TRIGGER set_timestamp
    BEFORE INSERT OR UPDATE
    ON public."UserVerificationCodes"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
