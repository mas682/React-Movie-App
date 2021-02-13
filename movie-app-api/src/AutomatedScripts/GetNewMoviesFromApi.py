import psycopg2
import requests
from datetime import date
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
        print(params)

        cur = connection.cursor()

        # execute a statement
        print("PostgreSQL database version:")
        #cur.execute("""
        #    INSERT INTO users(
        #        username, email, password, "firstName", "lastName")
        #        Values (
        #            'matttest',
        #            'mas68295@pitt.edu',
        #            'abcdefghijklm',
        #            'Matt',
        #            'Strop'
        #        );
        #""");

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


def callApi():
    day = date.today().strftime("%Y-%m-%d")
    print(day)
    startDate = day
    endDate = day
    result = requests.get("https://api.themoviedb.org/3/discover/movie?"
    + "api_key=9687aa5fa5dc35e0d5aa0c2a3c663fcc&language=en-US&region=US&sort_by=popularity.desc&"
    + "certification_country=US&include_adult=false&include_video=false&page=1&"
    + "release_date.gte=" + startDate + "&release_date.lte=" + endDate + "&with_original_language=en")
    jsonResult = result.json()
    #print(jsonResult["page"])
    #print(jsonResult["results"][0])
    #for movie in jsonResult["results"]:
    #    print(movie)
    firstMovie = jsonResult["results"][0]
    result2 = requests.get("""
        https://api.themoviedb.org/3/movie/577922?api_key=9687aa5fa5dc35e0d5aa0c2a3c663fcc
        &language=en-US&region=US&append_to_response=videos%2Crelese_dates
        %2Ccredits%2Cimages%2Cwatch%2Fproviders%2Cexternal_ids
    """)
    print(result2.text)

def getMovieDetails(movieId):
    url = """
        https://api.themoviedb.org/3/movie/""" + movieId + """?api_key=9687aa5fa5dc35e0d5aa0c2a3c663fcc
        &language=en-US&region=US&append_to_response=videos%2Crelease_dates
        %2Ccredits%2Cimages%2Cwatch%2Fproviders%2Cexternal_ids"""
    try:
        result = requests.get(url, timeout=1)
        status = result.status_code
        jsonResult = result.json()
        if status == 200:
            parseMovieResults(jsonResult)
        else:
            print("Failed to get movie details from API")
    except(request.ConnectionError) as error:
        print("Failed to get movie details for movie id: " + movieId + " due to a connection failure to API")
        print(error)
    except(requests.Timeout) as error:
        print("Failed to get movie details for movie id: " + movieId + " due to a timeout")
        print(error)
    except (requests.exceptions.RequestException) as error:
        print("Failed to get movie details for movie id: " + movieId)
        print(error)
    except (requests.ValueError) as error:
        print("Failed to get movie details for movie id: " + movieId + " a JSON conversion failure")
        print(error)
    except(Exception) as error:
        print("Some unexpected error occurred when getting the movie details for the movie id: " + movieId)
        print(error)
    finally:
        print("Done getting movie details for movie id: " + movieId)

def parseMovieResults(result):
    # get the release dates, their types, and the rating of the movie
    releaseDates = result.get("release_dates")
    rating = None
    releaseDateByType = {}
    if releaseDates is not None:
        releaseDates = releaseDates.get("results")
        if releaseDates is not None:
            for dates in releaseDates:
                country = dates.get("iso_3166_1")
                if country == "US":
                    releaseTypes = dates.get("release_dates")
                    for item in releaseTypes:
                        if rating is None:
                            rating = item.get("certification")
                        #1.Premiere,2. Theatrical (limited),3. Theatrical,4. Digital,5. Physical,6. TV
                        type = item.get("type")
                        releaseDate = item.get("release_date")
                        releaseDateByType.update({type:releaseDate})
    trailer = None
    videos = result.get("videos")
    if videos is not None:
        videos = videos.get("results")
        if videos is not None:
            if len(videos) > 0:
                video = videos[0]
                trailer = video.get("key")
    # left off here
    probably want to break these into individual functions
    continue down test.json and app.js to gather all the data



if __name__ == '__main__':
    #connect()
    #callApi()
    t = {
        "a" : "b"
    }
    try:
        print(t.get("t"))
    except(Exception):
        print("Failed")
