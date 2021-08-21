-- Table: public.UserSessions

-- DROP TABLE public."UserSessions";

CREATE TABLE IF NOT EXISTS public."UserSessions"
(
    session character varying(64) COLLATE pg_catalog."default" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" bigint NOT NULL,
    id bigint NOT NULL DEFAULT nextval('"UserSessions_id_seq"'::regclass),
    CONSTRAINT "UserSessions_pkey" PRIMARY KEY (id),
    CONSTRAINT "UserSessions_session_key" UNIQUE (session),
    CONSTRAINT "UserSessions_session_userId_key" UNIQUE ("userId", session),
    CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."UserSessions"
    OWNER to postgres;

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'UserSessions'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."UserSessions"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;
