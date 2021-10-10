-- FUNCTION: private.GetUpdatedCronJobs()

-- DROP FUNCTION private."GetUpdatedCronJobs"();

CREATE OR REPLACE FUNCTION private."GetUpdatedCronJobs"(
	)
    RETURNS TABLE("lastRun" timestamp without time zone, "jobEnabled" boolean, "jobId" integer, "jobUpdatedAt" timestamp without time zone, "stepId" integer, "scriptPath" character varying, arguments character varying, timeout integer, "stepEnabled" boolean, "stepUpdatedAt" timestamp without time zone, "RunAsContainer" boolean, minute character varying, hour character varying, "Month" character varying, "DayOfMonth" character varying, "DayOfWeek" character varying, "scheduleUpdatedAt" timestamp without time zone) 
    LANGUAGE 'sql'

    COST 100
    VOLATILE 
    ROWS 1000
    
AS $BODY$
select 
		cj."lastRun",
		r.*
    from private."CronJobControl" cj
    join
    (
        select
            s."Enabled" as "jobEnabled",
            s."id" as "jobId",
            s."jobUpdatedAt",
			js."id" as "stepId",
            js."scriptPath",
            js."arguments",
			js."timeout",
            js."enabled" as "stepEnabled",
            js."updatedAt" as "stepUpdatedAt",
			case 
				when cc."id" is null
					then False
				else
					True
			end as "RunAsContainer",
			cs."minute",
			cs."hour",
			cs."Month",
			cs."DayOfMonth",
			cs."DayOfWeek",
			cs."updatedAt" as "scheduleUpdatedAt"
        from private."ScheduledJobs" s
        join private."JobSteps" js on s."id" = js."jobId"
		join private."CronJobSchedule" cs on cs."stepId" = js."id"
		left join private."JobContainerControl" cc on cc."id" = js."ContainerControlId"
    ) r on r."jobUpdatedAt" > cj."lastRun" or r."stepUpdatedAt" > cj."lastRun" or r."scheduleUpdatedAt" > cj."lastRun"
    where cj."id" = 1
$BODY$;

ALTER FUNCTION private."GetUpdatedCronJobs"()
    OWNER TO postgres;
