# 8/31/2021
# Matt Stropkey
# This script is used to run the jobs
# It does various checks to ensure the job should run and then runs it
# command to run(will have to change jobId and stepId):
# ran from the src folder
# example command:
# python3 -m AutomatedScripts.Scripts.ScriptController -path AutomatedScripts.Scripts.Jobs.EngineControl -jobId 1 -stepId 3


import os
import logging
from datetime import datetime
import sys
import traceback
import argparse
import signal
import ast
import importlib
# my imports
from AutomatedScripts.shared.config import config
from AutomatedScripts.shared.Database import Database
from AutomatedScripts.shared import Utils

# pass in path to the module to use
# ex. AutomatedScripts.Scripts.Jobs.Test
# jobId = 1, stepId = 3
parser = argparse.ArgumentParser()
parser.add_argument("-path", action="store", dest="path", required=True, help="Path to module to run")
parser.add_argument("-jobId", action="store", dest="jobId", required=True, type=int)
parser.add_argument("-stepId", action="store", dest="stepId", required=True, type=int)
parser.add_argument("-jobDetailsId", action="store", dest="jobDetailsId", required=False, type=int)
args = parser.parse_args()


# used to do cleanup when a timeout occurs
def signalHandler(sig, frame):
    global timeout
    # if timeout occurred while still running main function
    if(jobInProgress):
        timeout = True
        raise Exception("Timeout occurred")

    # if not None, at least tried to mark job as started
    if(jobLogError is not None and not jobLogError):
        Utils.stopJob(db, logger, jobDetailsId, "Finished - Timeout", extras)

    # if db is not none, try to disconnect
    if(db is not None):
        Utils.disconnectFromDatabase(db, logger, extras)

    endTime = datetime.now()
    Utils.getTimeDifference(startTime, endTime)

    # clean up if the lock file was created
    if(jobLogError is not None and not jobLogError and lockedError is not None and not lockedError):
        # remove lock file
        try:
            os.remove(lockFilePath)
            #print("Not removing")
        except:
            logger.info("Failed to remove lock file", extra=extras)
    exit(1)

if __name__ == '__main__':
    # used for catch block if timeout occurred
    timeout = False
    # used for signalHandler to determine if main script still running
    jobInProgress = False
    # used to tell if logging in DB was started for job
    jobLogError = None
    db = None
    # used if loc file existed
    lockedError = None
    startTime = datetime.now()
    signal.signal(signal.SIGTERM, signalHandler)
    pathFiles = (args.path).split(".")
    partOfPath = False
    filePath = os.path.dirname(os.path.realpath(__file__))
    for f in pathFiles:
        if(partOfPath):
            filePath = filePath + "/" + f
        if(f == "Scripts"):
            partOfPath = True
    fileName = "ScriptController - Unkown"
    if(len(pathFiles) > 0):
        fileName = pathFiles[len(pathFiles) - 1]
    # verify the file exists
    if(not os.path.exists(filePath + ".py")):
        raise Exception("Could not find the file: " + filePath + ".py")
    fullLogPath = filePath + ".log"
    lockFilePath = filePath + ".py.loc"
    lockExists = False
    # select the job id
    jobId = args.jobId
    stepId = args.stepId
    jobDetailsId = args.jobDetailsId
    # used if a fatal error occurred
    failed = False
    # used if job not enabled or could not be found
    jobEnabled = False
    result = ""
    server = os.getenv('SERVER')
    if(server is None):
        server = "Unknown"
    engine = os.getenv('ENGINE')
    print("\nScript starting at: " + str(startTime))

    # config logging as needed
    logging.basicConfig(filename=fullLogPath, filemode='a', level=logging.INFO,
    format='%(levelname)s: %(asctime)s.%(msecs)03d | %(server)s | %(engine)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S')
    # added to log message to indicate which process wrote this
    extras = {"server": server, "engine": str(engine)}
    logger = logging.getLogger()

    environment = os.getenv('ENVIRONMENT')
    if(environment is None):
        logger.info("Could not determine what environment the script is running on", extra=extras)
        raise Exception("Could not determine what environment the script is running on")

    # connect to the database
    db = Database(config(environment), fileName)
    connectionResult = Utils.connectToDatabase(db, logger, extras)
    if(not connectionResult["created"]): exit(1)

    # start the job
    jobStartResult = None
    # if the job details is already set
    if(jobDetailsId is not None):
        jobStartResult = Utils.updateContainerCronJob(db, logger, jobId, stepId, jobDetailsId, extras)
    else:
        jobStartResult = Utils.startJob(db, logger, jobId, stepId, extras)
    jobDetailsId = jobStartResult["jobDetailsId"]
    jobEnabled = jobStartResult["enabled"]
    scriptPath = jobStartResult["scriptPath"]
    arguments = jobStartResult["arguments"]
    logArguments = jobStartResult["logArguments"]
    # may want to add control of lock file here...
    if(jobDetailsId < 0):
        failed = True
        jobLogError = True
    elif(not jobEnabled):
        jobLogError = False
        result = "Finished - Not Enabled"
    elif(scriptPath is None):
        jobLogError = False
        result = "Finished - Script Undefined"
    else:
        jobLogError = False

    # if additional log arguments are defined for this job
    if logArguments is not None:
        logArgs = ast.literal_eval(logArguments)
        if(type(logArgs) != dict):
            logger.info("The additional arguments to add to the logger are not in the form of a dict", extra=extras)
        else:
            logFormat = '%(levelname)s: %(asctime)s.%(msecs)03d | %(server)s | %(engine)s'
            for key in logArgs:
                value = logArgs[key]
                logFormat = logFormat + ' | %(' + key + ')s'
                extras[key] = value
            logFormat = logFormat + ' | %(message)s'

            logging.basicConfig(force=True,filename=fullLogPath, filemode='a', level=logging.INFO,
            format=logFormat,datefmt='%Y-%m-%d %H:%M:%S')
            logger = logging.getLogger()

    # if the job was marked as started
    if(not jobLogError):
        try:
            lockExists = Utils.getLockFile(lockFilePath, 2)
        except:
            traceback.print_exc()
            logger.info("An error occurred when attempting to obtain the lock file", exc_info=sys.exc_info(), extra=extras)
            lockedError = True
            result = "Finished - Locking Error"
        if(lockExists):
            result = "Finished - Locked"
            lockedError = True
        else:
            lockedError = False
    else:
        lockedError = False

    # if the job was marked as started and the file is locked to this process
    if(not jobLogError and jobEnabled and not lockedError):
        # if at this point, job ready to run so import code
        try:
            print(scriptPath)
            mainFunction = importlib.import_module(scriptPath)
        except:
            print("Failed to import the code for the script to run")
            traceback.print_exc()
            logger.info("An error occurred importing the script to run:", exc_info=sys.exc_info(), extra=extras)
            result = "Finished Unsuccessfully"
        
        scriptArgs = None
        try:
            if(arguments is not None):
                scriptArgs = ast.literal_eval(arguments)
        except:
            print("Failed to parse the arguments to pass to the script to run")
            traceback.print_exc()
            logger.info("An error occurred parsing the arguments for the script to run:", exc_info=sys.exc_info(), extra=extras)
            result = "Finished Unsuccessfully"

        # if code pulled and arguments parsed
        if(not failed):
            try:
                print("******************************** Main Script ********************************************")
                jobInProgress = True
                # should return Finished Successfully on success
                result = mainFunction.main(logger, db, extras, jobId, jobDetailsId, scriptArgs)
                jobInProgress = False
            except:
                print("Some error occurred in the main script")
                traceback.print_exc()
                logger.info("An unexpected error occurred in the main script:", exc_info=sys.exc_info(), extra=extras)
                result = "Finished Unsuccessfully" if(not timeout) else "Finished - Timeout"
                failed  = True
            print("***************************** Main Script Finished **************************************")

    # if logging was started for the job
    if(not jobLogError):
        result = Utils.stopJob(db, logger, jobDetailsId, result, extras)
        if(not result): failed = True

    result = Utils.disconnectFromDatabase(db, logger, extras)
    if(not result): failed = True

    endTime = datetime.now()
    Utils.getTimeDifference(startTime, endTime)

    # clean up
    if(not jobLogError and not lockedError):
        # remove lock file
        try:
            os.remove(lockFilePath)
            #print("Not removing")
        except:
            logger.info("Failed to remove lock file", extra=extras)

    if(failed):
        exit(1)
    else:
        exit()
