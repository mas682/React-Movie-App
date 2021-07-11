-- Table: public.TempVerificationCodes

-- DROP TABLE public."TempVerificationCodes";

CREATE TABLE public."TempVerificationCodes"
(
    id integer NOT NULL DEFAULT nextval('"TempVerificationCodes_id_seq"'::regclass),
    "userId" integer NOT NULL,
    code character varying(6) COLLATE pg_catalog."default" NOT NULL,
    "verificationAttempts" integer NOT NULL DEFAULT 0,
    "codesResent" integer NOT NULL DEFAULT 0,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "TempVerificationCodes_pkey" PRIMARY KEY (id),
    CONSTRAINT "TempVerificationCodes_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."TempVerificationCodes"
    OWNER to postgres;

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."TempVerificationCodes";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."TempVerificationCodes"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_expiration_timestamp

-- DROP TRIGGER set_expiration_timestamp ON public."TempVerificationCodes";

CREATE TRIGGER set_expiration_timestamp
    BEFORE INSERT OR UPDATE
    ON public."TempVerificationCodes"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_verification_code_expiration();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."TempVerificationCodes";

CREATE TRIGGER set_timestamp
    BEFORE INSERT OR UPDATE
    ON public."TempVerificationCodes"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
