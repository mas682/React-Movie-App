import os
import logging
from datetime import datetime
import sys
import traceback
import argparse

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
args = parser.parse_args()

mainFunction = importlib.import_module(args.path)

if __name__ == '__main__':
    pathFiles = (args.path).split(".")
    partOfPath = False
    filePath = os.path.dirname(os.path.realpath(__file__))
    for f in pathFiles:
        if(partOfPath):
            filePath = filePath + "/" + f
        if(f == "Scripts"):
            partOfPath = True
    # verify the file exists
    if(not os.path.exists(filePath + ".py")):
        raise Exception("Could not find the file: " + filePath + ".py")
    fullLogPath = filePath + ".log"
    lockFilePath = filePath + ".py.loc"
    lockExists = False
    # select the job id
    jobId = args.jobId
    stepId = args.stepId
    # used if a fatal error occurred
    failed = False
    # used if loc file existed
    lockedError = False
    # used if job not enabled or could not be found
    jobEnabled = False
    # used to tell if logging in DB was started for job
    jobLogError = False
    startTime = datetime.now()
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
    db = Database(config(environment), "process name")
    connectionResult = Utils.connectToDatabase(db, logger, extras)
    if(not connectionResult["created"]): exit(1)

    # start the job
    jobStartResult = Utils.startJob(db, logger, jobId, stepId, extras)
    jobDetailsId = jobStartResult["jobDetailsId"]
    jobEnabled = jobStartResult["enabled"]
    if(jobDetailsId < 0):
        failed = True
        jobLogError = True
    elif(not jobEnabled):
        result = "Finished - Not Enabled"

    # if the job was marked as started
    if(not jobLogError and jobEnabled):
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

    # if the job was marked as started and the file is locked to this process
    if(not jobLogError and jobEnabled and not lockedError):
        try:
            print("******************************** Main Script ********************************************")
            # should return Finished Successfully on success
            result = mainFunction.main(logger, db, extras, jobId, jobDetailsId)
        except:
            print("Some error occurred in the main script")
            traceback.print_exc()
            logger.info("An unexpected error occurred in the main script:", exc_info=sys.exc_info(), extra=extras)
            result = "Finished Unsuccessfully"
            failed  = True
        print("***************************** Main Script Finished **************************************")

    # clean up
    if(result == "Finished Successfully" and not jobLogError and jobEnabled and not lockedError):
        # remove lock file
        try:
            os.remove(lockFilePath)
            #print("Not removing")
        except:
            logger.info("Failed to remove lock file", extra=extras)

    # if logging was started for the job
    if(not jobLogError):
        result = Utils.stopJob(db, logger, jobDetailsId, result, extras)
        if(not result): failed = True

    result = Utils.disconnectFromDatabase(db, logger, extras)
    if(not result): failed = True

    endTime = datetime.now()
    Utils.getTimeDifference(startTime, endTime)

    if(failed):
        exit(1)
    else:
        exit()
