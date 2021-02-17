-- Table: public.trendingmovies

-- DROP TABLE public.trendingmovies;

CREATE TABLE public.trendingmovies
(
    id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
)

TABLESPACE pg_default;

ALTER TABLE public.trendingmovies
    OWNER to postgres;

-- Trigger: set_timestamp

-- DROP TRIGGER set_timestamp ON public.trendingmovies;

CREATE TRIGGER set_timestamp
    BEFORE UPDATE
    ON public.trendingmovies
    FOR EACH ROW
    EXECUTE PROCEDURE public.trigger_set_timestamp();
