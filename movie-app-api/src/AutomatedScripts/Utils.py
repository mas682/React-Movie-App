

import os
from datetime import datetime
import sys
import traceback


def connectToDatabase(db, logger, extras={}):
    result = None
    try:
        result = db.connect()
    except:
        traceback.print_exc()
        logger.info("An error occurred when connecting to the database:", exc_info=sys.exc_info(), extra=extras)
        return {"created":False}
    # if the connection failed
    if(result["connection"] is None or result["cur"] is None):
        print("Connection to database failed...")
        logger.info("Failed to establish connection to database when starting script", extra={"caller": "Controller"})
        disconnectFromDatabase(db, logger, extras)
        return {"created":False}
    return {"connection":result["connection"], "cur":result["cur"], "created": True}

def disconnectFromDatabase(db, logger, extras={}):
    try:
        db.disconnect()
    except:
        traceback.print_exc()
        logger.info("An error occurred when disconnecting from the database:", exc_info=sys.exc_info(), extra=extras)
        return False
    return True

def startJob(db, logger, jobId, extras={}):
    result = None
    try:
        result = db.startJob(jobId)
    except:
        traceback.print_exc()
        logger.info("An error occurred when attempting to start the job with the id of: " + str(jobId), exc_info=sys.exc_info(), extra=extras)
        return -1

    if(result["jobDetailsId"] == -1):
        print("Failed to start job with a -1 job details id")
        logger.info("A job details id of -1 was returned when trying to start the job", extra=extras)
        return -1
    elif(not result["enabled"]):
        print("Job is not enabled")
        # may want to log this but for now just exit
        return -1

    return result["jobDetailsId"]


# maxLines is the maximum number of lines in the lock file before it will get cleared
def getLockFile(lockFilePath, maxLines):
    lockExists = False
    if(os.path.exists(lockFilePath)):
        print("Lock exists...")
        lockExists = True
    else:
        print("Lock does not exist")

    with open(lockFilePath, "a+") as lockFile:
        if(not lockExists):
            lockFile.write("Starting controller function at: " + str(datetime.now()) + "\n")
            lockFile.close()
        else:
            lockFile.seek(0)
            count = 0
            for line in lockFile:
                count = count + 1
            print("Lines in lock file:" + str(count))
            if(count >= maxLines):
                print("Lock file being removed as the maximum number of lines has been met: " + str(maxLines))
                lockFile.close()
                os.remove(lockFilePath)
            else:
                lockFile.write("Skipping execution at: " + str(datetime.now()) + " as lock file exists\n")
            lockFile.close()
    return lockExists

def stopJob(db, logger, jobDetailsId, state, extras={}):
    try:
        db.stopJob(jobDetailsId, state)
    except:
        traceback.print_exc()
        logger.info("An error occurred trying mark the job with the job details id(" + jobDetailsId  + ") as finished", exc_info=sys.exc_info(), extra=extras)
        disconnectFromDatabase(db, logger, extras)
        return False
    return True


def getTimeDifference(startTime, endTime):
        totalTime = endTime - startTime
        hours = totalTime.seconds // 3600
        remainingSeconds = totalTime.seconds % 3600
        minutes = remainingSeconds // 60
        seconds = remainingSeconds % 60
        milliseconds = totalTime.microseconds // 1000
        print("\n********************************************************************************`")
        print("Script started at: " + str(startTime))
        print("Script ended at: " + str(endTime))
        print("Script duration:")
        print("Day(s): " + str(totalTime.days))
        print("Hour(s): " + str(hours))
        print("Minute(s): " + str(minutes))
        print("Second(s): " + str(seconds))
        print("Millisecond(s): " + str(milliseconds))
