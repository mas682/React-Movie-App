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


def sender(connection, parent_conn):
    # the sender will be the redisListener
    # if some error occurs, need to shut this process and the other one off...
    messages = ["1", "2", "3", "end"]
    counter = 0
    for value in messages:
        print("Message sent: " + value)
        connection.send(value)
        time.sleep(2)
        try:
            raise Exception("Error test")
        except(Exception) as error:
            parent_conn.send(str(error))
            #print("Caught")
            #print(str(error))
    print("Sender finished...")


def receiver(connection, parent_conn):
    message = ""
    counter = 0
    while True:
        if counter == 0:
            time.sleep(6)
        message = connection.recv()
        print("Message received: " + message)
        if(message == "end"):
            break
        counter = 1
    print("Receiver finished")


# function to make sure processes still running and that the job itself should still be running
def checkStatus(recv_proc, sender_proc, logger, extras):
    enabled = True
    if(not recv_proc.is_alive()):
        logger.info("The receiver process shut off with the following exit code: " + recv_proc.exitcode, exc_info=sys.exc_info(), extra=extras)
        enabled =  False
    if(not sender_proc.is_alive()):
        logger.info("The receiver process shut off with the following exit code: " + sender_proc.exitcode, exc_info=sys.exc_info(), extra=extras)
        enabled =  False
    # make a call to database to see if this job is still turned on
    return enabled



def main(logger, db, extras, jobId):
    enabled = Utils.getJobEnabled(db, logger, jobId, extras)
    if(enabled["error"]):
        print("An error occurred when trying to determine if the job is enabled")
        # stop the process...
        # mark job as failed
    elif(not enabled["enabled"]):
        print("The job is not enabled")
        # stop the process
        # mark the job as finished successfully
    else:
        print("Job is enabled")

    # pipe between two child processes
    recv_conn, sender_conn = Pipe(False)
    # pipe between parent and sender child process
    parent_sender_conn, sender_parent_conn = Pipe()
    # pipe between parent and receiver process
    parent_recv_conn, recv_parent_conn = Pipe()

    # create the sender process
    # daemon = True so that the parent process will terminate it if it is terminated
    sender_proc = Process(target=sender, args=(sender_conn, sender_parent_conn), name="sender", daemon=True)
    # create the receiver process
    recv_proc = Process(target=receiver, args=(recv_conn,recv_parent_conn), daemon=True)
    sender_proc.start()
    recv_proc.start()
    counter = 0

    exitLoop = False
    message = ""
    enabled = True
    error = False
    # loop to check the state of everything every so often
    while counter < 5:
        print("Counter: " + str(counter))
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
        else:
            # for testing
            print("Job is enabled")

        # get any error output from child processes
        # need to call this instead of recv as recv will block until data is found...
        dataFound = parent_sender_conn.poll(timeout=1)
        while dataFound:
            message = ""
            if(dataFound):
                message = parent_sender_conn.recv()
            if(message):
                print("Message received in controller from sender process: " + message)
            dataFound = parent_sender_conn.poll(timeout=1)

        # get any error output from child processes
        # need to call this instead of recv as recv will block until data is found...
        dataFound = parent_recv_conn.poll(timeout=1)
        while dataFound:
            message = ""
            if(dataFound):
                message = parent_recv_conn.recv()
            if(message):
                print("Message received in controller from receiver process: " + message)
            dataFound = parent_recv_conn.poll(timeout=1)


        if(exitLoop):
            break
        counter += 1
        if(not exitLoop):
            try:
                if(sender_proc.is_alive()):
                    sender_proc.join(timeout=4)
            except:
                print("Error caught")

    time.sleep(1)

    print("Main loop finished")
    if(recv_proc.is_alive()):
        print("Terminating process")
        recv_proc.kill()
        # give the process time to be killed
        time.sleep(2)
        # if none, the process has yet to finish
        # if a negative value, terminated by some signal
        print(str(recv_proc.is_alive()))
        print(str(recv_proc.exitcode))

    if(sender_proc.is_alive()):
        print("Terminating process")
        sender_proc.kill()
        # give the process time to be killed
        time.sleep(2)
        # if none, the process has yet to finish
        # if a negative value, terminated by some signal
        print(str(sender_proc.is_alive()))
        print(str(sender_proc.exitcode))

    # remove the loc file
    #os.remove(lockFilePath)


#next steps...
#then fix all the redis stuff..


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
            main(logger, db, extras, jobId)


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
