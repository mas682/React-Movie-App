import os
import logging
from datetime import datetime
import sys
import traceback

# my imports
from config import config
from Database import Database
import Utils


if __name__ == '__main__':
    logpath = os.path.dirname(os.path.realpath(__file__))
    filename = os.path.basename(__file__)
    logFile = filename.replace("py", "log")
    fullLogPath = logpath + "/" + logFile
    lockFileName = filename + ".loc"
    lockFilePath = logpath + "/" + lockFileName
    lockExists = False
    # select the job id
    # for now, each job only has one step but could have more than one step in future
    jobId = 1
    stepId = 3
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

    # connect to the database
    db = Database(config(), process name)
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



            # this should be returned by the main function
            result = "Finished Successfully"
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
            #os.remove(lockFilePath)
            print("Not removing")
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
