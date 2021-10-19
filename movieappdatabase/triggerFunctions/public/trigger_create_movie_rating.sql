-- FUNCTION: public.trigger_create_movie_rating()

-- DROP FUNCTION public.trigger_create_movie_rating();

DO $$ BEGIN

    IF NOT EXISTS(
        SELECT routines.routine_name, parameters.data_type, parameters.ordinal_position, routines.specific_schema
        FROM information_schema.routines
        LEFT JOIN information_schema.parameters ON routines.specific_name=parameters.specific_name
        WHERE routines.specific_schema='public' and routine_name = 'trigger_create_movie_rating'
    )
    THEN

        CREATE FUNCTION public.trigger_create_movie_rating()
            RETURNS trigger
            LANGUAGE 'plpgsql'
            COST 100
            VOLATILE NOT LEAKPROOF
        AS $BODY$
        BEGIN
            INSERT INTO public."MovieRatings"("movieId")
            VALUES (new.id);
            RETURN new;
        END;
        $BODY$;

        ALTER FUNCTION public.trigger_create_movie_rating()
        OWNER TO postgres;

    END IF;
END $$;