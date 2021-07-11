-- FUNCTION: public.trigger_validate_salt_not_found_temp_users()

-- DROP FUNCTION public.trigger_validate_salt_not_found_temp_users();

CREATE FUNCTION public.trigger_validate_salt_not_found_temp_users()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
declare
	uSalt varchar(44);
begin
	select
		into uSalt
		salt
  	FROM public."UserVerificationCodes"
  	WHERE salt = new.salt;
	if (uSalt = new.salt) then
		RAISE unique_violation
	 		USING CONSTRAINT='users_salt_key'
			,MESSAGE='salt must be unique'
			,COLUMN='salt'
			,detail='Key (salt)=(' || new.salt ||') already exists'
			,TABLE='Users'
			,SCHEMA='public';
  	else
		return new;
  	end if;
end
$BODY$;

ALTER FUNCTION public.trigger_validate_salt_not_found_temp_users()
    OWNER TO postgres;
