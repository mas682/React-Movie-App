-- FUNCTION: public.GetUpdatedCronJobs()

-- DROP FUNCTION public."GetUpdatedCronJobs"();

CREATE OR REPLACE FUNCTION public."GetUpdatedCronJobs"(
	)
    RETURNS TABLE("lastRun" timestamp without time zone, "jobEnabled" boolean, "jobId" integer, "jobUpdatedAt" timestamp without time zone, "scriptPath" character varying, arguments character varying, "stepEnabled" boolean, "stepUpdatedAt" timestamp without time zone, minute character varying, hour character varying, "Month" character varying, "DayOfMonth" character varying, "DayOfWeek" character varying, "scheduleUpdatedAt" timestamp without time zone) 
    LANGUAGE 'sql'

    COST 100
    VOLATILE 
    ROWS 1000
    
AS $BODY$
select 
		cj."lastRun",
		r.*
    from public."CronJobControl" cj
    join
    (
        select
            s."Enabled" as "jobEnabled",
            s."id" as "jobId",
            s."jobUpdatedAt",
            js."scriptPath",
            js."arguments",
            js."enabled" as "stepEnabled",
            js."updatedAt" as "stepUpdatedAt",
			cs."minute",
			cs."hour",
			cs."Month",
			cs."DayOfMonth",
			cs."DayOfWeek",
			cs."updatedAt" as "scheduleUpdatedAt"
        from public."ScheduledJobs" s
        join public."JobSteps" js on s."id" = js."jobId"
		join public."CronJobSchedule" cs on cs."stepId" = js."id"
    ) r on r."jobUpdatedAt" > cj."lastRun" or r."stepUpdatedAt" > cj."lastRun" or r."scheduleUpdatedAt" > cj."lastRun"
    where cj."id" = 1
$BODY$;

ALTER FUNCTION public."GetUpdatedCronJobs"()
    OWNER TO postgres;
