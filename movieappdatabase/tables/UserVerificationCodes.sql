-- Table: public.UserVerificationCodes

-- DROP TABLE public."UserVerificationCodes";

CREATE TABLE public."UserVerificationCodes"
(
    id integer NOT NULL DEFAULT nextval('userverificationcodes_id_seq'::regclass),
    "userId" integer NOT NULL,
    code character varying(21) COLLATE pg_catalog."default" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    CONSTRAINT "UserVerificationCodes_pkey" PRIMARY KEY (id),
    CONSTRAINT code_key UNIQUE (code),
    CONSTRAINT "UserVerificationCodes_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."UserVerificationCodes"
    OWNER to postgres;

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."UserVerificationCodes";

CREATE TRIGGER set_timestamp
    BEFORE INSERT OR UPDATE
    ON public."UserVerificationCodes"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
