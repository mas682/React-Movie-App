import psycopg2
from config import config

def connect():
    connection = None
    try:
        # get the connection parameters
        params = config()

        print("Connection to the PostgreSQL database...")
        connection = psycopg2.connect(**params)
        # automatically commit changes
        connection.autocommit = True

        cur = connection.cursor()

        # execute a statement
        print("PostgreSQL database version:")
        cur.execute("""
            INSERT INTO users(
                username, email, password, "firstName", "lastName")
                Values (
                    'matttest',
                    'mas68295@pitt.edu',
                    'abcdefghijklm',
                    'Matt',
                    'Strop'
                );
        """);

        cur.execute("select * from users where username = 'matttest2'");

        # display the PostgreSQL database server version
        db_version = cur.fetchone()
        print(db_version)

        # close the communication with the PostgreSQL
        cur.close()
    except (Exception, psycop2.DatabaseError) as error:
        print(error)
    finally:
        if connection is not None:
            connection.close()
            print('Database connection closed')

if __name__ == '__main__':
    connect()
