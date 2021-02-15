import psycopg2
from psycopg2.extras import DictCursor
import requests
import json
from datetime import date
from datetime import datetime
from config import config
import time

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


def insertMovie(cur, result):
    id = -2
    try:
        cur.execute("""INSERT INTO public.movies(
                    id, revenue, title, director, "runTime", rating, trailer, "backgroundImage", "releaseDate", overview, poster)
                    VALUES """ + result + """
                    ON CONFLICT (id) DO NOTHING
                    RETURNING id;""")
        # need to fix the insert to do a update if conflict exists
        records = cur.fetchall()
        if len(records) < 1:
            # creation failed
            return -1
        else:
            id = records[0]["id"]
    except (Exception, psycopg2.DatabaseError) as error:
        print("\nAn error occurred trying to insert the movie into the databse:")
        print(error)
        return -2

    return id

def insertGenres(cur, result, movieId):
    insertErrors = 0
    for genre in result:
        genre = genre.replace("'", "''")
        try:
            cur.execute("select * from public.\"Genres\" where value = '" + genre + "'")
            records = cur.fetchall()
            id = -1
            if len(records) > 0:
                id = records[0]["id"]
            else:
                # create the genre if it did not exist
                cur.execute("""INSERT INTO public."Genres"(value)
                               VALUES ('""" + genre + """')
                               ON CONFLICT (value) DO NOTHING
                               RETURNING id;""")
                records = cur.fetchall()
                if len(records) > 0:
                    id = records[0]["id"]
                else:
                    print("An error occurred when attempting to create the genre: " + genre)
                    insertErrors = insertErrors + 1
                    continue
            # associate the movie with the genre
            cur.execute("""INSERT INTO public."MovieGenreTables"(
	                       "GenreId", "movieId")
	                       VALUES (""" + str(id) + """,""" + str(movieId) + """)
                           ON CONFLICT("GenreId","movieId") DO NOTHING;""")
        except (Exception, psycopg2.DatabaseError) as error:
            print("An error occurred trying to associate the genre: " + genre + " with the movie ID: " + str(movieId))
            print(error)
            return [False, insertErrors]
    return [True, insertErrors]

def disconnect(connection, cur):
    print("\nDisconnectiong from database")
    try:
        # close the communication with the PostgreSQL
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if connection is not None:
            connection.close()
            print('Database connection closed')


def controllerFunction():
    print("Starting controller function at: " + str(datetime.now()))
    maxLoops = 5
    page = 0
    totalPages = 1
    error = False
    totalPagesRead = 0
    totalAPICalls = 0
    totalResultCount = 0
    totalMoviesInserted = 0
    genreInsertionErrors = 0
    startTime = time.time()

    # try to connect to the database
    connectionResult = connect()
    connection = connectionResult[0]
    # if connection failed, return
    if connection is None:
        return;
    cursor = connectionResult[1]

    while (page + 1) <= totalPages and (page + 1) <= maxLoops and not error:
        page = page + 1
        totalAPICalls = totalAPICalls + 1
        totalPagesRead = totalPagesRead + 1
        movieListResult = getMovies(page)
        if movieListResult["success"]:
            movieListResults = movieListResult.get("result")
            # get the total number of pages that there are
            totalPages = movieListResults.get("total_pages", 0)
            resultCount = movieListResults.get("total_results", 0)
            totalResultCount = resultCount
            if resultCount > 0:
                movies = movieListResults.get("results")
                if movies is not None:
                    for movie in movies:
                        id = movie.get("id")
                        if id is not None:
                            totalAPICalls = totalAPICalls + 1
                            movieDetails = getMovieDetails(id)
                            if movieDetails["success"]:
                                movieDetailsResult = movieDetails.get("result")
                                # need to update this to be able to do a update string for movies
                                parseResults = parseMovieResults(movieDetailsResult)
                                insertResult = insertMovie(cursor, parseResults["movieValue"])
                                if insertResult == -1:
                                    print("Failed to create the movie with the ID of " + str(id) + " in the database due to it already existing")
                                    # conflict occurred inserting movie
                                    continue
                                elif insertResult == -2:
                                    # if some database error occurred
                                    print("Failed to create the movie with the ID of " + str(id) + " in the database due to an exception")
                                    error = True
                                    break
                                genreResult = insertGenres(cursor,parseResults["genres"], insertResult)
                                genreInsertionErrors = genreInsertionErrors + genreResult[1]
                                if not genreResult[0]:
                                    # if some database error occurred
                                    error = True
                                    break
                            else:
                                # request failed due to unknown cause or authentication error
                                error = True
                                # break out of for loop
                                break
                            print("Successfully loaded the movie with the ID of: " + str(id))
                            totalMoviesInserted = totalMoviesInserted + 1
                        else:
                            print("Could not find a movie id for the following result: ")
                            print(movie)
                else:
                    print("\nNo movies found in movie list")
                    error = True
            else:
                print("No movies found in movie list")
                # if no results, set to true to not loop again
                error = True
        else:
            error = True
    # after the loop
    if connection is not None:
        disconnect(connection, cursor)

    endTime = time.time() - startTime
    print("\n\nTotal API Calls: " + str(totalAPICalls))
    print("Number of movies returned by API: " + str(totalResultCount))
    print("Total pages read: " + str(totalPagesRead))
    print("Total movies inserted into database successfully: " + str(totalMoviesInserted))
    print("Total number of genre insertion errors: " + str(genreInsertionErrors))
    print("Time elapsed: " + str(endTime) + " seconds")


# function to send api call to get the list of movies
def getMovies(page):
        #day = date.today()
        day = date(2021, 2, 5)
        day = day.strftime("%Y-%m-%d")
        startDate = day
        endDate = day
        url = ("https://api.themoviedb.org/3/discover/movie?"
            + "api_key=9687aa5fa5dc35e0d5aa0c2a3c663fcc&language=en-US&region=US&sort_by=popularity.desc&"
            + "certification_country=US&with_release_type=3|2|1|5|4|6&include_adult=false&include_video=false&page=" + str(page) + "&"
            + "primary_release_date.gte=" + startDate + "&primary_release_date.lte=" + endDate + "&with_original_language=en")
        print("\nCalling API to get new releases:  ")
        print("URL: " + url)
        success = False
        try:
            result = requests.get(url, timeout=1)
            status = result.status_code
            jsonResult = result.json()
            if status == 200:
                success = True
            else:
                print("Failed to get the list of movies to pull details for")
                print("Status code: " + str(status))
                print("Status message: " + jsonResult.get("status_message"))
        except(request.ConnectionError) as error:
            print("Failed to get the movie list due to a connection failure to API")
            print(error)
        except(requests.Timeout) as error:
            print("Failed to get the movie list due to a timeout")
            print(error)
        except (requests.exceptions.RequestException) as error:
            print("Failed to get the movie list")
            print(error)
        except (requests.ValueError) as error:
            print("Failed to get the movie list due to a JSON conversion failure")
            print(error)
        except(Exception) as error:
            print("Some unexpected error occurred when getting the movie list")
            print(error)
        if success:
            return {"success": True, "result":jsonResult}
        else:
            return {"success":False}

# function to send api call to get movie details
def getMovieDetails(movieId):
    url = ("https://api.themoviedb.org/3/movie/" + str(movieId) + "?api_key=9687aa5fa5dc35e0d5aa0c2a3c663fcc" +
           "&language=en-US&region=US&include_image_language=en&append_to_response=videos%2Crelease_dates%2C" +
           "credits%2Cimages%2Cwatch%2Fproviders%2Cexternal_ids")
    success = False
    try:
        result = requests.get(url, timeout=1)
        status = result.status_code
        jsonResult = result.json()
        if status == 200:
            success = True
        else:
            print("Failed to get movie details from API for movieID: " + str(movieId))
            print("Status code: " + str(status))
            print("Status message: " + jsonResult.get("status_message"))
            if status == 404:
                # if here, request may have failed as movie does not exist so just continue
                success = True
    except(request.ConnectionError) as error:
        print("\nFailed to get movie details for movie id: " + str(movieId) + " due to a connection failure to API")
        print(error)
    except(requests.Timeout) as error:
        print("\nFailed to get movie details for movie id: " + str(movieId) + " due to a timeout")
        print(error)
    except (requests.exceptions.RequestException) as error:
        print("\nFailed to get movie details for movie id: " + str(movieId))
        print(error)
    except (requests.ValueError) as error:
        print("\nFailed to get movie details for movie id: " + str(movieId) + " a JSON conversion failure")
        print(error)
    except(Exception) as error:
        print("\nSome unexpected error occurred when getting the movie details for the movie id: " + str(movieId))
        print(error)
    if success:
        return {"success": True, "result":jsonResult}
    else:
        return {"success":False}

def parseMovieResults(result):
    # get the release dates, their types, and the rating of the movie
    releaseDates = result.get("release_dates")
    releaseDateByType = {}
    rating = getReleaseDates(releaseDates, releaseDateByType)
    videos = result.get("videos")
    trailer = getTrailer(videos)
    credits = result.get("credits")
    director = getDirector(credits)
    rentProviders = {}
    buyProviders = {}
    watchProviders = result.get("watch/providers")
    getWatchProviders(watchProviders, rentProviders, buyProviders)
    # external ids already formatted
    externalIds = result.get("external_ids")
    genres = []
    genreList = result.get("genres")
    getGenres(genreList, genres)
    movieDetails = {}
    parseMovieDetails(result, movieDetails)
    movieValue = generateSQL(releaseDateByType, rating, trailer, director, rentProviders, buyProviders, externalIds, genres, movieDetails)
    return {"movieValue":movieValue, "genres":genres}


def generateSQL(releaseDateByType, rating, trailer, director, rentProviders, buyProviders, externalIds, genres, movieDetails):
    movieTitle = movieDetails.get("title", "NULL")
    if movieTitle != "NULL":
        if movieTitle is None:
            movieTitle = "NULL"
        movieTitle = movieTitle.replace("'", "''")
        movieTitle = "\'" + movieTitle + "\'"
    directorString = director
    if directorString != "NULL":
        directorString = directorString.replace("'", "''")
        directorString = "\'" + director + "\'"
    ratingString = rating
    if ratingString != "NULL":
        ratingString = "\'" + rating + "\'"
    trailerString = trailer
    if trailerString != "NULL":
        trailerString = "\'" + trailer + "\'"
    backdrop = movieDetails.get("backdrop", "NULL")
    if backdrop != "NULL":
        if backdrop is None:
            backdrop = "NULL"
        backdrop = "\'" + backdrop + "\'"
    releaseDate = movieDetails.get("releaseDate", "NULL")
    if releaseDate != "NULL":
        if releaseDate is None:
            releaseDate = "NULL"
        releaseDate = "\'" + releaseDate + "\'"
    overview = movieDetails.get("overview", "NULL")
    if overview != "NULL":
        if overview is None:
            overview = "NULL"
        overview = overview.replace("'", "''")
        overview = "\'" + overview + "\'"
    poster = movieDetails.get("poster", "NULL")
    if poster != "NULL":
        if poster is None:
            poster = "NULL"
        poster = "\'" + poster + "\'"
    result = ("(" + movieDetails.get("id", "NULL") + ", "+ movieDetails.get("revenue", "NULL") + ", " +  movieTitle + ", " +
             directorString + ", " + movieDetails.get("runtime", "NULL") + ", " + ratingString + ", " +
             trailerString + ", " + backdrop + ", " + releaseDate + ", " + overview + ", " + poster + ")")
    return result


# function to pull the release dates out of the json result
def getReleaseDates(releaseDates, releaseDateByType):
    rating = "NULL"
    if releaseDates is not None:
        releaseDates = releaseDates.get("results")
        if releaseDates is not None:
            for dates in releaseDates:
                country = dates.get("iso_3166_1")
                if country == "US":
                    releaseTypes = dates.get("release_dates")
                    for item in releaseTypes:
                        if rating == "NULL":
                            rating = str(item.get("certification", "NULL"))
                        #1.Premiere,2. Theatrical (limited),3. Theatrical,4. Digital,5. Physical,6. TV
                        type = item.get("type")
                        releaseDate = item.get("release_date")
                        releaseDateByType.update({type:releaseDate})
    return rating

# function to pull the trailer out of the json result
def getTrailer(videos):
    trailer = "NULL"
    if videos is not None:
        videos = videos.get("results")
        if videos is not None:
            if len(videos) > 0:
                video = videos[0]
                trailer = video.get("key", "NULL")
    return trailer

# function to pull the director out of the json result
def getDirector(credits):
    director = "NULL"
    if credits is not None:
        crew = credits.get("crew")
        if crew is not None:
            if len(crew) > 0:
                # director should be the first crewmember in the array
                crewMember = crew[0]
                if crewMember.get("job") == "Director":
                    director = crewMember.get("name", "NULL")
    return director

# function to pull the watch providers out of the json result
def getWatchProviders(watchProviders, rentProviders, buyProviders):
    if watchProviders is not None:
        results = watchProviders.get("results")
        if results is not None:
            usProviders = results.get("US")
            if usProviders is not None:
                rent = usProviders.get("rent")
                if rent is not None:
                    for provider in rent:
                        logo = provider.get("logo_path", "NULL")
                        provider_id = provider.get("provider_id", "NULL")
                        provider_name = provider.get("provider_name", "NULL")
                        rentProviders.update({str(provider_id):{"name":provider_name, "logo":logo}})
                buy = usProviders.get("buy")
                if buy is not None:
                    for provider in buy:
                        logo = provider.get("logo_path", "NULL")
                        provider_id = provider.get("provider_id", "NULL")
                        provider_name = provider.get("provider_name", "NULL")
                        buyProviders.update({str(provider_id):{"name":provider_name, "logo":logo}})

# function to get the genres out of the json result
def getGenres(genreList, genres):
    if genreList is not None:
        for genre in genreList:
            value = genre.get("name")
            if value is not None:
                genres.append(value)

# function to get the various movie details out of the json result
def parseMovieDetails(results, movieDetails):
    if results is not None:
        movieDetails.update({"backdrop":results.get("backdrop_path", "NULL")})
        movieDetails.update({"homepage":results.get("homepage", "NULL")})
        movieDetails.update({"id":str(results.get("id", "NULL"))})
        movieDetails.update({"title":results.get("title", "NULL")})
        movieDetails.update({"overview":results.get("overview", "NULL")})
        movieDetails.update({"poster":results.get("poster_path", "NULL")})
        movieDetails.update({"releaseDate":results.get("release_date", "NULL")})
        movieDetails.update({"revenue":str(results.get("revenue", "NULL"))})
        movieDetails.update({"runtime":str(results.get("runtime", "NULL"))})
        movieDetails.update({"status":results.get("status", "NULL")})

if __name__ == '__main__':
    #with open('C:/Users/mstro/Documents/React-Movie-App/test.json', encoding='utf-8') as f:
    #    data = json.load(f)
    #    result = parseMovieResults(data)
    #    # try to connect to the database
    #    connectionResult = connect()
    #    connection = connectionResult[0]
    #    # if connection failed, return
    #    if connection is not None:
    #        cursor = connectionResult[1]
    #        movieInsertResult = insertMovie(cursor,result["movieValue"])
    #        if movieInsertResult != -1 and movieInsertResult != -2:
    #            insertGenres(cursor, result["genres"], movieInsertResult)
    #        else:
    #            print("Movie insert failed")

    #    disconnect(connection, cursor)
    controllerFunction()
    #d = {"a":"None"}
    #print(d.get("a", "NULL"))

        #connect(result)
