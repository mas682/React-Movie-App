

import os
from datetime import datetime


def connectToDatabase(db, logger, extras={}):
    result = db.connect()
    # if the connection failed
    if(result["connection"] is None or result["cur"] is None or len(result["failedOutput"]) > 0):
        print("Connection to database failed...")
        logger.info("Failed to establish connection to database when starting script", extra={"caller": "Controller"})
        for line in result["failedOutput"]:
            logger.info(line, extra={"caller": "Controller"})
        disconnectFromDatabase(db, logger, extras)
        return {"created":False}
    return {"connection":result["connection"], "cur":result["cur"], "created": True}

def disconnectFromDatabase(db, logger, extras={}):
    result = db.disconnect()
    if(len(result["failedOutput"]) > 0):
        print("Disconnecting from database failed...")
        logger.info("Failed to disconnect connection to database", extra=extras)
        for line in result["failedOutput"]:
            logger.info(line, extra=extras)
        return False
    return True

def startJob(db, logger, jobId, extras={}):
    result = db.startJob(jobId)
    if(len(result["failedOutput"]) > 0):
        print("Failed to start job")
        logger.info("Failed to start the job with the following error(s):", extra=extras)
        for line in result["failedOutput"]:
            logger.info(line, extra=extras)
        return -1
    elif(result["jobDetailsId"] == -1):
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
    result = db.stopJob(jobDetailsId, state)
    if(len(result["failedOutput"]) > 0):
        logger.info("Failed to mark job with the job details id of(" + str(jobDetailsId) + " as finished)", extra=extras)
        for line in result["failedOutput"]:
            logger.info(line, extra=extras)
        result = db.disconnect()
        if(len(result["failedOutput"]) > 0):
            logger.info("Failed to disconnect from the database)", extra=extras)
            for line in result["failedOutput"]:
                logger.info(line, extra=extras)
        return False
    return True
