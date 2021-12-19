# 10/7/2021
# Matt Stropkey
# This script is used to run the cron jobs that are supposed to be ran in a container
# example command to run:
# ran from the src folder
# python3 -m AutomatedScripts.Scripts.Jobs.CronJobContainerStarter -jobId 1 -stepId 1

import docker
import argparse
import os
import logging
import sys
import traceback

from AutomatedScripts.shared.config import config
from AutomatedScripts.shared.Database import Database
from AutomatedScripts.shared import Utils
from AutomatedScripts.shared import DockerUtils


parser = argparse.ArgumentParser()
parser.add_argument("-jobId", action="store", dest="jobId", required=True, type=int)
parser.add_argument("-stepId", action="store", dest="stepId", required=True, type=int)
args = parser.parse_args()


def getCronJob(db, jobId, stepId, logger, extras):
    print("Getting cron job to start for job id: " + str(jobId) + " with step id: " + str(stepId))
    script = """
        select 
            null as "JobQueueId",
            s."id" as "jobId",
            js."id" as "stepId",
            js."type",
            js."timeout",
            js."arguments",
            js."scriptPath",
            cc."image_name",
            cc."container_name",
            cc."memory_limit",
            cc."cpus_to_run_on",
            cc."cpu_shares",
            cc."cpu_period",
            cc."cpu_quota",
            cc."mem_reservation",
            cc."auto_remove",
            cc."pids_limit",
            cc."network_name"
        from private."ScheduledJobs" s
        join private."JobSteps" js on js."jobId" = s."id" and js."id" = """ + str(jobId) + """ and js."jobId" = """ + str(stepId) + """
        join private."JobContainerControl" cc on cc."id" = js."ContainerControlId"
    """
    print("Executing query: " + script)
    db.executeQuery(script, "select statement that caused the error:", logger, extras)
    result = db._cur.fetchall()
    return result

if __name__ == '__main__':
    jobId = args.jobId
    stepId = args.stepId
    server = os.getenv('SERVER')
    if(server is None):
        server = "Unknown"
    
    # get the file path for logging
    filePath = os.path.realpath(__file__)
    fullLogPath = filePath.replace(".py", ".log")
    fileName = "CronJobContainerStarter - " + server

    # config logging as needed
    logging.basicConfig(filename=fullLogPath, filemode='a', level=logging.INFO,
    format='%(levelname)s: %(asctime)s.%(msecs)03d | %(server)s | jobID: %(jobId)s | stepID: %(stepId)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S')
    # added to log message to indicate which process wrote this
    extras = {"server": server, "jobId": jobId, "stepId": stepId}
    logger = logging.getLogger()

    environment = os.getenv('ENVIRONMENT')
    if(environment is None):
        logger.info("Could not determine what environment the script is running on", extra=extras)
        raise Exception("Could not determine what environment the script is running on")
    
    container = os.getenv('CONTAINER')
    if(container is None):
        logger.info("Could not determine what if the script is running on a container or not based off the environment variable", extra=extras)
        raise Exception("Could not determine if the script is running in a container or not")

    creds = None
    if(container == "TRUE"):
        # get the host name
        creds = config(environment, "postgresql-container")
        # get other postgres config values
        creds.update(config(environment, "postgresql"))
    elif(container == "FALSE"):
        # get the host name
        creds = config(environment, "postgresql-external")
        # get other postgres config values
        creds.update(config(environment, "postgresql"))
    else:
        raise Exception("Could not determine if the script is running in a container or not")


    # connect to the database
    db = Database(creds, fileName)
    connectionResult = Utils.connectToDatabase(db, logger, extras)
    if(not connectionResult["created"]): exit(1)

    error = False
    # mark the job as starting...
    jobStartResult = Utils.startContainerCronJob(db, logger, jobId, stepId, extras)
    jobDetailsId = jobStartResult["jobDetailsId"]
    if(jobDetailsId < 0):
        error = True

    error = False
    # if the job was marked as starting...
    if(not error):
        try:
            dockerCli = docker.from_env()
            # get the job details...
            result = getCronJob(db, stepId, jobId, logger, extras)
            if(len(result) < 1):
                raise Exception("Could not find an existing job matching the given job id and step id")
            else:
                # start the docker container for the job
                print("Job details id: " + str(jobDetailsId))
                DockerUtils.startDockerContainer(dockerCli, result, None, environment, jobDetailsId)
        except:
            traceback.print_exc()
            logger.info("An unexpected error occurred trying to run the job:", exc_info=sys.exc_info(), extra=extras)
            error = True
        
        # if the container did not start
        if(error):
            Utils.stopJob(db, logger, jobDetailsId, "Finished - Container Failure", extras)
    
    # disconnect from database 
    Utils.disconnectFromDatabase(db, logger, extras)

    if(error):
        exit(1)
    else:
        exit()
