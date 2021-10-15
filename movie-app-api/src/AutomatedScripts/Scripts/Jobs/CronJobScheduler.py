# 9/19/2021
# Matt Stropkey
# This script is used to update the crontab file to the latest updates
# This sets up the long running jobs that are not ran from containers
# You MUST have the ENVIRONMENT variable set before running this
# example command to run:
# ran from the src folder
# python3 -m AutomatedScripts.Scripts.ManualScriptController -path AutomatedScripts.Scripts.Jobs.CronJobScheduler


from crontab import CronTab
from datetime import datetime, timezone
from AutomatedScripts.shared.config import config
import os

def findExistingJob(cron, jobId):
    iterator = cron.find_comment(jobId)
    jobCount = 0
    job = None

    for j in iterator:
        jobCount = jobCount + 1
        job = j
    
    if(jobCount > 1):
        raise Exception("More than one job exists with the same ID")
    else:
        return job

def removeJob(cron, jobId):
    print("Removing job with id of: " + jobId)
    job = findExistingJob(cron, jobId)
    if(job is None):
        print("The job to remove does not exist\n")
    else:
        job.delete()
        cron.write()
        print("The job has been successfully removed\n")


def updateOrCreateJob(cron, jobId, stepId, runAsContainer, scriptPath, timeout, minute, hour, month, dayOfMonth, dayOfWeek):
    if(not runAsContainer):
        command = "cd /home/react-movie-app/movie-app-api/src; timeout --kill-after=10 " + str(timeout) + " /usr/bin/python3 -m AutomatedScripts.Scripts.ScriptController -path " + scriptPath + " -jobId " + jobId + " -stepId " + stepId
    else:
        command = "cd /home/react-movie-app/movie-app-api/src; timeout --kill-after=10 30 /usr/bin/python3 -m AutomatedScripts.Scripts.Jobs.CronJobContainerStarter -jobId " + jobId + " -stepId " + stepId
    print(command)
    job = findExistingJob(cron, jobId)
    if job is None:
        print("Creating a new job with id of: " + jobId + "\n")
        job = cron.new(command=command, comment=jobId)
    else:
        print("Updating an existing job with id of: " + jobId + "\n")
        job.set_command(command)
        
    job.setall(minute, hour, dayOfMonth, month, dayOfWeek)
    cron.write()
    

def updateJobs(result):
    if(len(result) < 1):
        print("No jobs have been updated since the last run")
        return
    environment = os.getenv('ENVIRONMENT')
    if(environment is None):
        raise Exception("Could not determine what environment the script is running on")
    container = os.getenv('CONTAINER')
    if(container is None):
        raise Exception("Could not determine if the script is running in a container or not")

    conf = config(environment, container, 'cron')
    cron = CronTab(user=conf['user'])
    for job in result:
        lastRunTS = job[0]
        jobEnabled = job[1]
        jobId = str(job[2])
        jobUpdatedAt = job[3]
        stepId = str(job[4])
        scriptPath = job[5]
        arguments = job[6] if job[6] is not None else ""
        timeout = job[7] if job[7] is not None else 0
        stepEnabled = job[8]
        stepUpdatedAt = job[9]
        runAsContainer = job[10]
        minute = job[11] if job[11] is not None else "*"
        hour = job[12] if job[12] is not None else "*"
        month = job[13] if job[13] is not None else "*"
        dayOfMonth = job[14] if job[14] is not None else "*"
        dayOfWeek = job[15] if job[15] is not None else "*"
        scheduleUpdatedAt = job[16]

        print("Job details:")
        print("\tLast Run: " + str(lastRunTS))
        print("\tJob enabled: " + str(jobEnabled))
        print("\tJob ID: " + jobId)
        print("\tJob updated at: " + str(jobUpdatedAt))
        print("\tStep ID: " + stepId)
        print("\tScript path: " + scriptPath)
        print("\tArguments: " + str(arguments))
        print("\tTimeout: " + str(timeout))
        print("\tStep enabled: " + str(stepEnabled))
        print("\tStep Updated At: " + str(stepUpdatedAt))
        print("\tRun as container: " + str(runAsContainer))
        print("\tMinute: " + minute)
        print("\tHour: " + hour)
        print("\tMonth: " + month)
        print("\tDay of Month: " + dayOfMonth)
        print("\tDay of Week: " + dayOfWeek)
        print("\tSchedule updated at: " + str(scheduleUpdatedAt))

        if(not jobEnabled or not stepEnabled):
            removeJob(cron, jobId)
        else:
            updateOrCreateJob(cron, jobId, stepId, runAsContainer, scriptPath, timeout, minute, hour, month, dayOfMonth, dayOfWeek)

def main(logger, db, extras, jobId, jobDetailsId, arguments):
    print("Getting the updated cron jobs...")
    script = """
        select * from private."GetUpdatedCronJobs"()
    """
    print("Executing query: " + script)
    # set to utc to match db
    lastRun = datetime.now(timezone.utc)
    lastRun = lastRun.strftime("%Y-%m-%d %H:%M:%S.%f")
    db._cur.execute(script)
    result = db._cur.fetchall()
    updateJobs(result)

    print("Updating cron job control table...")
    script = """
        update private."CronJobControl"
            set "lastRun" = '""" + lastRun + """'
        where "id" = 1
    """
    print("Executing query: " + script)
    db._cur.execute(script)

    return "Finished Successfully"

    #sample:
    #* * * * 5 cd /home/react-movie-app/movie-app-api/src; timeout 10 /usr/bin/python3 -m AutomatedScripts.Scripts.ScriptController -path AutomatedScripts.Scripts.Jobs.JobScheduler -jobId 3 -stepId 11 >> /tmp/listener.log 2>&1
