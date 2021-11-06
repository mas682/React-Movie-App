-- Table: public.UserAuthenticationAttempts

-- DROP TABLE public."UserAuthenticationAttempts";

CREATE TABLE IF NOT EXISTS public."UserAuthenticationAttempts"
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
	"userId" bigint NOT NULL,
    -- count of forgot password attempts
	"verificationAttempts" integer NOT NULL DEFAULT 0,
    -- count of invalid password attempts
	"passwordAttempts" integer NOT NULL DEFAULT 0,
	"lastLogin" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- when account got locked from using forgot password
	"verificationLocked" timestamp without time zone,
    -- when account got locked from invalid passwords
	"passwordLocked" timestamp without time zone,
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserAuthenticationAttempts_pkey" PRIMARY KEY ("userId"),
    CONSTRAINT "UserAuthenticationAttempts_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."UserAuthenticationAttempts"
    OWNER to postgres;

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'UserAuthenticationAttempts'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."UserAuthenticationAttempts"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;

END $$;
