-- Table: public.UserVerificationQuestions

-- DROP TABLE public."UserVerificationQuestions";

CREATE TABLE public."UserVerificationQuestions"
(
    id integer NOT NULL DEFAULT nextval('"UserVerificationQuestions_id_seq"'::regclass),
    "userId" integer NOT NULL,
    "VerificationQuestionId" integer NOT NULL,
    answer character varying(50) COLLATE pg_catalog."default" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    CONSTRAINT "UserVerificationQuestions_pkey" PRIMARY KEY (id),
    CONSTRAINT "UserVerificationsQuestions_userId_VerificationQuestionId" UNIQUE ("userId", "VerificationQuestionId"),
    CONSTRAINT "UserVerificationQuestions_VerificationQuestionId_fkey" FOREIGN KEY ("VerificationQuestionId")
        REFERENCES public."VerificationQuestions" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "UserVerificationQuestions_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."UserVerificationQuestions"
    OWNER to postgres;

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."UserVerificationQuestions";

CREATE TRIGGER set_timestamp
    BEFORE INSERT OR UPDATE
    ON public."UserVerificationQuestions"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
