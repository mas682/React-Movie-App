-- Table: public.UserVerificationCodes

-- DROP TABLE public."UserVerificationCodes";

CREATE TABLE public."UserVerificationCodes"
(
    id integer NOT NULL DEFAULT nextval('userverificationcodes_id_seq'::regclass),
    "userEmail" character varying(30) COLLATE pg_catalog."default" NOT NULL,
    username character varying(20) COLLATE pg_catalog."default" NOT NULL,
    code character varying(6) COLLATE pg_catalog."default" NOT NULL,
    "verificationAttempts" integer NOT NULL DEFAULT 0,
    "codesResent" integer NOT NULL DEFAULT 0,
    "expiresAt" timestamp with time zone NOT NULL,
    password character varying(20) COLLATE pg_catalog."default" NOT NULL,
    "firstName" character varying(30) COLLATE pg_catalog."default" NOT NULL,
    "lastName" character varying(30) COLLATE pg_catalog."default" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "UserVerificationCodes_pkey" PRIMARY KEY (id)
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

-- Trigger: valide_user_not_found

-- DROP TRIGGER valide_user_not_found ON public."UserVerificationCodes";

CREATE TRIGGER valide_user_not_found
    BEFORE INSERT
    ON public."UserVerificationCodes"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_validate_user_not_found();
