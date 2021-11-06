-- Table: public.TempVerificationCodes

-- DROP TABLE public."TempVerificationCodes";

CREATE TABLE IF NOT EXISTS public."TempVerificationCodes"
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( CYCLE INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    "userId" bigint NOT NULL,
    salt character varying(44) COLLATE pg_catalog."default" NOT NULL,
	code character varying(44) COLLATE pg_catalog."default" NOT NULL,
    "verificationAttempts" integer NOT NULL DEFAULT 0,
    "expiresAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TempVerificationCodes_pkey" PRIMARY KEY (id),
    CONSTRAINT "TempVerificationCodes_salt_key" UNIQUE (salt),
    CONSTRAINT "TempVerificationCodes_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."TempVerificationCodes"
    OWNER to postgres;

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'TempVerificationCodes'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."TempVerificationCodes"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'TempVerificationCodes'
        and trigger_schema = 'public'
        and trigger_name = 'set_expiration_timestamp'
    )
    THEN
        CREATE TRIGGER set_expiration_timestamp
            BEFORE INSERT OR UPDATE
            ON public."TempVerificationCodes"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_verification_code_expiration();
    END IF;

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'TempVerificationCodes'
        and trigger_schema = 'public'
        and trigger_name = 'remove_expired_record'
    )
    THEN
        CREATE TRIGGER remove_expired_record
            AFTER INSERT OR UPDATE OF "verificationAttempts"
            ON public."TempVerificationCodes"
            FOR EACH ROW
            WHEN (new."verificationAttempts" >= 3)
            EXECUTE PROCEDURE public.trigger_remove_expired_verification_code();
    END IF;

        IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'TempVerificationCodes'
        and trigger_schema = 'public'
        and trigger_name = 'validate_salt_not_found'
    )
    THEN
        CREATE TRIGGER validate_salt_not_found
            BEFORE INSERT OR UPDATE OF salt
            ON public."TempVerificationCodes"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_validate_salt_not_found_for_temp_verification_codes();
            END IF;
END $$;
