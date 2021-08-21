-- Table: public.VerificationQuestions

-- DROP TABLE public."VerificationQuestions";

CREATE TABLE IF NOT EXISTS public."VerificationQuestions"
(
    id integer NOT NULL DEFAULT nextval('"VerificationQuestions_id_seq"'::regclass),
    question character varying(150) COLLATE pg_catalog."default" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VerificationQuestions_pkey" PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public."VerificationQuestions"
    OWNER to postgres;

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'VerificationQuestions'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."VerificationQuestions"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;
