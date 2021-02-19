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
        '../Sequences/comments_id_seq.sql',
        '../Sequences/Genres_id_seq.sql',
        '../Sequences/movieTags_id_seq.sql',
        '../Sequences/reviews_id_seq.sql',
        '../Sequences/users_id_seq.sql',
        '../Sequences/movies_id_seq.sql',
        '../Sequences/Retailers_id_seq.sql',
        '../tables/Users.sql',
        '../tables/Movies.sql',
        '../tables/Reviews.sql',
        '../tables/Comments.sql',
        '../tables/Genres.sql',
        '../tables/MovieGenreTables.sql',
        '../tables/MovieTags.sql',
        '../tables/ReviewBadTags.sql',
        '../tables/ReviewGoodTags.sql',
        '../tables/UsersFriends.sql',
        '../tables/UsersWhoWathched.sql',
        '../tables/UserWatchLists.sql',
        '../tables/Likes.sql',
        '../tables/Retailers.sql',
        '../tables/MoviesProviders.sql'
    ]
    controllerFunction(fileNames)
