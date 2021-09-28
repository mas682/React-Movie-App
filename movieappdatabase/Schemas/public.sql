-- SCHEMA: public

-- DROP SCHEMA public ;

CREATE SCHEMA if not exists public
    AUTHORIZATION postgres;

COMMENT ON SCHEMA public
    IS 'standard public schema';

GRANT ALL ON SCHEMA public TO PUBLIC;

GRANT ALL ON SCHEMA public TO postgres;