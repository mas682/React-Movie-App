-- SEQUENCE: private.CronJobSchedule_id_seq

-- DROP SEQUENCE private."CronJobSchedule_id_seq";

CREATE SEQUENCE IF NOT EXISTS private."CronJobSchedule_id_seq"
    CYCLE
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE private."CronJobSchedule_id_seq"
    OWNER TO postgres;