import psycopg2
import requests
import json
from datetime import date
from config import config

def connect():
    connection = None
    print("Connecting to database")
    try:
        # get the connection parameters
        params = config()

        print("Connection to the PostgreSQL database...")
        connection = psycopg2.connect(**params)
        # automatically commit changes
        connection.autocommit = True
        cur = connection.cursor()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        if connection is not None:
            connection.close()
            print('Database connection closed')
        return [None]

    return [connection, cur]


def insertMovie(result):
    print("inserting movie")
    try:
        cur.execute("""INSERT INTO public.movies(
                    id, revenue, title, director, "runTime", rating, trailer, "backgroundImage", "releaseDate", overview, poster)
                    VALUES """ + result + """;""")
        # not sure if cursor should always be open??
        # cur.close?
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return False

    return True

def insertGenres():
    print("inserting genres")

def disconnect(connection, cur):
    print("Disconnectiong from database")
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
    maxLoops = 5
    page = 1
    totalPages = 1
    error = False
    # try to connect to the database
    connectionResult = connect()
    connection = connectionResult[0]
    # if connection failed, return
    if connection is None:
        return;
    curser = connection[1]

    while page < totalPages and page < maxLoops and not error:
        movieListResult = getMovies(page)
        if movieListResult["success"]:
            page = page + 1
            movieListResults = movieListResult.get("result")
            # get the total number of pages that there are
            totalPages = movieListResults.get("total_pages", 0)
            resultCount = movieListResults.get("total_results", 0)
            if resultCount > 0:
                movies = movieListResults.get("results")
                if movies is not None:
                    for movie in movies:
                        id = movie.get("id")
                        if id is not None:
                            movieDetails = getMovieDetails(id)
                            if movieDetails["success"]:
                                movieDetailsResult = get("result")
                                parseResults = parseMovieResults(movieDetailsResult)
                                insertResult = insertMovie(parseResults["movieValue"])
                                if not insertResult:
                                    # if some database error occurred
                                    error = True
                                    break
                                genreResult = insertGenres(parseResults["genreValue"])
                                if not genreResult:
                                    # if some database error occurred
                                    error = True
                                    break
                            else:
                                # request failed due to unknown cause or authentication error
                                error = True
                                # break out of for loop
                                break
                else:
                    print "No movies found in movie list"
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

# function to send api call to get the list of movies
def getMovies(page):
        day = date.today().strftime("%Y-%m-%d")
        print(day)
        startDate = day
        endDate = day
        url = ("https://api.themoviedb.org/3/discover/movie?"
            + "api_key=9687aa5fa5dc35e0d5aa0c2a3c663fcc&language=en-US&region=US&sort_by=popularity.desc&"
            + "certification_country=US&with_release_type=3|2|1|5|4|6&include_adult=false&include_video=false&page=" + page + "&"
            + "primary_release_date.gte=" + startDate + "&primary_release_date.lte=" + endDate + "&with_original_language=en")
        success = False
        try:
            result = requests.get(url, timeout=1)
            status = result.status_code
            jsonResult = result.json()
            if status == 200:
                succsess = True
            else:
                print("Failed to get the list of movies to pull details for")
                print("Status code: " + status)
                if status == 401:
                    print("Status message: " + jsonResult.get("status_message")
                    # need to return some flag to say don't continue
                elif status === 404:
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
        finally:
            print("Done getting the movie list")
        if success:
            return {"success": True, "result":jsonResult}
        else
            return {"success":False}

# function to send api call to get movie details
def getMovieDetails(movieId):
    url = ("https://api.themoviedb.org/3/movie/" + movieId + "?api_key=9687aa5fa5dc35e0d5aa0c2a3c663fcc" +
           "&language=en-US&region=US&include_image_language=en&append_to_response=videos%2Crelease_dates%2C" +
           "credits%2Cimages%2Cwatch%2Fproviders%2Cexternal_ids")
    success = False
    try:
        result = requests.get(url, timeout=1)
        status = result.status_code
        jsonResult = result.json()
        if status == 200:
            succsess = True
        else:
            print("Failed to get movie details from API")
            print("Status code: " + status)
            if status == 401:
                print("Status message: " + jsonResult.get("status_message")
            elif status === 404:
                print("Status message: " + jsonResult.get("status_message"))
                # if here, request may have failed as movie does not exist so just continue
                success = True
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
    if success:
        return {"success": True, "result":jsonResult}
    else
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
    print(releaseDateByType)
    print(rating)
    print(trailer)
    print(director)
    print(rentProviders)
    print(buyProviders)
    print(externalIds)
    print(genres)
    print(movieDetails)
    movieValue = generateSQL(releaseDateByType, rating, trailer, director, rentProviders, buyProviders, externalIds, genres, movieDetails)
    #genreValue = ...
    return {"movieValue":movieValue}


def generateSQL(releaseDateByType, rating, trailer, director, rentProviders, buyProviders, externalIds, genres, movieDetails):
    movieTitle = movieDetails.get("title", "NULL")
    if movieTitle != "NULL":
        movieTitle = "\'" + movieTitle + "\'"
    directorString = director
    if directorString != "NULL":
        directorString = "\'" + director + "\'"
    ratingString = rating
    if ratingString != "NULL":
        ratingString = "\'" + rating + "\'"
    trailerString = trailer
    if trailerString != "NULL":
        trailerString = "\'" + trailer + "\'"
    backdrop = movieDetails.get("backdrop", "NULL")
    if backdrop != "NULL":
        backdrop = "\'" + backdrop + "\'"
    releaseDate = movieDetails.get("releaseDate", "NULL")
    if releaseDate != "NULL":
        releaseDate = "\'" + releaseDate + "\'"
    overview = movieDetails.get("overview", "NULL")
    if overview != "NULL":
        overview = "\'" + overview + "\'"
    poster = movieDetails.get("poster", "NULL")
    if poster != "NULL":
        poster = "\'" + poster + "\'"
    result = ("(" + movieDetails.get("id", "NULL") + ", "+ movieDetails.get("revenue", "NULL") + ", " +  movieTitle + ", " +
             directorString + ", " + movieDetails.get("runtime", "NULL") + ", " + ratingString + ", " +
             trailerString + ", " + backdrop + ", " + releaseDate + ", " + overview + ", " + poster + ")")
    print(result)
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
    with open('C:/Users/mstro/Documents/React-Movie-App/test.json', encoding='utf-8') as f:
        data = json.load(f)
        result = parseMovieResults(data)
        #connect(result)
