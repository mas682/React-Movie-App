import psycopg2
from psycopg2.extras import DictCursor
import requests
import json
from datetime import date
from datetime import datetime
from config import config
import time

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


def insertMovie(cur, insertValue, updateValue, successfulOutput, failedOutput):
    id = -2
    try:
        cur.execute("""INSERT INTO public.movies(
                    title, revenue, director, "runTime", rating, trailer, "backgroundImage",
                    "releaseDate", overview, poster, "premiereReleaseDate", "theaterLimitedReleaseDate",
                    "theaterReleaseDate", "digitalReleaseDate", "physicalReleaseDate", "tvReleaseDate",
                    status, homepage, imdb_id, tmdb_id, "originalLanguage")
                    VALUES """ + insertValue + """
                    ON CONFLICT (tmdb_id) DO
                    UPDATE SET """ + updateValue + """
                    RETURNING id;""")
        records = cur.fetchall()
        if len(records) < 1:
            # creation failed
            return -1
        else:
            id = records[0]["id"]
    except (Exception, psycopg2.DatabaseError) as error:
        failedOutput.append("\nAn error occurred trying to insert the movie into the database:\n")
        failedOutput.append(str(error))
        failedOutput.append("\n")
        return -2

    return id

def insertGenres(cur, result, movieId, successfulOutput, failedOutput):
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
                    failedOutput.append("An error occurred when attempting to create the genre: " + genre + "\n")
                    insertErrors = insertErrors + 1
                    continue
            # associate the movie with the genre
            cur.execute("""INSERT INTO public."MovieGenreTables"(
	                       "GenreId", "movieId")
	                       VALUES (""" + str(id) + """,""" + str(movieId) + """)
                           ON CONFLICT("GenreId","movieId") DO NOTHING;""")
        except (Exception, psycopg2.DatabaseError) as error:
            failedOutput.append("An error occurred trying to associate the genre: " + genre + " with the movie ID: " + str(movieId) + "\n")
            failedOutput.append(str(error))
            failedOutput.append("\n")
            return [False, insertErrors]
    return [True, insertErrors]

def disconnect(connection, cur, successfulOutput, failedOutput):
    failedOutput.append("\nDisconnectiong from database\n")
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
            failedOutput.append('Database connection closed\n')

def controllerFunction():
    successfulOutput = []
    failedOutput = []
    # should wrap in a try
    try:
        outputFile = open("GetNewMoviesOutput.txt", "a")
    except (Exception) as error:
        print("Failed to open the output file")
        return
    print("Starting controller function at: " + str(datetime.now()))
    outputFile.write("\nStarting controller function at: " + str(datetime.now()) + "\n")
    try:
        params = config(section='TMDB')
        apiKey = params["key"]
    except (Exception) as error:
        outputFile.write("Failed to get the API key from the config file\n")
        return
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
    connectionResult = connect(successfulOutput, failedOutput)
    connection = connectionResult[0]
    # if connection failed, return
    if connection is None:
        error = True
    else:
        cursor = connectionResult[1]

    while (page + 1) <= totalPages and (page + 1) <= maxLoops and not error:
        page = page + 1
        totalAPICalls = totalAPICalls + 1
        totalPagesRead = totalPagesRead + 1
        movieListResult = getMovies(page, successfulOutput, failedOutput, apiKey)
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
                        # use this release date as your primary
                        releaseDate = movie.get("release_date", "NULL")
                        if id is not None:
                            totalAPICalls = totalAPICalls + 1
                            movieDetails = getMovieDetails(id, successfulOutput, failedOutput, apiKey)
                            if movieDetails["success"]:
                                movieDetailsResult = movieDetails.get("result")
                                # need to update this to be able to do a update string for movies
                                parseResults = parseMovieResults(movieDetailsResult, releaseDate)
                                insertResult = insertMovie(cursor, parseResults["movieInsert"], parseResults["movieUpdate"], successfulOutput, failedOutput)
                                if insertResult == -1:
                                    failedOutput.append("Failed to create the movie with the ID of " + str(id) + " in the database due to it already existing\n")
                                    # conflict occurred inserting movie
                                    continue
                                elif insertResult == -2:
                                    # if some database error occurred
                                    failedOutput.append("Failed to create the movie with the ID of " + str(id) + " in the database due to an exception")
                                    error = True
                                    break
                                genreResult = insertGenres(cursor,parseResults["genres"], insertResult, successfulOutput, failedOutput)
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
                            failedOutput.append("Successfully loaded the movie with the ID of: " + str(id) + "\n")
                            totalMoviesInserted = totalMoviesInserted + 1
                        else:
                            failedOutput.append("Could not find a movie id for the following result: ")
                            failedOutput.append(movie)
                            failedOutput.append("\n")
                else:
                    failedOutput.append("\nNo movies found in movie list\n")
                    error = True
            else:
                failedOutput.append("No movies found in movie list\n")
                # if no results, set to true to not loop again
                error = True
        else:
            error = True
    # after the loop
    if connection is not None:
        disconnect(connection, cursor, successfulOutput, failedOutput)

    endTime = time.time() - startTime
    failedOutput.append("\nTotal API Calls: " + str(totalAPICalls) + "\n")
    failedOutput.append("Number of movies returned by API: " + str(totalResultCount) + "\n")
    failedOutput.append("Total pages read: " + str(totalPagesRead) + "\n")
    failedOutput.append("Total movies inserted into database successfully: " + str(totalMoviesInserted) + "\n")
    failedOutput.append("Total number of genre insertion errors: " + str(genreInsertionErrors) + "\n")
    failedOutput.append("Time elapsed: " + str(endTime) + " seconds\n")
    successfulOutput.append("Total API Calls: " + str(totalAPICalls) + "\n")
    successfulOutput.append("Number of movies returned by API: " + str(totalResultCount) + "\n")
    successfulOutput.append("Total pages read: " + str(totalPagesRead) + "\n")
    successfulOutput.append("Total movies inserted into database successfully: " + str(totalMoviesInserted) + "\n")
    successfulOutput.append("Total number of genre insertion errors: " + str(genreInsertionErrors) + "\n")
    successfulOutput.append("Time elapsed: " + str(endTime) + " seconds\n")
    if totalMoviesInserted != totalResultCount or genreInsertionErrors > 0:
        outputFile.writelines(failedOutput)
    else:
        outputFile.writelines(successfulOutput)
    outputFile.close()
    print("Controller function finished")


# function to send api call to get the list of movies
def getMovies(page, successfulOutput, failedOutput, apiKey):
        day = date.today()
        #day = date(2021, 1, 22)
        day = day.strftime("%Y-%m-%d")
        startDate = day
        endDate = day
        url = ("https://api.themoviedb.org/3/discover/movie?"
            + "api_key=" + apiKey + "&language=en-US&region=US&sort_by=popularity.desc&"
            + "certification_country=US&with_release_type=3|2|1|5|4|6&include_adult=false&include_video=false&page=" + str(page) + "&"
            + "primary_release_date.gte=" + startDate + "&primary_release_date.lte=" + endDate + "&with_original_language=en")
        failedOutput.append("\nCalling API to get new releases:  \n")
        failedOutput.append("URL: " + url + "\n")
        success = False
        try:
            result = requests.get(url, timeout=1)
            status = result.status_code
            jsonResult = result.json()
            if status == 200:
                success = True
            else:
                failedOutput.append("Failed to get the list of movies to pull details for\n")
                failedOutput.append("Status code: " + str(status) + "\n")
                failedOutput.append("Status message: " + jsonResult.get("status_message") + "\n")
        except(request.ConnectionError) as error:
            failedOutput.append("Failed to get the movie list due to a connection failure to API\n")
            failedOutput.append(str(error))
            failedOutput.append("\n")
        except(requests.Timeout) as error:
            failedOutput.append("Failed to get the movie list due to a timeout\n")
            failedOutput.append(str(error))
            failedOutput.append("\n")
        except (requests.exceptions.RequestException) as error:
            failedOutput.append("Failed to get the movie list\n")
            failedOutput.append(str(error))
            failedOutput.append("\n")
        except (requests.ValueError) as error:
            failedOutput.append("Failed to get the movie list due to a JSON conversion failure\n")
            failedOutput.append(str(error))
            failedOutput.append("\n")
        except(Exception) as error:
            failedOutput.append("Some unexpected error occurred when getting the movie list\n")
            failedOutput.append(str(error))
            failedOutput.append("\n")
        if success:
            return {"success": True, "result":jsonResult}
        else:
            return {"success":False}

# function to send api call to get movie details
def getMovieDetails(movieId, successfulOutput, failedOutput, apiKey):
    url = ("https://api.themoviedb.org/3/movie/" + str(movieId) + "?api_key=" + apiKey +
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
            failedOutput.append("Failed to get movie details from API for movieID: " + str(movieId) + "\n")
            failedOutput.append("Status code: " + str(status) + "\n")
            failedOutput.append("Status message: " + jsonResult.get("status_message") + "\n")
            if status == 404:
                # if here, request may have failed as movie does not exist so just continue
                success = True
    except(request.ConnectionError) as error:
        failedOutput.append("\nFailed to get movie details for movie id: " + str(movieId) + " due to a connection failure to API\n")
        failedOutput.append(str(error))
        failedOutput.append("\n")
    except(requests.Timeout) as error:
        failedOutput.append("\nFailed to get movie details for movie id: " + str(movieId) + " due to a timeout\n")
        failedOutput.append(str(error))
        failedOutput.append("\n")
    except (requests.exceptions.RequestException) as error:
        failedOutput.append("\nFailed to get movie details for movie id: " + str(movieId) + "\n")
        failedOutput.append(str(error))
        failedOutput.append("\n")
    except (requests.ValueError) as error:
        failedOutput.append("\nFailed to get movie details for movie id: " + str(movieId) + " a JSON conversion failure\n")
        failedOutput.append(str(error))
        failedOutput.append("\n")
    except(Exception) as error:
        failedOutput.append("\nSome unexpected error occurred when getting the movie details for the movie id: " + str(movieId) + "\n")
        failedOutput.append(str(error))
        failedOutput.append("\n")
    if success:
        return {"success": True, "result":jsonResult}
    else:
        return {"success":False}

def parseMovieResults(result, releaseDate):
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
    movieValue = generateSQL(releaseDateByType, rating, trailer, director, rentProviders, buyProviders, externalIds, genres, movieDetails, releaseDate)
    return {"movieInsert":movieValue["insert"], "movieUpdate":movieValue["update"], "genres":genres}


def generateSQL(releaseDateByType, rating, trailer, director, rentProviders, buyProviders, externalIds, genres, movieDetails, primaryReleaseDate):


    make all these ifs into a reusable function to clean this up!!!

    movieTitle = movieDetails.get("title", "NULL")
    if movieTitle != "NULL":
        if movieTitle is None or movieTitle == "":
            movieTitle = "NULL"
        else:
            movieTitle = movieTitle.replace("'", "''")
            movieTitle = "\'" + movieTitle + "\'"
    directorString = director
    if directorString != "NULL":
        if directorString is None or directorString == "":
            directorString = "NULL"
        else:
            directorString = directorString.replace("'", "''")
            directorString = "\'" + director + "\'"
    ratingString = rating
    if ratingString != "NULL":
        if ratingString is None or ratingString == "":
            ratingString = "NULL"
        else:
            ratingString = "\'" + rating + "\'"
    trailerString = trailer
    if trailerString != "NULL":
        if trailerString is None or trailerString == "":
            trailerString = "NULL"
        else:
            trailerString = "\'" + trailer + "\'"
    backdrop = movieDetails.get("backdrop", "NULL")
    if backdrop != "NULL":
        if backdrop is None or backdrop == "":
            backdrop = "NULL"
        else:
            backdrop = "\'" + backdrop + "\'"
    releaseDate = primaryReleaseDate
    if releaseDate != "NULL":
        if releaseDate is None or releaseDate == "":
            releaseDate = "NULL"
        else:
            releaseDate = "\'" + releaseDate + "\'"
    overview = movieDetails.get("overview", "NULL")
    if overview != "NULL":
        if overview is None or overview == "":
            overview = "NULL"
        else:
            overview = overview.replace("'", "''")
            overview = "\'" + overview + "\'"
    poster = movieDetails.get("poster", "NULL")
    if poster != "NULL":
        if poster is None or poster == "":
            poster = "NULL"
        else:
            poster = "\'" + poster + "\'"
    status = movieDetails.get("status", "NULL")
    if status != "NULL":
        if status is None or status == "":
            status = "NULL"
        else:
            status = "\'" + status + "\'"
    homepage = movieDetails.get("homepage", "NULL")
    if homepage != "NULL":
        if homepage is None or homepage == "":
            homepage = "NULL"
        else:
            homepage = "\'" + homepage + "\'"
    imdb_id = movieDetails.get("imdb_id", "NULL")
    if imdb_id != "NULL":
        if imdb_id is None or imdb_id == "":
            imdb_id = "NULL"
        else:
            imdb_id = "\'" + imdb_id + "\'"
    original_language = movieDetails.get("original_language", "NULL")
    if original_language != "NULL":
        if original_language is None or original_language == "":
            original_language = "NULL"
        else:
            original_language = "\'" + original_language + "\'"
    # premiereReleaseDate
    premiereReleaseDate = releaseDateByType.get(1, "NULL")
    if premiereReleaseDate != "NULL":
        if premiereReleaseDate is None or premiereReleaseDate == "":
            premiereReleaseDate = "NULL"
        else:
            premiereReleaseDate = "\'" + premiereReleaseDate + "\'"
    # theaterLimitedReleaseDate
    theaterLimitedReleaseDate = releaseDateByType.get(2, "NULL")
    if theaterLimitedReleaseDate != "NULL":
        if theaterLimitedReleaseDate is None or theaterLimitedReleaseDate == "":
            theaterLimitedReleaseDate = "NULL"
        else:
            theaterLimitedReleaseDate = "\'" + theaterLimitedReleaseDate + "\'"
    # theaterReleaseDate
    theaterReleaseDate = releaseDateByType.get(3, "NULL")
    if theaterReleaseDate != "NULL":
        if theaterReleaseDate is None or theaterReleaseDate == "":
            theaterReleaseDate = "NULL"
        else:
            theaterReleaseDate = "\'" + theaterReleaseDate + "\'"
    # digitalReleaseDate
    digitalReleaseDate = releaseDateByType.get(4, "NULL")
    if digitalReleaseDate != "NULL":
        if digitalReleaseDate is None or digitalReleaseDate == "":
            digitalReleaseDate = "NULL"
        else:
            digitalReleaseDate = "\'" + digitalReleaseDate + "\'"
    # physicalReleaseDate
    physicalReleaseDate = releaseDateByType.get(5, "NULL")
    if physicalReleaseDate != "NULL":
        if physicalReleaseDate is None or physicalReleaseDate == "":
            physicalReleaseDate = "NULL"
        else:
            physicalReleaseDate = "\'" + physicalReleaseDate + "\'"
    # tvReleaseDate
    tvReleaseDate = releaseDateByType.get("1", "NULL")
    if tvReleaseDate != "NULL" or tvReleaseDate == "":
        if tvReleaseDate is None:
            tvReleaseDate = "NULL"
        else:
            tvReleaseDate = "\'" + tvReleaseDate + "\'"

    result = ("(" +  movieTitle + ", " + movieDetails.get("revenue", "NULL") + ", " + directorString
              + ", " + movieDetails.get("runtime", "NULL") + ", " + ratingString + ", " + trailerString
              + ", " + backdrop + ", " + releaseDate + ", " + overview + ", " + poster + ", " + premiereReleaseDate
              + ", " + theaterLimitedReleaseDate + ", " + theaterReleaseDate + ", " + digitalReleaseDate
              + ", " + physicalReleaseDate + ", " + tvReleaseDate + ", " + status + ", " + homepage + ", "
              + imdb_id + ", " + movieDetails.get("id", "NULL") + ", " + original_language + ")")

    updateResult = ("title=" +  movieTitle + ", revenue=" + movieDetails.get("revenue", "NULL") + ", director=" + directorString
              + ", \"runTime\"=" + movieDetails.get("runtime", "NULL") + ", rating=" + ratingString + ", trailer=" + trailerString
              + ", \"backgroundImage\"=" + backdrop + ", \"releaseDate\"=" + releaseDate + ", overview=" + overview + ", poster=" + poster
              + ", \"premiereReleaseDate\"=" + premiereReleaseDate + ", \"theaterLimitedReleaseDate\"=" + theaterLimitedReleaseDate +
               ", \"theaterReleaseDate\"=" + theaterReleaseDate + ", \"digitalReleaseDate\"=" + digitalReleaseDate
              + ", \"physicalReleaseDate\"=" + physicalReleaseDate + ", \"tvReleaseDate\"=" + tvReleaseDate + ", status=" + status
              + ", homepage=" + homepage + ", imdb_id=" + imdb_id + ", tmdb_id=" + movieDetails.get("id", "NULL") + ", \"originalLanguage\"=" + original_language)

    return {"insert":result, "update":updateResult}


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
        movieDetails.update({"imdb_id":results.get("imdb_id", "NULL")})
        movieDetails.update({"original_language":results.get("original_language", "NULL")})

if __name__ == '__main__':
    controllerFunction()
    #with open('C:/Users/mstro/Documents/React-Movie-App/test.json', encoding='utf-8') as f:
    #    data = json.load(f)
    #    result = parseMovieResults(data)
