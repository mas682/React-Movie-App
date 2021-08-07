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
    fileNames = [
        '../triggerFunctions/Set_Timestamp.sql',
        '../triggerFunctions/trigger_delete_movie_rating.sql',
        '../triggerFunctions/trigger_set_movie_rating.sql',
        '../triggerFunctions/trigger_update_movie_rating.sql',
        '../triggerFunctions/trigger_set_created_timestamp.sql',
        '../triggerFunctions/trigger_set_verification_code_expiration.sql',
        '../triggerFunctions/trigger_validate_user_not_found.sql',
        '../triggerFunctions/trigger_validate_salt_not_found_temp_users',
        '../triggerFunctions/trigger_validate_salt_not_found_users',
        '../Sequences/comments_id_seq.sql',
        '../Sequences/Genres_id_seq.sql',
        '../Sequences/movieTags_id_seq.sql',
        '../Sequences/reviews_id_seq.sql',
        '../Sequences/users_id_seq.sql',
        '../Sequences/movies_id_seq.sql',
        '../Sequences/Retailers_id_seq.sql',
        '../Sequences/userverificationcodes_id_seq.sql',
        '../Sequences/UserVerificationQuestions_id_seq.sql',
        '../Sequences/VerificationQuestions_id_seq.sql',
        '../Sequences/FeaturedMovies_id_seq.sql',
        '../Sequences/ScheduledJobs_id_seq.sql',
        '../Sequences/JobDetails_id_seq.sql',
        '../Sequences/DefaultProfilePictures_id_seq.sql',
        '../tables/Users.sql',
        '../tables/Movies.sql',
        '../tables/Reviews.sql',
        '../tables/Comments.sql',
        '../tables/Genres.sql',
        '../tables/MovieGenres.sql',
        '../tables/MovieTags.sql',
        '../tables/ReviewBadTags.sql',
        '../tables/ReviewGoodTags.sql',
        '../tables/UsersFriends.sql',
        '../tables/UsersWatchedMovies.sql',
        '../tables/UserWatchLists.sql',
        '../tables/Likes.sql',
        '../tables/Retailers.sql',
        '../tables/MoviesProviders.sql',
        '../tables/UserVerificationCodes.sql',
        '../tables/UserVerificationQuestions.sql',
        '../tables/VerificationQuestions.sql',
        '../tables/FeaturedMovies.sql',
        '../tables/UserSessions.sql',
        '..tables/ScheduledJobs.sql',
        '..tables/JobDetails.sql',
        '../tables/DefaultProfilePictures.sql'
    ]
    controllerFunction(fileNames)
