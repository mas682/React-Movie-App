-- SEQUENCE: public.CronJobControl_id_seq

-- DROP SEQUENCE public."CronJobControl_id_seq";

CREATE SEQUENCE IF NOT EXISTS public."CronJobControl_id_seq"
    CYCLE
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public."CronJobControl_id_seq"
    OWNER TO postgres;