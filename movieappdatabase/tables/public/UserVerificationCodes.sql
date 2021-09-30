-- Table: public.UserVerificationCodes

-- DROP TABLE public."UserVerificationCodes";

CREATE TABLE IF NOT EXISTS public."UserVerificationCodes"
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( CYCLE INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" timestamp without time zone NOT NULL,
    "userEmail" character varying(30) COLLATE pg_catalog."default" NOT NULL,
    username character varying(20) COLLATE pg_catalog."default" NOT NULL,
    "verificationAttempts" integer NOT NULL DEFAULT 0,
    "codesResent" integer NOT NULL DEFAULT 0,
    code character varying(6) COLLATE pg_catalog."default" NOT NULL,
    password character varying(44) COLLATE pg_catalog."default" NOT NULL,
    "firstName" character varying(30) COLLATE pg_catalog."default" NOT NULL,
    "lastName" character varying COLLATE pg_catalog."default" NOT NULL,
    salt character varying(44) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "UserVerificationCodes_pkey" PRIMARY KEY (id),
    CONSTRAINT "UserVerificationCodes_salt_key" UNIQUE (salt)
)

TABLESPACE pg_default;

ALTER TABLE public."UserVerificationCodes"
    OWNER to postgres;

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'UserVerificationCodes'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."UserVerificationCodes"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'UserVerificationCodes'
        and trigger_schema = 'public'
        and trigger_name = 'set_expiration_timestamp'
    )
    THEN
        CREATE TRIGGER set_expiration_timestamp
            BEFORE INSERT OR UPDATE
            ON public."UserVerificationCodes"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_verification_code_expiration();
    END IF;

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'UserVerificationCodes'
        and trigger_schema = 'public'
        and trigger_name = 'validate_salt_not_found'
    )
    THEN
        CREATE TRIGGER validate_salt_not_found
            BEFORE INSERT OR UPDATE OF salt
            ON public."UserVerificationCodes"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_validate_salt_not_found_users();
    END IF;

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'UserVerificationCodes'
        and trigger_schema = 'public'
        and trigger_name = 'valide_user_not_found'
    )
    THEN
        CREATE TRIGGER valide_user_not_found
            BEFORE INSERT
            ON public."UserVerificationCodes"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_validate_user_not_found();
    END IF;
END $$;
