-- Table: public.UserVerificationQuestions

-- DROP TABLE public."UserVerificationQuestions";

CREATE TABLE IF NOT EXISTS public."UserVerificationQuestions"
(
    id integer NOT NULL DEFAULT nextval('"UserVerificationQuestions_id_seq"'::regclass),
    "userId" integer NOT NULL,
    "VerificationQuestionId" integer NOT NULL,
    answer character varying(50) COLLATE pg_catalog."default" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserVerificationQuestions_pkey" PRIMARY KEY (id),
    CONSTRAINT "UserVerificationsQuestions_userId_VerificationQuestionId" UNIQUE ("userId", "VerificationQuestionId"),
    CONSTRAINT "UserVerificationQuestions_VerificationQuestionId_fkey" FOREIGN KEY ("VerificationQuestionId")
        REFERENCES public."VerificationQuestions" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "UserVerificationQuestions_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."UserVerificationQuestions"
    OWNER to postgres;

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'UserVerificationQuestions'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."UserVerificationQuestions"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;
