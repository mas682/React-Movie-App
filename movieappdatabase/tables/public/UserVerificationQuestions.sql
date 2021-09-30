-- Table: public.UserVerificationQuestions

-- DROP TABLE public."UserVerificationQuestions";

CREATE TABLE IF NOT EXISTS public."UserVerificationQuestions"
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( CYCLE INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    "userId" bigint NOT NULL,
    "VerificationQuestionId" integer NOT NULL,
    answer character varying(50) COLLATE pg_catalog."default" NOT NULL,
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
