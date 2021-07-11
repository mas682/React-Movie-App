-- Table: public.VerificationQuestions

-- DROP TABLE public."VerificationQuestions";

CREATE TABLE public."VerificationQuestions"
(
    id integer NOT NULL DEFAULT nextval('"VerificationQuestions_id_seq"'::regclass),
    question character varying(150) COLLATE pg_catalog."default" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "VerificationQuestions_pkey" PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public."VerificationQuestions"
    OWNER to postgres;

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."VerificationQuestions";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."VerificationQuestions"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."VerificationQuestions";

CREATE TRIGGER set_timestamp
    BEFORE INSERT OR UPDATE
    ON public."VerificationQuestions"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
