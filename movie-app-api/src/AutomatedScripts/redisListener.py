# pip install redis is needed...


import redis
import time
from multiprocessing import Process, Pipe
import logging
import os

from config import config


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
def checkStatus(recv_proc, sender_proc):
    if(not recv_proc.is_alive()):
        return False
    if(not sender_proc.is_alive()):
        print(str(sender_proc.exitcode))
        return False
    # make a call to database to see if this job is still turned on
    return True



if __name__ == '__main__':
    logpath = os.path.dirname(os.path.realpath(__file__))
    filename = os.path.basename(__file__)
    logFile = filename.replace("py", "log")
    fullLogPath = logpath + "\\" + logFile

    logging.basicConfig(filename=fullLogPath, filemode='a', level=logging.INFO,
    format='%(levelname)s: %(asctime)s.%(msecs)03d | %(caller)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S')
    logger = logging.getLogger()
    logger.info("TEST", extra={"caller": "Controller"})
    logger.info("Test2", extra={"caller": "Sender"})

    recv_conn, sender_conn = Pipe(False)
    # pipe between
    parent_sender_conn, sender_parent_conn = Pipe()
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
    # loop to check the state of everything every so often
    while counter < 5:
        print("Counter: " + str(counter))
        # want to log when the processes started
        # and when they processes shut off and why
        if(not checkStatus(recv_proc, sender_proc)):
            exitLoop = True
        # this can cause a lockout if the sender died...
        #if(sender_proc.is_alive()):
        print("Receiver is alive: " + str(recv_proc.is_alive()))
        print("Sender is alive: " + str(sender_proc.is_alive()))
        # need to call this instead of recv as recv will block until data is found...
        dataFound = parent_sender_conn.poll(timeout=1)
        while dataFound:
            message = ""
            if(dataFound):
                message = parent_sender_conn.recv()
            if(message):
                print("Message received in controller: " + message)
            dataFound = parent_sender_conn.poll(timeout=1)
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
