# 9/19/2021
# Matt Stropkey
# This script is used to pull the latest movies from TMDB
# example command to run:
# ran from the src folder
# python3 -m AutomatedScripts.Scripts.ManualScriptController -path AutomatedScripts.Scripts.TMDB.MovieDataPull

from datetime import date, timedelta, datetime, timezone
import requests
import os
from time import sleep

from AutomatedScripts.shared.config import config

def getMovieListPage(startDate, endDate, apiKey, page):
    url = ("https://api.themoviedb.org/3/discover/movie?api_key=" + apiKey + "&language=en-US"
    + "&region=US&sort_by=popularity.desc&certification_country=US&with_release_type=3|2|1|5|4|6"
    + "&include_adult=false&include_video=false&&with_original_language=en&release_date.gte=" + startDate
    + "&release_date.lte=" + endDate + "&page=" + str(page))
    print("\n********************************************************************************")
    print("Sending request to get a page of movies: ")
    print("Page: " + str(page))
    print("URL: " + url)
    result = requests.get(url, timeout=1)
    status = result.status_code
    jsonResult = result.json()
    if(status != 200):
        raise Exception("Bad status code received from API when retrieving a movie page: " + str(status) + 
        "\nURL: " + url)
    return jsonResult

def getMovieDetailsFromApi(movieId, apiKey):
    movieId = str(movieId)
    url = ("https://api.themoviedb.org/3/movie/" + str(movieId) + "?api_key=" + apiKey + "&language=en-US"
    + "&region=US&include_image_language=en&append_to_response=videos%2Crelease_dates%2Ccredits%2Cimages%2Cexternal_ids")
    print("\n********************************************************************************")
    print("Sending request to get movie details for movie with id of: " + movieId)
    print("URL:" + url)
    result = requests.get(url, timeout=1)
    status = result.status_code
    jsonResult = result.json()
    if(status != 200):
        raise Exception("Bad status code received from API when retrieving a movie details: " + str(status) + 
        "\nURL: " + url)
    return jsonResult
    

# function to pull the release dates out of the json result
def getReleaseDates(releaseDates):
    rating = "NULL"
    releaseDateByType = {}
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
                        releaseDate = item.get("release_date", "NULL")
                        releaseDateByType.update({type:releaseDate})
    return {"rating": rating, "releaseDates": releaseDateByType}


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
            for member in crew:
                if(member.get("job") == "Director"):
                    director = member.get("name", "NULL")
                    break
    return director

# function to get the genres out of the json result
def getGenres(genreList):
    genres = []
    if genreList is not None:
        for genre in genreList:
            value = genre.get("name")
            if value is not None:
                genres.append(value)
    return genres


# function to get the various movie details out of the json result
def parseMovieDetails(results):
    movieDetails = {}
    if results is not None:
        movieDetails.update({"backdrop":results.get("backdrop_path", "NULL")})
        movieDetails.update({"homepage":results.get("homepage", "NULL")})
        movieDetails.update({"id":str(results.get("id", "NULL"))})
        movieDetails.update({"title":results.get("title", "NULL")})
        movieDetails.update({"overview":results.get("overview", "NULL")})
        movieDetails.update({"poster":results.get("poster_path", "NULL")})
        movieDetails.update({"releaseDate":results.get("release_date", "NULL")})
        #movieDetails.update({"revenue":str(results.get("revenue", "NULL"))})
        movieDetails.update({"runtime":str(results.get("runtime", "NULL"))})
        movieDetails.update({"status":results.get("status", "NULL")})
        movieDetails.update({"imdb_id":results.get("imdb_id", "NULL")})
        movieDetails.update({"original_language":results.get("original_language", "NULL")})

    return movieDetails


# dict is the object to pass in, or None
# value is the value to get from the dict or the value to use if
# dict is None
# replaceQuotes is a boolean as to whether or not to replace single quotes with ''
def generateSQLValue(dict, value, replaceQuotes):
    result = value
    # if passing in a dictionary, use it, otherwise use the value passed in
    if dict is not None:
        result = dict.get(value, "NULL")
    if result != "NULL":
        if result is None or result == "":
            result = "NULL"
        else:
            if replaceQuotes:
                result = result.replace("'", "''")
            result = "\'" + result + "\'"
    return result

# function to take movie details and turn it into sql values to insert
def generateSQL(movieDetails):
    movieTitle = generateSQLValue(movieDetails["movieDetails"], "title", True)
    directorString = generateSQLValue(None, movieDetails["director"], True)
    ratingString = generateSQLValue(None, movieDetails["rating"], False)
    trailerString = generateSQLValue(None, movieDetails["trailer"], False)
    backdrop = generateSQLValue(movieDetails["movieDetails"], "backdrop", False)
    releaseDate = generateSQLValue(None, movieDetails["releaseDate"], False)
    overview = generateSQLValue(movieDetails["movieDetails"], "overview", True)
    poster = generateSQLValue(movieDetails["movieDetails"], "poster", False)
    status = generateSQLValue(movieDetails["movieDetails"], "status", False)
    homepage = generateSQLValue(movieDetails["movieDetails"], "homepage", False)
    imdb_id = generateSQLValue(movieDetails["movieDetails"], "imdb_id", False)
    original_language = generateSQLValue(movieDetails["movieDetails"], "original_language", False)
    premiereReleaseDate = generateSQLValue(movieDetails["releaseDates"], 1, False)
    theaterLimitedReleaseDate = generateSQLValue(movieDetails["releaseDates"], 2, False)
    theaterReleaseDate = generateSQLValue(movieDetails["releaseDates"], 3, False)
    digitalReleaseDate = generateSQLValue(movieDetails["releaseDates"], 4, False)
    physicalReleaseDate = generateSQLValue(movieDetails["releaseDates"], 5, False)
    tvReleaseDate = generateSQLValue(movieDetails["releaseDates"], 6, False)

    result = ("(" +  movieTitle + ", " + directorString + ", " + movieDetails["movieDetails"].get("runtime", "NULL") + ", " +
               ratingString + ", " + trailerString + ", " + backdrop + ", " + releaseDate + ", " + overview + ", " + poster +
               ", " + premiereReleaseDate + ", " + theaterLimitedReleaseDate + ", " + theaterReleaseDate + ", " + digitalReleaseDate
              + ", " + physicalReleaseDate + ", " + tvReleaseDate + ", " + status + ", " + homepage + ", "
              + imdb_id + ", " + movieDetails.get("id", "NULL") + ", " + original_language + ")")

    updateResult = ("title=" +  movieTitle + ", director=" + directorString  + ", \"runTime\"=" + movieDetails["movieDetails"].get("runtime", "NULL") +
              ", rating=" + ratingString + ", trailer=" + trailerString + ", \"backgroundImage\"=" + backdrop + ", \"releaseDate\"=" +
              releaseDate + ", overview=" + overview + ", poster=" + poster + ", \"premiereReleaseDate\"=" + premiereReleaseDate +
              ", \"theaterLimitedReleaseDate\"=" + theaterLimitedReleaseDate + ", \"theaterReleaseDate\"=" + theaterReleaseDate +
              ", \"digitalReleaseDate\"=" + digitalReleaseDate + ", \"physicalReleaseDate\"=" + physicalReleaseDate + 
              ", \"tvReleaseDate\"=" + tvReleaseDate + ", status=" + status + ", homepage=" + homepage + ", imdb_id=" + imdb_id + 
              ", tmdb_id=" + movieDetails.get("id", "NULL") + ", \"originalLanguage\"=" + original_language)

    return {"insert":result, "update":updateResult}    

# function to insert movie into db
def insertMovie(insertValue, updateValue, id, db):
    print("Inserting movie into database with id of: " + str(id))
    sql =   """INSERT INTO public."Movies"(
                    title,
                    director,
                    "runTime",
                    rating,
                    trailer,
                    "backgroundImage",
                    "releaseDate", 
                    overview, 
                    poster, 
                    "premiereReleaseDate", 
                    "theaterLimitedReleaseDate",
                    "theaterReleaseDate", 
                    "digitalReleaseDate", 
                    "physicalReleaseDate", 
                    "tvReleaseDate",
                    status, 
                    homepage, 
                    imdb_id, 
                    tmdb_id, 
                    "originalLanguage"
                )
                VALUES """ + insertValue + """
                ON CONFLICT (tmdb_id) DO
                UPDATE SET """ + updateValue + """
                RETURNING id;"""
    
    db._cur.execute(sql)

# function to insert movie genres and associate them to movies
def insertGenres(genres, movieId, db):
    genreSQL = None
    genreString = None
    genreCount = len(genres)
    counter = 0
    # generate the strings needed for the inserts
    while(counter < genreCount):
        genre = genres[counter]
        # replace any ' characters in the string
        genre = genre.replace("'", "''")
        # change the variables to strings
        if(counter == 0):
            genreSQL = ""
            genreString = ""
        if(counter == (genreCount - 1)):
            genreSQL = genreSQL + "('" + genre + "')"
            genreString = genreString + "'" + genre + "'"
        else:
            genreSQL = genreSQL + "('" + genre + "'), "
            genreString = genreString + "'" + genre + "', "

        counter = counter + 1
    
    # if there are genres
    if(genreSQL is not None):
        print("Inserting genres: " + genreString)
        # create the genres
        sql = """
                    INSERT INTO public."Genres"(
                        value
                    )
                    VALUES """ + genreSQL + """
                    ON CONFLICT (value) DO NOTHING;"""
        db._cur.execute(sql)

        # associate the movie with the genres
        sql = """
                    INSERT INTO public."MovieGenres"(
	                    "GenreId",
                        "movieId"
                    )
                    select g."id", m."id"
                    from public."Genres" g
                    join public."Movies" m on m."tmdb_id" = """ +  str(movieId) + """
                    where value in (""" + genreString + """)
                    ON CONFLICT("GenreId","movieId") DO NOTHING;"""
        db._cur.execute(sql)

# function to control parsing of movie data
def getMovieDetails(movie, apiKey):
    id = movie.get("id")
    releaseDate = movie.get("release_date", "NULL")
    result = None
    if(id is not None):
        movieDetails = getMovieDetailsFromApi(id, apiKey)
        result = {}
        result["id"] = str(id)
        result["releaseDate"] = releaseDate
        result["imdb_id"] = movieDetails.get("imdb_id", None)
        # if not in imdb, ignore
        if(result["imdb_id"] is None or result["imdb_id"] == ""):
            return None
        releaseDates = movieDetails.get("release_dates", None)
        ratingsAndReleases = getReleaseDates(releaseDates)
        result["rating"] = ratingsAndReleases["rating"]
        result["releaseDates"] = ratingsAndReleases["releaseDates"]
        videos = movieDetails.get("videos")
        result["trailer"] = getTrailer(videos)
        credits = movieDetails.get("credits")
        result["director"] = getDirector(credits)
        # external ids already formatted
        result["externalIds"] = movieDetails.get("external_ids")
        genreList = movieDetails.get("genres")
        result["genres"] = getGenres(genreList)
        result["movieDetails"] = parseMovieDetails(movieDetails)
    return result  


# function to control the whole process
def getMovies(db, startDate, endDate, jobType):
    environment = os.getenv('ENVIRONMENT')
    container = os.getenv('CONTAINER')
    params = config(environment, container, section='TMDB')
    apiKey = params["key"]
    page = 1
    maxPages = 1
    maxLoops = 1000
    # set to 3 for testing purposes...
    maxLoops = 5
    maxMovies = 0
    movies = None
    movieDetails = None
    sqlValues = None
    moviesInserted = 0
    while(page <= maxPages and page <= maxLoops):
        result = getMovieListPage(startDate, endDate, apiKey, page)
        if(page == 1):
            maxPages = result.get("total_pages", 0)
            maxMovies = result.get("total_results", 0)
            print("Total pages to be processed: " + str(maxPages))
            print("Total movies to be processed: " + str(maxMovies))
            # add and False to test
            if(maxPages > maxLoops and False):
                raise Exception(str(maxPages) + " pages exceeds the maximum loops allowed: " + str(maxLoops))
        movies = result.get("results", [])
        recordCount = len(movies)
        print("Movies found on page " + str(page) + ": " + str(recordCount))
        for movie in movies:
            id = movie.get("id")
            movieDetails = getMovieDetails(movie, apiKey)
            if movieDetails is not None:
                sqlValues = generateSQL(movieDetails)
                insertMovie(sqlValues["insert"], sqlValues["update"], id, db)
                insertGenres(movieDetails["genres"], id, db)
                moviesInserted = moviesInserted + 1
            print("Sleeping for 0.5 seconds")
            sleep(0.5)
        page = page + 1
    
    return moviesInserted



def main(logger, db, extras, jobId, jobDetailsId, arguments):
    print("Getting last run time from the control table...")
    id = "3"
    script = """
        SELECT * FROM private."TMDB_API_Control" 
        where "id" = """ + id + """ and enabled
    """
    db._cur.execute(script)
    result = db._cur.fetchall()
    moviesProcessed = 0
    end = None
    endDate = None
    startDate = None
    lastRun = None
    jobType = None
    for job in result:
        lastRun = job[0]
        # add one as we already have this date
        lastRun = lastRun + timedelta(days=1)
        jobType = job[1]
        startDate = lastRun.strftime("%Y-%m-%d")
        print("Start date: " + startDate)
        end = lastRun + timedelta(days=90)
        endDate = end.strftime("%Y-%m-%d")
        print("End date: " + endDate)
        moviesProcessed = getMovies(db, startDate, endDate, type)

    # update the next job run time
    if(end is not None and lastRun is not None):
        print("\n********************************************************************************")
        print("Total movies processed: " + str(moviesProcessed))
        currentDate = datetime.now(timezone.utc) 
        currentDate = currentDate.replace(hour=0, minute=0, second=0,microsecond=0, tzinfo=None)
        print("Current UTC date: " + str(currentDate))
        print("Current end value: " + str(end))
        if(currentDate > end):
            newLastRun = end
        else:
            newLastRun = currentDate
        print("New last run value: " + str(newLastRun))
        sql = """
            update private."TMDB_API_Control"
            set
                "lastRun" = '""" + str(newLastRun) + """'
            where "id" = """ + id + """ and enabled;
        """
        print("Executing sql to update the last run date on the control table:")
        print(sql)
        db._cur.execute(sql)

    return "Finished Successfully"