-- Table: public.MoviesProviders

-- DROP TABLE public."MoviesProviders";

CREATE TABLE public."MoviesProviders"
(
    "MovieId" integer NOT NULL,
    "RetailerId" integer NOT NULL,
	price double precision,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "MoviesProviders_pkey" PRIMARY KEY ("MovieId", "RetailerId"),
    CONSTRAINT "MoviesProviders_MovieId_fkey" FOREIGN KEY ("MovieId")
        REFERENCES public.movies (id) MATCH SIMPLE
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

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public."MoviesProviders";

CREATE TRIGGER set_timestamp
    BEFORE UPDATE
    ON public."MoviesProviders"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();

-- Trigger: set_createdAt

-- DROP TRIGGER "set_createdAt" ON public."MoviesProviders";

CREATE TRIGGER "set_createdAt"
    BEFORE INSERT
    ON public."MoviesProviders"
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_created_timestamp();
