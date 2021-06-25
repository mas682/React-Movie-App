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
    fullLogPath = logpath + "\\" + logFile
    lockFileName = filename + ".loc"
    lockFilePath = logpath + "\\" + lockFileName
    lockExists = False
    # select the job id
    jobId = 2
    # used if a fatal error occurred
    failed = False
    # used if loc file existed
    lockedError = False
    # used if job not enabled or could not be found
    jobStartError = False
    startTime = datetime.now()
    result = ""
    print("\nScript starting at: " + str(startTime))

    # config logging as needed
    logging.basicConfig(filename=fullLogPath, filemode='a', level=logging.INFO,
    format='%(levelname)s: %(asctime)s.%(msecs)03d | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S')
    # added to log message to indicate which process wrote this
    extras = {}
    logger = logging.getLogger()

    # connect to the database
    db = Database(config())
    result = Utils.connectToDatabase(db, logger, extras)
    if(not result["created"]): exit(1)

    # start the job
    jobDetailsId = Utils.startJob(db, logger, jobId, extras)
    if(jobDetailsId < -1):
        failed = True
        jobStartError = True
    elif(jobDetailsId == -1):
        # job not enabled
        jobStartError = True

    # if the job was marked as started
    if(not jobStartError):
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
    if(not jobStartError and not lockedError):
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
    if(result == "Finished Successfully" and not failed and not jobStartError and not lockedError):
        # remove lock file
        try:
            os.remove(lockFilePath)
            #print("Not removing")
        except:
            logger.info("Failed to remove lock file", extra=extras)

    # if the job was marked as started
    if(not jobStartError):
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
