# 9/18/2021
# Matt Stropkey
# This script is used to manually run python jobs that will normally be automated
# If you need to pass additional arguments to the script to run, you will need to create a custom version of this
# example command to run:
# ran from the src folder
# python3 -m AutomatedScripts.Scripts.ManualScriptController -path AutomatedScripts.Scripts.Jobs.ScriptNameToRun
# to run with a timeout use:
# timeout -kill-after=10 seconds-to-timeout python3 -m AutomatedScripts.Scripts.ManualScriptController -path AutomatedScripts.Scripts.Jobs.ScriptNameToRun
# to pass arguments to the script, use -arguments
# can be a dict, string, array, etc.
# array must be in form: "['abc','def']"
# dict must be in form: "['abc','def']"
import os
from datetime import datetime
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
parser = argparse.ArgumentParser()
parser.add_argument("-path", action="store", dest="path", required=True, help="Path to module to run")
parser.add_argument("-arguments", action="store", dest="scriptArgs", required=False, help="Arguments to pass to script to run")
args = parser.parse_args()

mainFunction = importlib.import_module(args.path)

# used to do cleanup when a timeout occurs
def signalHandler(sig, frame):
    global timeout
    # if timeout occurred while still running main function
    if(jobInProgress):
        timeout = True
        raise Exception("Timeout occurred")

    # if db is not none, try to disconnect
    if(db is not None):
        Utils.disconnectFromDatabase(db, None)

    endTime = datetime.now()
    Utils.getTimeDifference(startTime, endTime)

    # clean up if the lock file was created
    if(lockedError is not None and not lockedError):
        # remove lock file
        try:
            os.remove(lockFilePath)
            #print("Not removing")
        except:
            print("Failed to remove lock file")
    exit(1)

if __name__ == '__main__':
    scriptArgs = None
    if(args.scriptArgs is not None):
        scriptArgs = ast.literal_eval(args.scriptArgs)
    # used for catch block if timeout occurred
    timeout = False
    # used for signalHandler to determine if main script still running
    jobInProgress = False
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
    if(len(pathFiles) > 0):
        fileName = pathFiles[len(pathFiles) - 1]
    print(fileName)
    # verify the file exists
    if(not os.path.exists(filePath + ".py")):
        raise Exception("Could not find the file: " + filePath + ".py")
    fullLogPath = filePath + ".log"
    lockFilePath = filePath + ".py.loc"
    lockExists = False

    # used if a fatal error occurred
    failed = False
    result = ""
    server = os.getenv('SERVER')
    if(server is None):
        server = "Unknown"
    engine = os.getenv('ENGINE')
    print("\nScript starting at: " + str(startTime))

    environment = os.getenv('ENVIRONMENT')
    if(environment is None):
        raise Exception("Could not determine what environment the script is running on")
    
    container = os.getenv('CONTAINER')
    if(container is None):
        raise Exception("Could not determine if the script is running in a container or not")

    creds = None
    if(container == "TRUE"):
        # get the host name
        creds = config(environment, "postgresql-container")
        # get other postgres config values
        creds.update(config(environment, "postgresql"))
    elif(container == "FALSE"):
        # get the host name
        creds = config(environment, "postgresql-external")
        # get other postgres config values
        creds.update(config(environment, "postgresql"))
    else:
        raise Exception("Could not determine if the script is running in a container or not")

    # connect to the database
    db = Database(creds, fileName)
    connectionResult = Utils.connectToDatabase(db, None)
    if(not connectionResult["created"]): exit(1)

    # get the lock file
    try:
        lockExists = Utils.getLockFile(lockFilePath, 2)
    except:
        traceback.print_exc()
        print("An error occurred when attempting to obtain the lock file")
        lockedError = True
        result = "Finished - Locking Error"
    if(lockExists):
        result = "Finished - Locked"
        lockedError = True
    else:
        lockedError = False

    # if the file is locked to this process
    if(not lockedError):
        try:
            print("******************************** Main Script ********************************************")
            jobInProgress = True
            # should return Finished Successfully on success
            result = mainFunction.main(None, db, None, None, None, scriptArgs)
            jobInProgress = False
        except:
            print("Some error occurred in the main script")
            traceback.print_exc()
            result = "Finished Unsuccessfully" if(not timeout) else "Finished - Timeout"
            failed  = True
        print("***************************** Main Script Finished **************************************")

    print(result)
    result = Utils.disconnectFromDatabase(db, None)
    if(not result): failed = True

    endTime = datetime.now()
    Utils.getTimeDifference(startTime, endTime)

    # clean up
    if(not lockedError):
        # remove lock file
        try:
            os.remove(lockFilePath)
            #print("Not removing")
        except:
            print("Failed to remove lock file")

    if(failed):
        exit(1)
    else:
        exit()
