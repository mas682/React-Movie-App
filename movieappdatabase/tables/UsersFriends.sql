-- Table: public.UsersFriends

-- DROP TABLE public."UsersFriends";

CREATE TABLE IF NOT EXISTS public."UsersFriends"
(
    "createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followedId" integer NOT NULL,
    "followerId" integer NOT NULL,
    CONSTRAINT "UsersFriends_pkey" PRIMARY KEY ("followedId", "followerId"),
    CONSTRAINT "UsersFriends_followedId_fkey" FOREIGN KEY ("followedId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "UsersFriends_followerId_fkey" FOREIGN KEY ("followerId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."UsersFriends"
    OWNER to postgres;

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'UsersFriends'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."UsersFriends"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;
