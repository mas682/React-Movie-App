-- FUNCTION: public.trigger_delete_movie_rating()

-- DROP FUNCTION public.trigger_delete_movie_rating();

CREATE FUNCTION public.trigger_delete_movie_rating()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
BEGIN
	UPDATE public."Movies"
	SET
		"userRating" = CASE
					       WHEN "totalUserRatings" = 1 or "userRating" = 0 THEN 0
						   ELSE ((("userRating" * "totalUserRatings") - old.rating) / ("totalUserRatings" - 1))
					   END,
		"totalUserRatings" = "totalUserRatings" - 1
 	where "id" = old."movieId";
	RETURN old;
END;
$BODY$;

ALTER FUNCTION public.trigger_delete_movie_rating()
    OWNER TO postgres;
