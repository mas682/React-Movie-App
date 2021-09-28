# 9/27/2021
# Matt Stropkey
# This script is used to create a base database schema to use
# example command:
# python3 -m AutomatedScripts.Scripts.ScriptController -path AutomatedScripts.Scripts.Jobs.EngineControl -jobId 1 -stepId 3


import psycopg2
from config import config
from psycopg2.extras import DictCursor
import sys


def controllerFunction(fileNames):
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
        # get the connection parameters
        params = config()
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
        '../Schemas/private.sql',
        '../Schemas/public.sql',
        # trigger functions - private
        '../triggerFunctions/private/trigger_set_schedule_job_updated_ts.sql',
        # trigger functions - public
        '../triggerFunctions/public/Set_Timestamp.sql',
        '../triggerFunctions/public/trigger_delete_movie_rating.sql',
        '../triggerFunctions/public/trigger_set_movie_rating.sql',
        '../triggerFunctions/public/trigger_set_verification_code_expiration.sql',
        '../triggerFunctions/public/trigger_update_movie_rating.sql',
        '../triggerFunctions/public/trigger_validate_salt_not_found_temp_users.sql',
        '../triggerFunctions/public/trigger_validate_salt_not_found_users.sql',
        '../triggerFunctions/public/trigger_validate_user_not_found.sql',
        # sequences - private
        '../Sequences/private/CronJobControl_id_seq.sql',
        '../Sequences/private/CronJobSchedule_id_seq.sql',
        '../Sequences/private/JobContainerControl_id_seq.sql',
        '../Sequences/private/JobDetails_id_seq.sql',
        '../Sequences/private/JobQueue_id_seq.sql',
        '../Sequences/private/JobQueueLock_id_seq.sql',
        '../Sequences/private/JobSteps_id_seq.sql',
        '../Sequences/private/ScheduledJobs_id_seq.sql',
        '../Sequences/private/TMDB_API_Control_id_seq.sql',
        # sequences = public
        '../Sequences/public/comments_id_seq.sql',
        '../Sequences/public/DefaultProfilePictures_id_seq.sql',
        '../Sequences/public/FeaturedMovies_id_seq.sql',
        '../Sequences/public/Genres_id_seq.sql',
        '../Sequences/public/movies_id_seq.sql',
        '../Sequences/public/movieTags_id_seq.sql',
        '../Sequences/public/Retailers_id_seq.sql',
        '../Sequences/public/reviews_id_seq.sql',
        '../Sequences/public/TempVerificationCodes_id_seq.sql',
        '../Sequences/public/users_id_seq.sql',
        '../Sequences/public/UserSessions_id_seq.sql',
        '../Sequences/public/userverificationcodes_id_seq.sql',
        '../Sequences/public/UserVerificationQuestions_id_seq.sql',
        '../Sequences/public/VerificationQuestions_id_seq.sql',
        # tables - private
        '../tables/private/ScheduledJobs.sql',
        '../tables/private/JobContainerControl.sql',
        '../tables/private/JobSteps.sql',
        '../tables/private/CronJobControl.sql',
        '../tables/private/CronJobSchedule.sql',
        '../tables/private/JobDetails.sql',
        '../tables/private/JobQueue.sql',
        '../tables/private/JobQueueLock.sql',
        '../tables/private/TMDB_API_Control.sql',
        # tables - public
        '../tables/public/Comments.sql',
        '../tables/public/DefaultProfilePictures.sql',
        '../tables/public/FeaturedMovies.sql',
        '../tables/public/Genres.sql',
        '../tables/public/Likes.sql',
        '../tables/public/MovieGenres.sql',
        '../tables/public/Movies.sql',
        '../tables/public/MoviesProviders.sql',
        '../tables/public/MovieTags.sql',
        '../tables/public/Retailers.sql',
        '../tables/public/ReviewBadTags.sql',
        '../tables/public/ReviewGoodTags.sql',
        '../tables/public/Reviews.sql',
        '../tables/public/TempVerificationCodes.sql',
        '../tables/public/Users.sql',
        '../tables/public/UserSessions.sql', 
        '../tables/public/UsersFriends.sql',
        '../tables/public/UsersWatchedMovies.sql',
        '../tables/public/UserVerificationCodes.sql',
        '../tables/public/VerificationQuestions.sql',
        '../tables/public/UserWatchLists.sql',
        '../tables/public/UserVerificationQuestions.sql',
        # procedures - private
        '../Procedures/private/GetJobQueueLock.sql',
        '../Procedures/private/UpdateJobQueue.sql'
    ]
    controllerFunction(fileNames)
