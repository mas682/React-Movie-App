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

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes


def redisListener(queue):
    params = config()
    r = redis.Redis(**params)
    p = r.pubsub()

    p.subscribe("__keyevent@0__:expired")

    print("Sleeping")
    time.sleep(45)
    print("awake")

    while True:
        message = p.get_message()
        if message:
            print(message)
        time.sleep(0.001)


def redisListener(connection, parent_conn):
    try:
        params = config(section="redis")
        r = redis.Redis(**params)
        p = r.pubsub()
        p.subscribe("__keyevent@0__:expired")

        counter = 0
        while True:
            message = p.get_message()
            if message:
                # send the message to the other process...
                print(message)
                if(counter > 0):
                    connection.send(message)
                else:
                    counter = 1
            time.sleep(0.001)
    except:
        print("An error occurred in the sender process:")
        traceback.print_exc()
        result = traceback.format_exc()
        parent_conn.send(result)
    print("Sender finished...")


def receiver(connection, parent_conn):
    try:
        db = Database(config())
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
                    print("Message in receiver: " + str(message))
                    # need to ignore messages that say subscribe or unsubscribe...
                    key = message["data"].decode()
                    if(len(key) > 5):
                        key = key[5:]
                        cursor.execute("""
                            DELETE FROM public."UserSessions"
                            WHERE session = '""" + key + """'
                        """)
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
        print("An error occurred in the receiver process:")
        traceback.print_exc()
        result = traceback.format_exc()
        parent_conn.send(result)

    print("Receiver finished")


# function to make sure processes still running and that the job itself should still be running
def checkStatus(recv_proc, sender_proc, logger, extras):
    enabled = True
    if(not recv_proc.is_alive()):
        logger.info("The receiver process shut off with the following exit code: " + str(recv_proc.exitcode), extra=extras)
        enabled =  False
    if(not sender_proc.is_alive()):
        logger.info("The sender process shut off with the following exit code: " + str(sender_proc.exitcode), extra=extras)
        enabled =  False
    # make a call to database to see if this job is still turned on
    return enabled


# function to log any output from child processes when a error occurs
def checkProcessOutput(pipe, logger, extras, processExtras, defaultMessage):
    exitLoop = False
    # get any error output from child processes
    dataFound = pipe.poll(timeout=2)
    if(dataFound):
        logger.info(defaultMessage, extra=extras)
        exitLoop = True
    while dataFound:
        message = ""
        if(dataFound):
            message = pipe.recv()
        if(message):
            logger.info("\n" + message, extra=processExtras)
        dataFound = pipe.poll(timeout=2)

    return exitLoop



def main(logger, db, extras, jobId, jobDetailsId):
    # pipe between two child processes
    recv_conn, sender_conn = Pipe(False)
    # pipe between parent and sender child process
    parent_sender_conn, sender_parent_conn = Pipe()
    # pipe between parent and receiver process
    parent_recv_conn, recv_parent_conn = Pipe()

    # create the sender process
    # daemon = True so that the parent process will terminate it if it is terminated
    sender_proc = Process(target=redisListener, args=(sender_conn, sender_parent_conn), name="redisListener", daemon=True)
    # create the receiver process
    recv_proc = Process(target=receiver, args=(recv_conn,recv_parent_conn), daemon=True)
    sender_proc.start()
    recv_proc.start()

    exitLoop = False
    message = ""
    enabled = True
    error = False
    senderExtras = {"caller":"redisListener"}
    receiverExtras = {"caller":"Receiver"}
    # loop to check the state of everything every so often
    while not exitLoop:
        # make sure processes are running
        if(not checkStatus(recv_proc, sender_proc, logger, extras)):
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
        defaultMessage = "An error message was received from the process receiving data from redis:"
        result = checkProcessOutput(parent_sender_conn, logger, extras, senderExtras, defaultMessage)
        if(result):
            exitLoop = True
            error = True

        # get any error output from the database updating process
        defaultMessage = "An error message was received from the process that updates the database:"
        result = checkProcessOutput(parent_recv_conn, logger, extras, receiverExtras, defaultMessage)
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
                if(sender_proc.is_alive()):
                    sender_proc.join(timeout=60)
            except:
                print("Error caught")

    time.sleep(1)

    print("Main loop finished")
    if(recv_proc.is_alive()):
        print("Terminating receiver process")
        recv_proc.kill()
        # give the process time to be killed
        time.sleep(2)
        # if none, the process has yet to finish
        # if a negative value, terminated by some signal
        print(str(recv_proc.is_alive()))
        print(str(recv_proc.exitcode))

    if(sender_proc.is_alive()):
        print("Terminating sender process")
        sender_proc.kill()
        # give the process time to be killed
        time.sleep(2)
        # if none, the process has yet to finish
        # if a negative value, terminated by some signal
        print(str(sender_proc.is_alive()))
        print(str(sender_proc.exitcode))

    if(error):
        return "Finished Unsuccessfully"
    else:
        return "Finished Successfully"


if __name__ == '__main__':
    logpath = os.path.dirname(os.path.realpath(__file__))
    filename = os.path.basename(__file__)
    logFile = filename.replace("py", "log")
    fullLogPath = logpath + "\\" + logFile
    lockFileName = filename + ".loc"
    lockFilePath = logpath + "\\" + lockFileName
    lockExists = False
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

    logging.basicConfig(filename=fullLogPath, filemode='a', level=logging.INFO,
    format='%(levelname)s: %(asctime)s.%(msecs)03d | %(caller)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S')
    # added to log message to indicate which process wrote this
    extras = {"caller":"Controller"}
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
    if(result == "Finished Successfully" and not failed and not jobStartError and not lockedError):
        # remove lock file
        try:
            os.remove(lockFilePath)
        except:
            logger.info("Failed to remove lock file", extra=extras)

    # if the job was marked as started
    if(not jobStartError):
        print(result)
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
