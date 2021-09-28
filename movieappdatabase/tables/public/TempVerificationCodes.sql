-- Table: public.TempVerificationCodes

-- DROP TABLE public."TempVerificationCodes";

CREATE TABLE IF NOT EXISTS public."TempVerificationCodes"
(
    id integer NOT NULL DEFAULT nextval('"TempVerificationCodes_id_seq"'::regclass),
    "userId" bigint NOT NULL,
    code character varying(6) COLLATE pg_catalog."default" NOT NULL,
    "verificationAttempts" integer NOT NULL DEFAULT 0,
    "codesResent" integer NOT NULL DEFAULT 0,
    "expiresAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TempVerificationCodes_pkey" PRIMARY KEY (id),
    CONSTRAINT "TempVerificationCodes_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
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
END $$;
