-- Table: public.UserCredentials

-- DROP TABLE public."UserCredentials";

CREATE TABLE IF NOT EXISTS public."UserCredentials"
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
	"userId" bigint NOT NULL,
	password character varying(44) COLLATE pg_catalog."default" NOT NULL,
    salt character varying(44) COLLATE pg_catalog."default" NOT NULL,
	"createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserCredentials_pkey" PRIMARY KEY ("userId"),
    CONSTRAINT "UserCredentials_salt_key" UNIQUE (salt),
    CONSTRAINT "UserCredentials_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."Users" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."UserCredentials"
    OWNER to postgres;


CREATE UNIQUE INDEX IF NOT EXISTS "UserCredentials_salt_key_index"
ON public."UserCredentials" USING btree
(salt COLLATE pg_catalog."default" ASC NULLS LAST)
TABLESPACE pg_default;

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'UserCredentials'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."UserCredentials"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'UserCredentials'
        and trigger_schema = 'public'
        and trigger_name = 'validate_salt_not_found'
    )
    THEN
        CREATE TRIGGER validate_salt_not_found
            BEFORE INSERT OR UPDATE OF salt
            ON public."UserCredentials"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_validate_salt_not_found_for_user_creds();
    END IF;
END $$;
