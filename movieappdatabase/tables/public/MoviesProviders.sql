-- Table: public.MoviesProviders

-- DROP TABLE public."MoviesProviders";

CREATE TABLE IF NOT EXISTS public."MoviesProviders"
(
    "MovieId" integer NOT NULL,
    "RetailerId" integer NOT NULL,
    price double precision,
    "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MoviesProviders_pkey" PRIMARY KEY ("MovieId", "RetailerId"),
    CONSTRAINT "MoviesProviders_MovieId_fkey" FOREIGN KEY ("MovieId")
        REFERENCES public."Movies" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "MoviesProviders_RetailerId_fkey" FOREIGN KEY ("RetailerId")
        REFERENCES public."Retailers" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE public."MoviesProviders"
    OWNER to postgres;

DO $$ BEGIN
-- Trigger: set_timestamp

    IF NOT EXISTS(
        SELECT *
        FROM  information_schema.triggers
        WHERE event_object_table = 'MoviesProviders'
        and trigger_schema = 'public'
        and trigger_name = 'set_timestamp'
    )
    THEN
        CREATE TRIGGER set_timestamp
            BEFORE UPDATE
            ON public."MoviesProviders"
            FOR EACH ROW
            EXECUTE PROCEDURE public.trigger_set_timestamp();
    END IF;
END $$;
