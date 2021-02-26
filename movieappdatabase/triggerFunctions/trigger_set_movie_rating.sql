-- FUNCTION: public.trigger_set_movie_rating()

-- DROP FUNCTION public.trigger_set_movie_rating();

CREATE FUNCTION public.trigger_set_movie_rating()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
BEGIN
	UPDATE public.movies
	SET
		"userRating" = CASE
					       WHEN "totalUserRatings" = 0 or "userRating" = 0 THEN new.rating
						   ELSE ((("userRating" * "totalUserRatings") + new.rating) / ("totalUserRatings" + 1))
					   END,
		"totalUserRatings" = "totalUserRatings" + 1
 	where "id" = new."movieId";
    RETURN new;
END;
$BODY$;

ALTER FUNCTION public.trigger_set_movie_rating()
    OWNER TO postgres;
