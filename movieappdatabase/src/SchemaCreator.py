# 9/27/2021
# Matt Stropkey
# This script is used to create a base database schema to use
# example command:
# python3 src/SchemaCreator.py
# needs to be ran from the parent file


import psycopg2
from config import config
from psycopg2.extras import DictCursor
import sys
import os
from time import sleep


def controllerFunction(fileNames):
    print("Sleeping 5 seconds to allow DB time to start")
    sleep(5)
    connectionResult = connect()
    connection = connectionResult[0]
    if connection is None:
        return
    cursor = connectionResult[1]
    for file in fileNames:
        print("Executing sql for: " + file)
        sql = getFile(file)
        if(sql is None):
            print("Failed to open file!")
            break
        result = executeSQL(cursor, sql)
        if not result:
            break
    disconnect(connection, cursor)

def getFile(fileName):
    try:
        file = open(fileName, 'r')
        sql = file.read()
        file.close()
    except (Exception) as error:
        print("Error occurred getting SQL file: " + fileName)
        return None
    return sql


def connect():
    connection = None
    print("Connecting to database")
    try:
        environment = os.getenv('ENVIRONMENT')
        if(environment is None):
            logger.info("Could not determine what environment the script is running on", extra=extras)
            raise Exception("Could not determine what environment the script is running on")
        # get the connection parameters
        params = config(environment)
        print(params)
        connection = psycopg2.connect(**params)
        # automatically commit changes
        connection.autocommit = True
        cur = connection.cursor(cursor_factory=DictCursor)
    except (Exception, psycopg2.DatabaseError) as error:
        print("Failed to connect to the database with the following error:")
        print(error)
        if connection is not None:
            connection.close()
            print('Database connection closed')
        return [None]

    return [connection, cur]


def executeSQL(cur, sql):
    try:
        cur.execute(sql)
    except (Exception, psycopg2.DatabaseError) as error:
        print("An error occurred trying to execute the SQL:")
        print(error)
        return False

    return True


def disconnect(connection, cur):
    print("Disconnectiong from database")
    try:
        # close the communication with the PostgreSQL
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print("An error occurred closing the cursor to the database: ")
        print(error)
    finally:
        if connection is not None:
            connection.close()
            print('Database connection closed')

if __name__ == '__main__':
    # order matters!
    # try to keep these matching the order in their files
    fileNames = [
        './Schemas/private.sql',
        './Schemas/public.sql',
        # trigger functions - private
        './triggerFunctions/private/trigger_set_schedule_job_updated_ts.sql',
        # trigger functions - public
        './triggerFunctions/public/trigger_create_movie_rating.sql',
        './triggerFunctions/public/trigger_delete_movie_rating.sql',
        './triggerFunctions/public/trigger_remove_expired_verificaiton_codes.sql',
        './triggerFunctions/public/trigger_set_account_locked_ts.sql',
        './triggerFunctions/public/trigger_set_movie_rating.sql',
        './triggerFunctions/public/trigger_set_timestamp.sql',
        './triggerFunctions/public/trigger_set_verification_locked_ts.sql',
        './triggerFunctions/public/trigger_update_movie_rating.sql',
        './triggerFunctions/public/trigger_update_temp_user_expiration.sql',
        './triggerFunctions/public/trigger_validate_salt_not_found_for_temp_verification_codes.sql',
        './triggerFunctions/public/trigger_validate_salt_not_found_for_user_creds.sql',
        # tables - private
        './tables/private/ScheduledJobs.sql',
        './tables/private/JobContainerControl.sql',
        './tables/private/JobSteps.sql',
        './tables/private/CronJobControl.sql',
        './tables/private/CronJobSchedule.sql',
        './tables/private/JobDetails.sql',
        './tables/private/JobQueue.sql',
        './tables/private/JobQueueLock.sql',
        './tables/private/TMDB_API_Control.sql',
        # tables - public
        './tables/public/DefaultProfilePictures.sql',
        './tables/public/Users.sql',
        './tables/public/Movies.sql',
        './tables/public/MovieRatings.sql',
        './tables/public/Reviews.sql',
        './tables/public/Comments.sql',
        './tables/public/FeaturedMovies.sql',
        './tables/public/Genres.sql',
        './tables/public/Likes.sql',
        './tables/public/MovieGenres.sql',
        './tables/public/Retailers.sql',
        './tables/public/MoviesProviders.sql',
        './tables/public/MovieTags.sql',
        './tables/public/ReviewBadTags.sql',
        './tables/public/ReviewGoodTags.sql',
        './tables/public/TempVerificationCodeTypes.sql',
        './tables/public/TempVerificationCodes.sql',
        './tables/public/UserAuthenticationAttempts.sql',
        './tables/public/UserCredentials.sql',
        './tables/public/UserSessions.sql', 
        './tables/public/UsersFriends.sql',
        './tables/public/UsersWatchedMovies.sql',
        './tables/public/VerificationQuestions.sql',
        './tables/public/UserWatchLists.sql',
        './tables/public/UserVerificationQuestions.sql',
        # procedures - private
        './Procedures/private/GetJobQueueLock.sql',
        './Procedures/private/UpdateJobQueue.sql'
        # functions - private
        './Functions/private/GetUpdatedCronJobs.sql'
    ]
    controllerFunction(fileNames)
