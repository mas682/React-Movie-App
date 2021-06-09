-- Table: public.UserSessions

-- DROP TABLE public."UserSessions";

CREATE TABLE public."UserSessions"
(
    id bigint NOT NULL DEFAULT nextval('"UserSessions_id_seq"'::regclass),
    session character varying(64) COLLATE pg_catalog."default" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    iv character varying(24) COLLATE pg_catalog."default" NOT NULL,
    "userId" bigint NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserSessions_pkey" PRIMARY KEY (id),
    CONSTRAINT "UserSessions_iv_key" UNIQUE (iv),
    CONSTRAINT "UserSessions_session_key" UNIQUE (session),
    CONSTRAINT "UserSessions_session_userId_key" UNIQUE ("userId", session),
    CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."UserSessions"
    OWNER to postgres;

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."UserSessions";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."UserSessions"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."UserSessions";

CREATE TRIGGER set_timestamp
    BEFORE UPDATE
    ON public."UserSessions"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
