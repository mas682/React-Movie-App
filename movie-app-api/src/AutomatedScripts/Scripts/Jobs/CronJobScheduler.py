
from crontab import CronTab


def createJob():
    print("TEST")


def removeJob():
    print("TEST")


def updateJob():
    print("Test")




def main(logger, db, extras, jobId, jobDetailsId):


    left off making query to get updated jobs...

    select cj."lastRun", r.*
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
            js."updatedAt" as "stepUpdatedAt"
        from public."ScheduledJobs" s
        join public."JobSteps" js on s."id" = js."jobId"
    ) r on r."jobUpdatedAt" > cj."lastRun" or r."stepUpdatedAt" > cj."lastRun"
    where cj."id" = 1

    will need to send a update to CronJobControl regarless of if records 
    returned or not to update last run...
    # need to set environment variables in cronjob somewhere...
    # may just make a script that does it once

    # steps:
        # 1. call to get all the jobs that have been updated since last run
            # may need a control table to know when this last ran....
        # 2. disable jobs that should no longer be enabled
        # 3. enable jobs that should now be enabled

    sample:
    * * * * 5 cd /home/react-movie-app/movie-app-api/src; timeout 10 /usr/bin/python3 -m AutomatedScripts.Scripts.ScriptController -path AutomatedScripts.Scripts.Jobs.JobScheduler -jobId 3 -stepId 11 >> /tmp/listener.log 2>&1
