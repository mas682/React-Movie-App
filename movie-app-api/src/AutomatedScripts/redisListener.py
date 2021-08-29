# pip install redis is needed...

import redis
import time
from multiprocessing import Process, Pipe
import logging
import os
from datetime import datetime
import sys
import traceback

# my imports
from config import config
from Database import Database
import Utils

def redisListener(connection, parent_conn):
    try:
        params = config(section="redis")
        r = redis.Redis(**params)
        p = r.pubsub()
        p.subscribe("__keyevent@0__:expired")

        while True:
            message = p.get_message()
            if message:
                # send the message to the other process...
                connection.send(message)
            time.sleep(0.001)
    except:
        print("An error occurred in the sender process:")
        traceback.print_exc()
        result = traceback.format_exc()
        parent_conn.send(result)
    print("Sender finished...")


def dataProcessor(connection, parent_conn):
    try:
        db = Database(config(), "RedisListener - Data Processor")
        # need to fix this to handle errors...
        result = db.connect()
        cursor = result["cur"]
        # need to encrypt string passed from other side to get key into database...
        message = ""
        while True:
            dataFound = connection.poll(timeout=1)
            while dataFound:
                message = ""
                if(dataFound):
                    message = connection.recv()
                if(message):
                    print("Message in data processor: " + str(message))
                    if(message["type"] == "message"):
                        # need to ignore messages that say subscribe or unsubscribe...
                        key = message["data"].decode()
                        if(len(key) > 5):
                            key = key[5:]
                            cursor.execute("""
                                DELETE FROM public."UserSessions"
                                WHERE session = '""" + key + """'
                            """)
                            print("Key (" + key + ") removed or did not exist")
                        else:
                            print("Invalid key received: " + key)
                    else:
                        print("Invalid message type received")

                dataFound = connection.poll(timeout=1)
    except:
        print("An error occurred in the receiver process:")
        traceback.print_exc()
        result = traceback.format_exc()
        parent_conn.send(result)

    # try to disconnect from the database
    try:
        db.disconnect()
    except:
        print("An error occurred in the data processor process when disconnecting from the database:")
        traceback.print_exc()
        result = traceback.format_exc()
        parent_conn.send(result)

    print("Receiver finished")


# function to make sure processes still running and that the job itself should still be running
def checkStatus(data_process, redis_process, logger, extras):
    enabled = True
    if(not data_process.is_alive()):
        logger.info("The data processor process shut off with the following exit code: " + str(data_process.exitcode), extra=extras)
        enabled =  False
    if(not redis_process.is_alive()):
        logger.info("The redis listener process shut off with the following exit code: " + str(redis_process.exitcode), extra=extras)
        enabled =  False
    # make a call to database to see if this job is still turned on
    return enabled


# function to log any output from child processes when a error occurs
def checkProcessOutput(pipe, logger, extras, processExtras, defaultMessage):
    exitLoop = False
    # get any error output from child processes
    dataFound = pipe.poll(timeout=1)
    if(dataFound):
        logger.info(defaultMessage, extra=extras)
        exitLoop = True
    while dataFound:
        message = ""
        if(dataFound):
            message = pipe.recv()
        if(message):
            logger.info("\n" + message, extra=processExtras)
        dataFound = pipe.poll(timeout=1)

    return exitLoop

# function to terminate a process
def terminateProcess(process, logger, extras):
    if(process.is_alive()):
        print("Terminating process with name: " + process.name)
        process.kill()
        # give the process time to be killed
        time.sleep(2)
        # if none, the process has yet to finish
        # if a negative value, terminated by some signal
        print("Process is alive: " + str(process.is_alive()))
        print("Process exit code: " + str(process.exitcode))
        if(process.exitcode is None):
            logger.info("The process with name " + process.name + " and pid of " + str(process.pid) + " failed to terminate", extra=extras)
            return False

    return True




def main(logger, db, extras, jobId, jobDetailsId):
    # pipe between two child processes
    processor_conn, redis_conn = Pipe(False)
    # pipe between parent and redis listener child process
    parent_redis_conn, redis_parent_conn = Pipe(False)
    # pipe between parent and data processor process
    parent_processor_conn, processor_parent_conn = Pipe(False)

    # create the sender process
    # daemon = True so that the parent process will terminate it if it is terminated
    redis_process = Process(target=redisListener, args=(redis_conn, redis_parent_conn), name="redisListener", daemon=True)
    # create the receiver process
    data_process = Process(target=dataProcessor, args=(processor_conn,processor_parent_conn), name="dataProcessor", daemon=True)
    redis_process.start()
    data_process.start()

    exitLoop = False
    message = ""
    enabled = True
    error = False
    senderExtras = {"caller":"redisListener"}
    receiverExtras = {"caller":"dataProcessor"}
    # loop to check the state of everything every so often
    while not exitLoop:
        # make sure processes are running
        if(not checkStatus(data_process, redis_process, logger, extras)):
            exitLoop = True
            error = True

        # make sure job is enabled
        enabled = Utils.getJobEnabled(db, logger, jobId, extras)
        if(enabled["error"]):
            print("An error occurred when trying to determine if the job is enabled")
            error = True
            exitLoop = True
            enabled = False
        elif(not enabled["enabled"]):
            # this is not a error
            print("The job is not enabled")
            exitLoop = True
            enabled = False

        # get any error output from the redis listener process
        defaultMessage = "An error message was received from the redis listener process:"
        result = checkProcessOutput(parent_redis_conn, logger, extras, senderExtras, defaultMessage)
        if(result):
            exitLoop = True
            error = True

        # get any error output from the database updating process
        defaultMessage = "An error message was received from data processor process:"
        result = checkProcessOutput(parent_processor_conn, logger, extras, receiverExtras, defaultMessage)
        if(result):
            exitLoop = True
            error = True

        if(exitLoop):
            break
        if(not exitLoop):
            # update database to indicate job still running
            failed = Utils.updateRunningJob(db, logger, jobDetailsId, extras)
            if(failed):
                print("Failed to update dataase indicating job is still running...")
                error = True
                break
            try:
                # check if an error occurred every 5 minutes
                redis_process.join(timeout=300)
            except:
                traceback.print_exc()
                logger.info("An error occurred trying to call join on the redis process", exc_info=sys.exc_info(), extra=extras)
                error = True
                break

    # give the processes time to finish
    time.sleep(1)

    print("Main loop finished\n")
    result = terminateProcess(data_process, logger, extras)
    if(not result): error = True

    result = terminateProcess(redis_process, logger, extras)
    if(not result): error = True

    if(error):
        return "Finished Unsuccessfully"
    else:
        return "Finished Successfully"


if __name__ == '__main__':
    logpath = os.path.dirname(os.path.realpath(__file__))
    filename = os.path.basename(__file__)
    logFile = filename.replace("py", "log")
    fullLogPath = logpath + "/" + logFile
    lockFileName = filename + ".loc"
    lockFilePath = logpath + "/" + lockFileName
    lockExists = False
    jobId = 2
    stepId = 
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

    logging.basicConfig(filename=fullLogPath, filemode='a', level=logging.INFO,
    format='%(levelname)s: %(asctime)s.%(msecs)03d | %(server)s | %(engine)s | %(caller)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S')
    # added to log message to indicate which process wrote this
    extras = {"server": server, "engine": str(engine), "caller":"Controller"}
    logger = logging.getLogger()

    # connect to the database
    db = Database(config(), "RedisListener")
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
            #main(logger, db, extras, jobId)


            # this should be returned by the main function
            result = main(logger, db, extras, jobId, jobDetailsId)
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
