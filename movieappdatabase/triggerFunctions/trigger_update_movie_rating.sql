-- FUNCTION: public.trigger_update_movie_rating()

-- DROP FUNCTION public.trigger_update_movie_rating();

CREATE FUNCTION public.trigger_update_movie_rating()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
BEGIN
	UPDATE public."Movies"
	SET
		"userRating" = CASE
					       WHEN "userRating" = 0 THEN new.rating
						   ELSE (((("userRating" * "totalUserRatings") - old.rating) + new.rating) / ("totalUserRatings"))
					   END
 	where "id" = new."movieId";
    RETURN new;
END;
$BODY$;

ALTER FUNCTION public.trigger_update_movie_rating()
    OWNER TO postgres;
