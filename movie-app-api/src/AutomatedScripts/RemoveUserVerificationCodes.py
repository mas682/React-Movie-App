import psycopg2
from psycopg2.extras import DictCursor
import requests
import json
from datetime import date
from datetime import datetime
from config import config
import time
import sys

def connect(successfulOutput, failedOutput):
    connection = None
    failedOutput.append("Connecting to database\n")
    try:
        # get the connection parameters
        params = config()
        connection = psycopg2.connect(**params)
        # automatically commit changes
        connection.autocommit = True
        cur = connection.cursor(cursor_factory=DictCursor)
    except (Exception, psycopg2.DatabaseError) as error:
        failedOutput.append("Failed to connect to the database with the following error:\n")
        failedOutput.append(str(error))
        failedOutput.append("\n")
        if connection is not None:
            connection.close()
            failedOutput.append('Database connection closed\n')
        return [None]

    return [connection, cur]


def deleteUserVerificationCodes(cur, successfulOutput, failedOutput):
    try:
        cur.execute("""DELETE FROM public."UserVerificationCodes"
                       WHERE "expiresAt" < CURRENT_TIMESTAMP
                       OR ("verificationAttempts" >= 3 and "codesResent" >= 2)
                    """)
        result = cur.statusmessage
        successfulOutput.append(result)
        return 1
    except (Exception, psycopg2.DatabaseError) as error:
        failedOutput.append("\nAn error occurred trying to remove the users from the database:\n")
        failedOutput.append(str(error))
        return 0

def disconnect(connection, cur, successfulOutput, failedOutput):
    failedOutput.append("Disconnecting from database\n")
    try:
        # close the communication with the PostgreSQL
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        failedOutput.append("An error occurred closing the cursor to the database: \n")
        failedOutput.append(str(error))
        failedOutput.append("\n")
    finally:
        if connection is not None:
            connection.close()
            failedOutput.append('Database connection closed')

def controllerFunction():
    successfulOutput = []
    failedOutput = []
    try:
        outputFile = open("ScriptResults/RemoveUserVerificationCodes.txt", "a")
    except (Exception) as error:
        print("Failed to open the output file")
        return
    print("Starting controller function at: " + str(datetime.now()))
    outputFile.write("\n********************************************************************"
                    + "*********************")
    outputFile.write("\nStarting controller function at: " + str(datetime.now()) + "\n")
    startTime = time.time()
    # try to connect to the database
    connectionResult = connect(successfulOutput, failedOutput)
    connection = connectionResult[0]
    # if connection failed, return
    if connection is None:
        error = True
    else:
        cursor = connectionResult[1]

    deletionResult = deleteUserVerificationCodes(cursor, successfulOutput, failedOutput)

    if connection is not None:
        disconnect(connection, cursor, successfulOutput, failedOutput)

    endTime = time.time() - startTime
    successfulOutput.append("\nTime elapsed: " + str(endTime) + " seconds\n")

    if deletionResult == 0:
        failedOutput.append("\nTime elapsed: " + str(endTime) + " seconds\n")
        outputFile.writelines(failedOutput)
    else:
        outputFile.writelines(successfulOutput)
    outputFile.close()
    print("Controller function finished")

if __name__ == '__main__':
    controllerFunction()
