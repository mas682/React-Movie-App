let moment = require('moment');
const Op = require('Sequelize').Op;
const movie = (sequelize, DataTypes) => {
    const Movie = sequelize.define('movie', {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        revenue: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        director: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        runTime: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        rating: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        trailer: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        backgroundImage: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        releaseDate: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          get() {
              return moment(this.getDataValue('releaseDate')).format('MMMM D, YYYY');
          }
        },
        overview: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        poster: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        premiereReleaseDate: {
          type: DataTypes.DATEONLY,
          allowNull: true
        },
        theaterLimitedReleaseDate: {
          type: DataTypes.DATEONLY,
          allowNull: true
        },
        theaterReleaseDate: {
          type: DataTypes.DATEONLY,
          allowNull: true
        },
        digitalReleaseDate: {
          type: DataTypes.DATEONLY,
          allowNull: true
        },
        physicalReleaseDate: {
          type: DataTypes.DATEONLY,
          allowNull: true
        },
        tvReleaseDate: {
          type: DataTypes.DATEONLY,
          allowNull: true
        },
        status: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        homepage: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        imdb_id: {
          type: DataTypes.STRING(100),
          allowNull: true,
          unique: "movies_imdb_id_key"
        },
        tmdb_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: "movies_tmdb_id_key"
        },
        originalLanguage: {
          type: DataTypes.STRING(20),
          allowNull: true
        },
        userRating: {
          type: DataTypes.DECIMAL,
          allowNull: false,
          defaultValue: 0.0
        },
        totalUserRatings: {
          type: DataTypes.BIGINT,
          allowNull: false,
          defaultValue: 0
        }
      }, {
        sequelize,
        tableName: 'movies',
        schema: 'public',
        hasTrigger: true,
        timestamps: true,
        indexes: [
          {
            name: "movies_imdb_id_key",
            unique: true,
            fields: [
              { name: "imdb_id" },
            ]
          },
          {
            name: "movies_pkey",
            unique: true,
            fields: [
              { name: "id" },
            ]
          },
          {
            name: "movies_tmdb_id_key",
            unique: true,
            fields: [
              { name: "tmdb_id" },
            ]
          },
        ]
      });


    Movie.associate = models => {
        // each movie can be associated with many reviews
        Movie.hasMany(models.Review, {foreignKey: "movieId"});
        Movie.hasOne(models.FeaturedMovies, {foreignKey: "movieId"});
        // each movie can have many genres
        Movie.belongsToMany(models.Genre, {through: models.MovieGenreTable, foreignKey: "movieId", otherKey: "GenreId" });
        Movie.belongsToMany(models.User, {as: "UserWatchLists", through: models.UserWatchList, foreignKey: "movieId", otherKey: "userId", onDelete: 'CASCADE'});
        Movie.belongsToMany(models.User, {as: "UsersWhoWatched", through: models.UsersWhoWatched, foreignKey: "movieId", otherKey: "userId", onDelete: 'CASCADE'});
        Movie.hasMany(models.MovieGenreTable, { as: "MovieGenreTables", foreignKey: "movieId"});
        Movie.hasMany(models.UserWatchList, {foreignKey: "movieId"});
        Movie.hasMany(models.UsersWhoWatched, {foreignKey: "movieId"});
        // each movie can be associated with one featured movie
        Movie.hasMany(models.Review, {foreignKey: "movieId"});
    };

    // function to get a movie and include a specific user who has it on their watch list
    Movie.getMovieWithUserWatchList = async (movieId, userId, models) =>
    {
        return Movie.findOne({
            where: {id: movieId},
            include: [
                {
                    model: models.User,
                    as: "UserWatchLists",
                    where: {id: userId},
                    required: false
                }
            ]
        });
    };

    // function to get a movie and include a specific user who has watched it
    Movie.getMovieWtithUserWatched = async (movieId, userId, models) =>
    {
        return Movie.findOne({
            where: {id: movieId},
            include: [
                {
                    model: models.User,
                    as: "UsersWhoWatched",
                    where: {id: userId},
                    required: false
                }
            ]
        });
    };

    // function to handle the releaseDateFilters based off the query string passed in
    // key is the type of filter
    // value is the value to filter for
    // releaseDateArrayGtLt is the array holding the greater than and less than times
    // releaseDateArray is the array to hold exact date matches
    // returns true if the key passed in is one that can be used
    // returns false if the key is invalid
    const releaseDateHandler = (key, value, releaseDateArrayGtLt, releaseDateArrayEq, releaseDateArrayNe, greaterThanDate, lessThanDate) =>
    {
        if(key === "release_date_gte")
        {
            let values = value.split(",");
            if(values.length > 1)
            {
                return [false, "Multiple values for " + key + " found: " + value];
            }
            value = values[0];

            // validate the date
            let valid = moment(value, "YYYY-MM-DD", true).isValid();
            if(!valid)
            {
                return [false, "Invalid release date format for: " + key + "=" + value];
            }
            releaseDateArrayGtLt.push({[Op.gte]: value});
            let date = new Date(value);
            date.setUTCHours(12);
            greaterThanDate.push(date);
        }
        else if(key === "release_date_lte")
        {
            let values = value.split(",");
            if(values.length > 1)
            {
                return [false, "Multiple values for " + key + " found: " + value];
            }
            value = values[0];
            // validate the date
            let valid = moment(value, "YYYY-MM-DD", true).isValid();
            if(!valid)
            {
                return [false, "Invalid release date format for: " + key + "=" + value];
            }
            let date = new Date(value);
            date.setUTCHours(12);
            lessThanDate.push(date);
            releaseDateArrayGtLt.push({[Op.lte]: value});
        }
        else if(key === "release_date_eq")
        {
            let valid;
            let values = value.split(",");
            for(let date of values){
                // validate the date
                let valid = moment(date, "YYYY-MM-DD", true).isValid();
                if(!valid)
                {
                    return [false, "Invalid release date format for: " + key + "=" + value];
                }
                releaseDateArrayEq.push({[Op.eq]: date});
            };
        }
        else if(key === "release_date_ne")
        {
            let valid;
            let values = value.split(",");
            for(let date of values){
                // validate the date
                valid = moment(date, "YYYY-MM-DD", true).isValid();
                if(!valid)
                {
                    return [false, "Invalid release date format for: " + key + "=" + value];
                }
                releaseDateArrayNe.push({[Op.ne]: date});
            };
        }
        else
        {
            return [false, key + " is not a valid query parameter"];
        }
        return [true];
    }

    // function to handle the title search filters based off the query string passed in
    // key is the type of filter
    // value is the value to filter for
    // titleEqualsValue is used for exact matches
    // titleContainsArray is used for to hold filters for titles start with, contain, or end with
    const titleHandler = (key, value, titleEqualsValue, titleContainsArray) =>
    {
        if(key === "title_equals")
        {
            let values = value.split(",");
            values.forEach((title) => {
                titleEqualsValue.push({[Op.iLike]: title});
            });
        }
        else if(key === "title_starts_with")
        {
            let values = value.split(",");
            values.forEach((title) => {
                titleContainsArray.push({[Op.iLike]: title + "%"});
            });
        }
        else if(key === "title_contains")
        {
            let values = value.split(",");
            values.forEach((title) => {
                titleContainsArray.push({[Op.iLike]: "%" + title + "%"});
            });
        }
        else if(key === "title_ends_with")
        {
            let values = value.split(",");
            values.forEach((title) => {
                titleContainsArray.push({[Op.iLike]: "%" + title});
            });
        }
        else
        {
            return [false, key + " is not a valid query parameter"];
        }
        return [true];
    }

    // function to handle the director search filters based off the query string passed in
    // key is the type of filter
    // value is the value to filter for
    // directorEqualsArray is used for exact matches
    // directoryContainsArray is used for to hold filters for director start with, contain, or end with
    const directorHandler = (key, value, directorContainsArray, directorEqualsArray) => {
        if(key === "director_equals")
        {
            let values = value.split(",");
            for(let director of values) {
                directorEqualsArray.push({[Op.iLike]: director});
            };
        }
        else if(key === "director_starts_with")
        {
            let values = value.split(",");
            for(let director of values) {
                directorContainsArray.push({[Op.iLike]: director + "%"});
            };
        }
        else if(key === "director_contains")
        {
            let values = value.split(",");
            for(let director of values) {
                directorContainsArray.push({[Op.iLike]: "%" + director + "%"});
            };
        }
        else if(key === "director_ends_with")
        {
            let values = value.split(",");
            for(let director of values) {
                directorContainsArray.push({[Op.iLike]: "%" + director});
            };
        }
        else
        {
            return [false, key + " is not a valid query parameter"];
        }
        return [true];
    }

    // function to handle the rating search filters based off the query string passed in
    // key is the type of filter
    // value is the value to filter for
    // ratingMatchArray is used for exact matches
    // ratingNotEqualsArray is used for exact matches that are not wanted
    // ratingNull is used to filter showing null/not null ratings
    // showNull holds a boolean as to whether or not to show null or not null
    const ratingHandler = (key, value, ratingMatchArray, ratingNotEqualsArray, ratingNull, showNull) => {
        if(key === "rating_equals")
        {
            let values = value.split(",");
            for(let rating of values) {
                ratingMatchArray.push({[Op.iLike]: rating});
            }
        }
        else if(key === "rating_ne")
        {
            let values = value.split(",");
            for(let rating of values) {
                ratingNotEqualsArray.push({[Op.notILike]: rating});
            }
        }
        else if(key === "ratings_include_null")
        {
            let values = value.split(",");
            if(values.length > 1)
            {
                return [false, "Multiple values for " + key + " found: " + value];
            }
            value = values[0];
            if(value === "true")
            {
                ratingNull.push({[Op.is]: null});
                showNull.push(true);
            }
            else if(value === "false")
            {
                ratingNull.push({[Op.not]: null});
                showNull.push(false);
            }
            else
            {
                return [false, "Invalid value for " + key + "=" + value];
            }
        }
        else
        {
            return [false, key + " is not a valid query parameter"];
        }
        return [true];
    }

    // function to handle the runtime search filters based off the query string passed in
    // key is the type of filter
    // value is the value to filter for
    const runTimeHandler = (key, value, runTimeArray, lessThanTime, greaterThanTime) => {
        if(key === "runtime_lte")
        {
            let values = value.split(",");
            if(values.length > 1)
            {
                return [false, "Multiple values for " + key + " found: " + value];
            }
            // need the first one for cases like '123a', need the second one for empty strings
            if(isNaN(value) || value.length < 1)
            {
                return [false, "The value found for " + key + " is not a valid number: " + value];
            }
            runTimeArray.push({[Op.lte]: value});
            lessThanTime.push(parseInt(value));
        }
        else if(key === "runtime_gte")
        {
            let values = value.split(",");
            if(values.length > 1  || value.length < 1)
            {
                return [false, "Multiple values for " + key + " found: " + value];
            }
            if(isNaN(value))
            {
                return [false, "The value found for " + key + " is not a valid number: " + value];
            }
            runTimeArray.push({[Op.gte]: value});
            greaterThanTime.push(parseInt(value));
        }
        else
        {
            return [false, key + " is not a valid query parameter"];
        }
        return [true];
    }

    const generateReleaseDateFilter = (releaseDateArrayEq, releaseDateArrayNe, releaseDateArrayGtLt, lessThanDate, greaterThanDate, releaseDateArray) =>
    {
        let tempArray = [];
        // if there are exact dates to match
        if(releaseDateArrayEq.length > 0)
        {
            tempArray.push({[Op.or]: releaseDateArrayEq});
        }
        // if there are exact dates to ignore
        if(releaseDateArrayNe.length > 0)
        {
            tempArray.push({[Op.and]: releaseDateArrayNe});
        }
        if(lessThanDate.length > 0 || greaterThanDate.length > 0)
        {
            if(lessThanDate.length > 0 && greaterThanDate.length > 0)
            {
                if(greaterThanDate[0].getTime() <= lessThanDate[0].getTime())
                {
                    tempArray.push({[Op.and]: releaseDateArrayGtLt});
                }
                else
                {
                    tempArray.push({[Op.or]: releaseDateArrayGtLt});
                }
            }
            else
            {
                // if here, only 1 of the two dates specified
                tempArray.push({[Op.or]: releaseDateArrayGtLt});
            }
        }
        if(tempArray.length > 0)
        {
            return {releaseDate: {[Op.and]: tempArray}};
        }
        return undefined;
    }

    const generateTitleFilter = (titleEqualsValue, titleContainsArray) =>
    {
        let tempArray = [];
        // if looking for a exact title
        if(titleEqualsValue.length > 0)
        {
            if(titleContainsArray.length > 0)
            {
                tempArray.push({[Op.or]: titleContainsArray});
            }
            tempArray.push({[Op.or]: titleEqualsValue});
            return {title: {[Op.and]: tempArray}};
        }
        else if(titleContainsArray.length > 0)
        {
            return {title: {[Op.or]: titleContainsArray}};
        }
        return undefined;
    }

    const generateDirectorFilter = (directorEqualsArray, directorContainsArray) =>
    {
        let tempArray = [];
        // if looking for a exact director
        if(directorEqualsArray.length > 0)
        {
            if(directorContainsArray.length > 0)
            {
                tempArray.push({[Op.or]: directorContainsArray});
            }
            tempArray.push({[Op.or]: directorEqualsArray});
            return {director: {[Op.and]: tempArray}};
        }
        else if(directorContainsArray.length > 0)
        {
            return {director: {[Op.or]: directorContainsArray}};
        }
        return undefined;
    }

    const generateRatingFilter = (ratingMatchArray, ratingNotEqualsArray, ratingNull, showNull) =>
    {
        let tempArray = [];
        // if specifiying null or not null movies
        if(ratingMatchArray.length > 0)
        {
            tempArray.push({[Op.or]: ratingMatchArray});
        }
        if(ratingNotEqualsArray.length > 0)
        {
            tempArray.push({[Op.and]: ratingNotEqualsArray});
        }
        if(ratingNull.length > 0)
        {
            tempArray.push({[Op.and]: ratingNull});
            if(showNull[0])
            {
                return {rating: {[Op.or]: tempArray}};
            }
            else
            {
                return {rating: {[Op.and]: tempArray}};
            }
        }
        else if(ratingNotEqualsArray.length > 0 || ratingMatchArray.length > 0)
        {
            return {rating: {[Op.or]: tempArray}};
        }
        return undefined;
    }

    const generateRunTimeFilters = (runTimeArray, greaterThanTime, lessThanTime) =>
    {
        if(greaterThanTime.length > 0 && lessThanTime.length > 0)
        {
            if(greaterThanTime[0] < lessThanTime[0])
            {
                return {runTime: {[Op.and]: runTimeArray}};
            }
            else
            {
                return {runTime: {[Op.or]: runTimeArray}};
            }
        }
        else if(greaterThanTime.length > 0 || lessThanTime.length > 0)
        {
            return {runTime: {[Op.or]: runTimeArray}};
        }
        return undefined;
    }

    const movieWhereGenerator = (query, sortKeys) =>
    {
        let filters = [];
        let keys = Object.keys(query);
        let numKeys = keys.length;
        let counter = 0;
        let key = "";
        let value = "";
        // release date variables
        let releaseDateArrayEq = [];
        let releaseDateArrayNe = [];
        let releaseDateArrayGtLt = [];
        let lessThanDate = [];
        let greaterThanDate = [];
        // title variables
        let titleContainsArray = [];
        let titleEqualsValue = [];
        // director variables
        let directorContainsArray = [];
        let directorEqualsArray = [];
        // rating variables
        let ratingMatchArray = [];
        let ratingNotEqualsArray = [];
        let ratingNull = [];
        let showNull = [];
        // runtime variables
        let runTimeArray = [];
        let lessThanTime = [];
        let greaterThanTime = [];
        let result = false;
        let titleToSearchForFound = false;
        while(counter < numKeys)
        {
            key = keys[counter];
            value = decodeURIComponent(query[key]);
            if(key.startsWith("release"))
            {
                result = releaseDateHandler(key, value, releaseDateArrayGtLt, releaseDateArrayEq, releaseDateArrayNe, greaterThanDate, lessThanDate);
                if(!result[0])
                {
                    return result;
                }
            }
            else if(key.startsWith("title"))
            {
                result = titleHandler(key, value, titleEqualsValue, titleContainsArray);
                if(!result[0])
                {
                    return result;
                }
                else
                {
                    titleToSearchForFound = true;
                }
            }
            else if(key.startsWith("director"))
            {
                result = directorHandler(key, value, directorContainsArray, directorEqualsArray);
                if(!result[0])
                {
                    return result;
                }
            }
            else if(key.startsWith("rating"))
            {
                result = ratingHandler(key, value, ratingMatchArray, ratingNotEqualsArray, ratingNull, showNull);
                if(!result[0])
                {
                    return result;
                }
            }
            else if(key.startsWith("runtime"))
            {
                result = runTimeHandler(key, value, runTimeArray, lessThanTime, greaterThanTime);
                if(!result[0])
                {
                    return result;
                }
            }
            else if(key.startsWith("sort"))
            {
                sortKeys.push(key);
            }
            else
            {
                if(!key.startsWith("genre_contains") && !key.startsWith("max") && !key.startsWith("offset"))
                {
                    return [false, key + " is not a valid query parameter"];
                }
            }
            counter = counter + 1;
        }

        let releaseDateFilters = generateReleaseDateFilter(releaseDateArrayEq, releaseDateArrayNe, releaseDateArrayGtLt, lessThanDate, greaterThanDate);
        if(releaseDateFilters !== undefined)
        {
            filters.push(releaseDateFilters);
        }
        let titleFilters = generateTitleFilter(titleEqualsValue, titleContainsArray);
        if(titleFilters !== undefined)
        {
            filters.push(titleFilters);
        }
        let directorFilters = generateDirectorFilter(directorEqualsArray, directorContainsArray);
        if(directorFilters !== undefined)
        {
            filters.push(directorFilters);
        }
        let ratingFilters = generateRatingFilter(ratingMatchArray, ratingNotEqualsArray, ratingNull, showNull);
        if(ratingFilters !== undefined)
        {
            filters.push(ratingFilters);
        }
        let runTimeFilters = generateRunTimeFilters(runTimeArray, greaterThanTime, lessThanTime);
        if(runTimeFilters !== undefined)
        {
            filters.push(runTimeFilters);
        }
        return [true,filters, titleToSearchForFound];
    }

    // function to generate the where values to get the movies
    // with the specified genres
    const genreWhereGenerator = (query) =>
    {
        let containsFilters = [];
        let genreContainsArray = [];
        let valueString = decodeURIComponent(query["genre_contains"]);
        if(valueString === undefined)
        {
            return [];
        }
        else
        {
            let values = valueString.split(",");
            values.forEach((value) => {
                genreContainsArray.push({[Op.iLike]: value});
            });
        }
        if(genreContainsArray.length > 0)
        {
            containsFilters = [{value: {[Op.or]: genreContainsArray} }];
        }

        return containsFilters;
    }

    const sortGenerator = (query, valueFound) =>
    {
        let sortingArray = [];
        let valueString = decodeURIComponent(query["sort"]);
        let values = valueString.split(",");
        let bestMatch = false;
        for(let value of values) {
            if(value === "release_date_asc")
            {
                sortingArray.push(['releaseDate', 'ASC'])
            }
            else if(value === "release_date_desc")
            {
                sortingArray.push(['releaseDate', 'DESC']);
            }
            else if(value === "title_asc")
            {
                sortingArray.push(['title', 'ASC']);
            }
            else if(value === "title_desc")
            {
                sortingArray.push(['title', 'DESC']);
            }
            else if(value === "runtime_asc")
            {
                sortingArray.push(['runTime', 'ASC']);
            }
            else if(value === "runtime_desc")
            {
                sortingArray.push(['runTime', 'DESC']);
            }
            else if(value === "rating_asc")
            {
                sortingArray.push(['rating', 'ASC']);
            }
            else if(value === "rating_desc")
            {
                sortingArray.push(['rating', 'DESC']);
            }
            else if(value === "director_asc")
            {
                sortingArray.push(['director', 'ASC']);
            }
            else if(value === "director_desc")
            {
                sortingArray.push(['director', 'DESC']);
            }
            else if(value === "title_best_match")
            {
                // sort by exact match, starts with, contains, and then ends with
                // if string was passed in to search for
                if(valueFound)
                {
                    bestMatch = true;
                }
                else
                {
                    return [false,"Sorting value invalid: " + value + " as no value to search for found"];
                }
            }
            else
            {
                return [false,"Sorting value invalid: " + value];
            }
        };
        return [true,sortingArray, bestMatch];
    }

    Movie.queryMovies = async (models, query, user, max, offset) =>
    {
        let sortKeys = [];
        // get the filters for the movies where variable
        // this will also find any invalid parameter keys
        let whereQueries = movieWhereGenerator(query, sortKeys);
        // if an error was found
        if(!whereQueries[0])
        {
            return whereQueries;
        }
        let genreWhere = [];
        if(query["genre_contains"] !== undefined)
        {
            genreWhere = genreWhereGenerator(query);
        }
        // movie ids that contain the genres
        let movieIds = [];
        // if genre filters
        if(genreWhere.length > 0)
        {
            // get the movies with the specified genres
            let movies = await Movie.findAll({
                attributes: ["id"],
                include: [
                    {
                        model: models.Genre,
                        as: "Genres",
                        attributes: ["value"],
                        through: {attributes: []},
                        where: genreWhere
                    }
                ],
            });
            // get the movie ids that contain that genre
            movies.forEach((movie) => {
                movieIds.push(movie.id);
            });
        }
        // if there are specific movie ids that contain the genre, add the filter
        if(movieIds.length > 0)
        {
            whereQueries[1].push({id: {[Op.in]: movieIds}});
        }
        let newquery = {[Op.and]: whereQueries[1]};
        let sortOrder = [];
        if(query["sort"] !== undefined)
        {
            // also passing a boolean for if a title was found to search for
            let sort = sortGenerator(query, whereQueries[2]);
            if(!sort[0])
            {
                return sort;
            }
            sortOrder = sort[1];
        }
        let genreQuery = {
                model: models.Genre,
                as: "Genres",
                attributes: ["id", "value"],
                through: {
                    attributes: [],
                    where: {}
                }
            };
        let includeArray = [genreQuery];
        if(user !== undefined)
        {
            includeArray.push({
                model: models.User,
                as: "UserWatchLists",
                required: false,
                where: {
                    username: user
                }
            });
            includeArray.push({
                model: models.User,
                as: "UsersWhoWatched",
                required: false,
                where: {
                    username: user
                }
            });
        }
        let params = {
            include: includeArray,
            order: sortOrder,
            where: newquery,
            limit: max,
            offset: offset,
        };

        let movies2 = await Movie.findAll(params);
        return [true, movies2];
    }

    // function to get the information for a individual movie
    Movie.getMovieInfo = async (id, models, username) =>
    {

        let includeArray = [];
        includeArray.push({
            model: models.Genre,
            as: "Genres",
            attributes: ["id", "value"],
            through: {attributes: []}
        });
        if(username !== undefined)
        {
            includeArray.push({
                model: models.User,
                as: "UserWatchLists",
                required: false,
                where: {
                    username: username
                }
            });
            includeArray.push({
                model: models.User,
                as: "UsersWhoWatched",
                required: false,
                where: {
                    username: username
                }
            });
        }
        let movie = await Movie.findOne({
            where: {
              id: id
            },
            include: includeArray
        });
        return movie;
    }

    // function to get movies for the review form
    // only want title, id, and picture
    Movie.findByTitle= async (title, count, offset) =>
    {
        // ends with probably not needed
        let endsWith = "%" + title;
        let contains = "%" + title + "%";
        let startsWith = title + "%";
        let movies = await Movie.findAll({
            limit: count,
            offset: offset,
            where: {
                title: {
                    [Op.or]: [title, {[Op.iLike]: startsWith}, {[Op.iLike]: contains},  {[Op.iLike]: endsWith}]
                }
            },
            order:[
                /*
                sequelize.literal(`CASE
                  WHEN upper("movie"."title") = upper('${title}') then 0
                  WHEN upper("movie"."title") LIKE upper('${startsWith}') then 1
                  WHEN upper("movie"."title") LIKE upper('${contains}') then 2
                  ELSE 3
                  END ASC`),
                */
                sequelize.literal(`CASE
                  WHEN upper("movie"."title") = upper('${title}') then 0
                  ELSE 1
                  END ASC`),
                ['title', 'ASC']
            ],
            attributes: ["id", "title", "poster"]
        });
        return movies;
    }

    return Movie;
};

export default movie;
