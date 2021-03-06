CREATE OR REPLACE FUNCTION public.trigger_validate_user_not_found()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    VOLATILE
    COST 100
AS $BODY$
begin
  if exists(select true FROM public.users WHERE username = new.username or email = new."userEmail") then
	 RAISE unique_violation
	 	USING CONSTRAINT='UserVerificationCodes_username_key'
		,MESSAGE='username must be unique'
		,COLUMN='username'
		,detail='Key (username)=(' || new.username ||') already exists'
		,TABLE='UserVerificationCodes'
		,SCHEMA='public';
	 return null;
  else
	return new;
  end if;
end
$BODY$;
